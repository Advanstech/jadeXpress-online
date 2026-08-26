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

interface InputItem {
  productId: string;
  quantity: number;
}

function generateOrderNumber() {
  const now = Date.now().toString(36).toUpperCase().slice(-6);
  const rand = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `JX-${now}${rand}`;
}

function generateReference(orderNumber: string) {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${orderNumber}-${rand}`;
}

const FREE_SHIPPING_THRESHOLD = 500;
const GHANA_SHIPPING = 35;
const INTERNATIONAL_SHIPPING = 120;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const items: InputItem[] = body.items;
    const email: string = body.email;
    const shippingAddress = body.shippingAddress;

    if (
      !Array.isArray(items) ||
      items.length === 0 ||
      !email ||
      !shippingAddress
    ) {
      return json({ error: "invalid_payload" }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      return json({ error: "server_misconfigured" }, 500);
    }

    // Identify the logged-in user (null for guests) from the request JWT.
    const authHeader = req.headers.get("Authorization") ?? "";
    const anon = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await anon.auth.getUser();
    const userId = userData.user?.id ?? null;

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // Resolve products + prices server-side — never trust client prices.
    const productIds = items.map((i) => i.productId);
    const { data: products, error: pErr } = await admin
      .from("products")
      .select("id,name,price,stock_quantity,images")
      .in("id", productIds)
      .eq("status", "active");
    if (pErr) return json({ error: "db_error", detail: pErr.message }, 500);

    const map = new Map((products ?? []).map((p) => [p.id, p]));
    const missing = items.find((i) => !map.has(i.productId));
    if (missing) return json({ error: "product_unavailable" }, 400);

    const orderItems = items.map((i) => {
      const p = map.get(i.productId)!;
      const qty = Math.max(1, Math.min(i.quantity, p.stock_quantity));
      const img =
        Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null;
      return {
        product_id: p.id,
        name: p.name,
        price: Number(p.price),
        quantity: qty,
        image: img,
      };
    });

    const subtotal = orderItems.reduce(
      (s, it) => s + it.price * it.quantity,
      0,
    );
    const isGhana = (shippingAddress.country || "")
      .toLowerCase()
      .includes("ghana");
    const shippingFee = isGhana
      ? subtotal >= FREE_SHIPPING_THRESHOLD
        ? 0
        : GHANA_SHIPPING
      : INTERNATIONAL_SHIPPING;
    const total = subtotal + shippingFee;

    const orderNumber = generateOrderNumber();
    const reference = generateReference(orderNumber);

    const { data: order, error: oErr } = await admin
      .from("orders")
      .insert({
        user_id: userId,
        order_number: orderNumber,
        email,
        status: "pending",
        payment_status: "unpaid",
        payment_reference: reference,
        subtotal,
        shipping_fee: shippingFee,
        total,
        currency: "GHS",
        shipping_address: shippingAddress,
      })
      .select()
      .single();
    if (oErr) {
      return json({ error: "order_create_failed", detail: oErr.message }, 500);
    }

    await admin.from("order_items").insert(
      orderItems.map((it) => ({ ...it, order_id: order.id })),
    );
    await admin.from("order_status_history").insert([
      { order_id: order.id, status: "pending", note: "Order placed" },
    ]);

    return json({
      status: "ok",
      orderNumber,
      orderId: order.id,
      reference,
      email,
      subtotal,
      shippingFee,
      total,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return json({ error: "server_error", detail: msg }, 500);
  }
});
