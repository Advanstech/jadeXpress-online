import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-session-id",
};

const MODEL = "google/gemini-3.6-flash";
const API_BASE = "https://api.enter.pro";

function sse(data: unknown, status = 200) {
  return new Response(`data: ${JSON.stringify(data)}\n\n`, {
    status,
    headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
  });
}

interface CatalogItem {
  name: string;
  brand: string | null;
  price: number;
  category_slug: string | null;
  short_description: string | null;
  benefits: string[] | null;
  slug: string;
}

/**
 * JadeXpress AI Shopping Concierge.
 * Grounded in the live catalogue (+ order status when the customer shares
 * their order number & email), answers product questions, gives
 * recommendations and explains order/delivery status in plain language.
 * Streams Gemini responses back to the client over SSE.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const AI_API_TOKEN = Deno.env.get("AI_API_TOKEN_2e2dce8fcd6e");
    if (!AI_API_TOKEN) throw new Error("AI token is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) throw new Error("Backend misconfigured");

    const { message, history } = await req.json();
    const userMessage = String(message ?? "").trim();
    if (!userMessage) return sse({ error: { message: "Please enter a question." } }, 400);

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // 1) Catalogue context — everything currently on the shop floor.
    const { data: products, error: prodErr } = await admin
      .from("products")
      .select(
        "name,brand,price,category_slug,short_description,benefits,slug,status,stock_quantity",
      )
      .eq("status", "active");
    if (prodErr) throw new Error("Could not load catalogue");

    const catalog: CatalogItem[] = (products ?? []).map((p) => ({
      name: p.name,
      brand: p.brand,
      price: Number(p.price),
      category_slug: p.category_slug,
      short_description: p.short_description,
      benefits: Array.isArray(p.benefits) ? p.benefits : [],
      slug: p.slug,
    }));

    // 2) Order context — if the customer shares an order number + email.
    const fullText = [userMessage, ...(history ?? []).map((h: { content: string }) => h.content)].join(" ");
    const orderMatch = fullText.match(/JX-[A-Z0-9]+/i);
    const emailMatch = fullText.match(/[\w.+-]+@[\w-]+\.[\w.]+/i);
    let orderContext = "";
    if (orderMatch && emailMatch) {
      const { data: order } = await admin
        .from("orders")
        .select("id,order_number,status,payment_status,total,created_at,shipping_address")
        .eq("order_number", orderMatch[0].toUpperCase())
        .eq("email", emailMatch[0].toLowerCase())
        .maybeSingle();
      if (order) {
        const { data: items } = await admin
          .from("order_items")
          .select("name,quantity,price")
          .eq("order_id", (order as { id: string }).id);
        const itemList = (items ?? []).map((i) => `${i.name} × ${i.quantity}`).join(", ");
        orderContext = [
          `CUSTOMER'S ORDER: ${order.order_number}`,
          `Status: ${order.status} · Payment: ${order.payment_status}`,
          `Total: GHS ${order.total} · Placed: ${order.created_at}`,
          itemList ? `Items: ${itemList}` : "",
          "Explain the status in friendly plain language and what happens next.",
        ].filter(Boolean).join("\n");
      } else {
        orderContext =
          "The customer asked about an order, but no matching order was found for that number + email. Gently ask them to double-check both.";
      }
    }

    // 3) Build the system prompt from real data.
    const catalogText = catalog
      .map(
        (p) =>
          `- ${p.name} (${p.brand ?? "JadeXpress"}) · GHS ${p.price} · ${p.category_slug ?? ""} · rating/popularity per product page · ${p.short_description ?? ""} ${p.benefits?.length ? `| Benefits: ${p.benefits.join("; ")}` : ""} | /product/${p.slug}`,
      )
      .join("\n");

    const systemInstruction = `You are the JadeXpress shopping concierge — a warm, helpful assistant for a Ghanaian vitamin, supplement and beauty store.

ABOUT THE STORE: Premium vitamins, supplements and cosmetics delivered across Ghana and worldwide. Free delivery in Ghana on orders over GHS 500, otherwise GHS 35. International delivery GHS 120. Hours Mon–Sat 8am–8pm GMT.

YOUR JOB:
- Answer product questions (ingredients, usage, who it's for), compare products, and recommend items. Base answers ONLY on the catalogue below; if a product isn't listed, say it's not in stock yet.
- Suggest the product page link (/product/<slug>) when relevant.
- ${orderContext ? "ORDER HELP: " + orderContext : "If the customer asks about an order, ask for their order number (JX-...) and the email used at checkout, then they can re-ask."}
- Keep replies concise, friendly and scannable (short paragraphs or a short list). No emoji. In GHS prices.

LIVE CATALOGUE:
${catalogText || "(catalogue temporarily unavailable)"}

If the catalogue is empty or the customer asks something unrelated, say you can help with products, orders and delivery, then offer to help.`;

    const contents = [
      ...(history ?? []).map((m: { role: string; content: string }) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      { role: "user", parts: [{ text: userMessage }] },
    ];

    const upstreamSessionID = req.headers.get("X-Session-ID")?.trim() || crypto.randomUUID();

    const upstream = await fetch(
      `${API_BASE}/code/api/ai/v1beta/models/${MODEL}:streamGenerateContent`,
      {
        method: "POST",
        headers: {
          "x-goog-api-key": AI_API_TOKEN,
          "Content-Type": "application/json",
          "X-Session-ID": upstreamSessionID,
        },
        body: JSON.stringify({
          contents,
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: { temperature: 0.6, maxOutputTokens: 700 },
        }),
      },
    );

    if (!upstream.ok) {
      const text = await upstream.text();
      let errorMessage = "AI service error";
      let errorStatus = "api_error";
      const dataMatch = text.match(/data: (.+)/);
      try {
        const errorData = JSON.parse(dataMatch ? dataMatch[1] : text);
        errorMessage = errorData.error?.message || errorMessage;
        errorStatus = errorData.error?.status || errorStatus;
      } catch {
        /* keep defaults */
      }
      return sse(
        { error: { code: upstream.status, message: errorMessage, status: errorStatus } },
        upstream.status,
      );
    }

    return new Response(upstream.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return sse({ error: { code: 500, message: msg, status: "INTERNAL" } }, 500);
  }
});
