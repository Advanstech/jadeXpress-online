import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function sha256Hex(input: string) {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;
const GENERIC_ERROR = "Incorrect email or PIN.";

interface AdminUser {
  id: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, pin } = await req.json();
    if (!email || typeof pin !== "string" || !/^\d{6}$/.test(pin)) {
      return json({ error: GENERIC_ERROR }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      return json({ error: "server_misconfigured" }, 500);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // Look up the auth user by email via the GoTrue admin REST API — the
    // supabase-js admin client has no direct getUserByEmail helper.
    const lookupRes = await fetch(
      `${supabaseUrl}/auth/v1/admin/users?email=${encodeURIComponent(email)}`,
      {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      },
    );
    const lookupJson = await lookupRes.json();
    const authUser: AdminUser | undefined = Array.isArray(lookupJson?.users)
      ? lookupJson.users[0]
      : Array.isArray(lookupJson)
        ? lookupJson[0]
        : undefined;
    if (!authUser?.id) return json({ error: GENERIC_ERROR }, 400);

    const { data: profile, error: pErr } = await admin
      .from("profiles")
      .select("pin_hash,pin_salt,pin_fail_count,pin_locked_until")
      .eq("id", authUser.id)
      .maybeSingle();
    if (pErr) return json({ error: "server_error" }, 500);
    if (!profile?.pin_hash || !profile.pin_salt) {
      return json({ error: "No PIN set up for this account yet." }, 400);
    }

    if (
      profile.pin_locked_until &&
      new Date(profile.pin_locked_until) > new Date()
    ) {
      return json(
        { error: "Too many attempts. Please try again later or use your password." },
        429,
      );
    }

    const computed = await sha256Hex(profile.pin_salt + pin);
    if (computed !== profile.pin_hash) {
      const nextCount = (profile.pin_fail_count ?? 0) + 1;
      const lockedUntil =
        nextCount >= MAX_ATTEMPTS
          ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000).toISOString()
          : null;
      await admin
        .from("profiles")
        .update({ pin_fail_count: nextCount, pin_locked_until: lockedUntil })
        .eq("id", authUser.id);
      return json(
        {
          error: lockedUntil
            ? "Too many attempts. Please try again later or use your password."
            : GENERIC_ERROR,
        },
        400,
      );
    }

    await admin
      .from("profiles")
      .update({ pin_fail_count: 0, pin_locked_until: null })
      .eq("id", authUser.id);

    const { data: linkData, error: linkErr } =
      await admin.auth.admin.generateLink({ type: "magiclink", email });
    if (linkErr || !linkData) return json({ error: "server_error" }, 500);

    const tokenHash = linkData.properties?.hashed_token;
    if (!tokenHash) return json({ error: "server_error" }, 500);

    return json({ status: "ok", email, tokenHash });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return json({ error: "server_error", detail: msg }, 500);
  }
});
