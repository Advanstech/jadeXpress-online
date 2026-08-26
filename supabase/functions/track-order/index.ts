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
    const { orderNumber, email } = await req.json();
    if (!orderNumber || !email) {
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

    // Service-role lookup — keeps the orders table private from anon reads.
    const { data: order, error } = await admin
      .from("orders")
      .select("*")
      .ilike("order_number", orderNumber)
      .ilike("email", email)
      .maybeSingle();
    if (error) return json({ error: "db_error", detail: error.message }, 500);
    if (!order) return json({ status: "not_found" });

    const { data: items, error: iErr } = await admin
      .from("order_items")
      .select("name,price,quantity,image")
      .eq("order_id", order.id);
    if (iErr) return json({ error: "db_error", detail: iErr.message }, 500);

    const { data: timeline } = await admin
      .from("order_status_history")
      .select("status,note,created_at")
      .eq("order_id", order.id)
      .order("created_at", { ascending: true });

    return json({
      status: "ok",
      order: {
        orderNumber: order.order_number,
        email: order.email,
        status: order.status,
        paymentStatus: order.payment_status,
        subtotal: Number(order.subtotal),
        shippingFee: Number(order.shipping_fee),
        total: Number(order.total),
        currency: order.currency,
        shippingAddress: order.shipping_address,
        createdAt: order.created_at,
        items: (items ?? []).map((i) => ({
          name: i.name,
          price: Number(i.price),
          quantity: i.quantity,
          image: i.image,
        })),
        timeline: (timeline ?? []).map((t) => ({
          status: t.status,
          note: t.note,
          createdAt: t.created_at,
        })),
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return json({ error: "server_error", detail: msg }, 500);
  }
});
