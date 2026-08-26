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

function randomSalt() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { pin } = await req.json();
    if (typeof pin !== "string" || !/^\d{6}$/.test(pin)) {
      return json({ error: "PIN must be exactly 6 digits." }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      return json({ error: "server_misconfigured" }, 500);
    }

    // Identify the signed-in user from the request's JWT.
    const authHeader = req.headers.get("Authorization") ?? "";
    const anon = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await anon.auth.getUser();
    const user = userData.user;
    if (!user) return json({ error: "Please sign in first." }, 401);

    const salt = randomSalt();
    const hash = await sha256Hex(salt + pin);

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });
    const { error } = await admin
      .from("profiles")
      .update({
        pin_hash: hash,
        pin_salt: salt,
        pin_fail_count: 0,
        pin_locked_until: null,
      })
      .eq("id", user.id);
    if (error) return json({ error: error.message }, 500);

    return json({ status: "ok" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return json({ error: "server_error", detail: msg }, 500);
  }
});
