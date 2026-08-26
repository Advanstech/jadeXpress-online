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

/**
 * Confirms an Advansis / GT Bank payment — MOCK.
 * A real implementation would verify the transaction reference with the
 * Advansis/GT Bank API before marking the order paid. This mock simply marks
 * the order as paid and records the confirmation in the status history.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { reference, orderNumber } = await req.json();
    if (!reference || !orderNumber) {
      return json({ error: "invalid_payload" }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      return json({ error: "server_misconfigured" }, 500);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { data: order, error: findErr } = await admin
      .from("orders")
      .select("id,status")
      .eq("order_number", orderNumber)
      .eq("payment_reference", reference)
      .maybeSingle();
    if (findErr) return json({ error: "db_error", detail: findErr.message }, 500);
    if (!order) return json({ error: "order_not_found" }, 404);

    const { error: updErr } = await admin
      .from("orders")
      .update({ payment_status: "paid" })
      .eq("id", order.id);
    if (updErr) return json({ error: "db_error", detail: updErr.message }, 500);

    await admin.from("order_status_history").insert([
      {
        order_id: order.id,
        status: order.status,
        note: "Payment confirmed via Advansis (GT Bank).",
      },
    ]);

    return json({ status: "ok", orderNumber });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return json({ error: "server_error", detail: msg }, 500);
  }
});
