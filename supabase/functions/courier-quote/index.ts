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

function rand(prefix: string) {
  const n = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}${n}`;
}

/**
 * Courier quote — MOCK implementation.
 *
 * Once we onboard the courier APIs, replace the logic inside `getQuote` with
 * real calls to Speedaf Express (Ghana) and DHL Express (international) and
 * flip `COURIER_MODE` to "live". The request/response shape stays the same,
 * so the checkout UI won't need to change.
 */
function getQuote(input: {
  country: string;
  subtotal: number;
  weight?: number;
}) {
  const isGhana = (input.country || "").toLowerCase().includes("ghana");
  const subtotal = Number(input.subtotal) || 0;
  const weight = Number(input.weight) || 1;

  if (isGhana) {
    const fee = subtotal >= 500 ? 0 : 35;
    return {
      provider: "Speedaf Express",
      service: "Speedaf Door-to-Door",
      eta: "1–3 business days",
      fee,
      free: fee === 0,
      trackingNumber: rand("SFD-"),
      isGhana: true,
    };
  }
  return {
    provider: "DHL Express",
    service: "DHL Express Worldwide",
    eta: "3–7 business days",
    fee: 120,
    free: false,
    trackingNumber: rand("DHL-"),
    isGhana: false,
    note: `Estimated weight ${weight} kg for international shipment`,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      return json({ error: "server_misconfigured" }, 500);
    }

    const body = await req.json();
    if (!body?.country) return json({ error: "invalid_payload" }, 400);

    const quote = getQuote({
      country: body.country,
      subtotal: body.subtotal,
      weight: body.weight,
    });

    return json({ status: "ok", quote });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return json({ error: "server_error", detail: msg }, 500);
  }
});
