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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { reference, orderNumber } = await req.json();
    if (!reference && !orderNumber) {
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

    let query = admin.from("orders").select("*");
    query = reference
      ? query.eq("payment_reference", reference)
      : query.eq("order_number", orderNumber);
    const { data: order, error } = await query.maybeSingle();
    if (error) return json({ error: "db_error", detail: error.message }, 500);
    if (!order) return json({ status: "not_found" }, 404);

    if (order.payment_status === "paid") {
      return json({ status: "already_paid", orderNumber: order.order_number });
    }

    const secret = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!secret) {
      // Live payments not configured yet. Surface a clear status so the
      // storefront can treat the order as a successful preview order.
      return json({ status: "not_configured", orderNumber: order.order_number });
    }

    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${secret}`,
          "Content-Type": "application/json",
        },
      },
    );
    const verifyJson = await verifyRes.json();
    const paid = verifyJson?.data?.status === "success";
    if (!paid) {
      return json({
        status: "not_paid",
        orderNumber: order.order_number,
        detail: verifyJson?.data?.gateway_response ?? "verification_failed",
      });
    }

    // Mark paid + processing, decrement stock atomically, write history.
    await admin
      .from("orders")
      .update({ status: "processing", payment_status: "paid" })
      .eq("id", order.id);

    await admin.rpc("fulfill_order_stock", { p_order_id: order.id });

    await admin.from("order_status_history").insert([
      {
        order_id: order.id,
        status: "processing",
        note: "Payment confirmed — preparing your order",
      },
    ]);

    return json({ status: "ok", orderNumber: order.order_number });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return json({ error: "server_error", detail: msg }, 500);
  }
});
