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

const MODEL = "google/gemini-3.6-flash";
const API_BASE = "https://api.enter.pro";

async function geminiText(system: string, prompt: string): Promise<string> {
  const token = Deno.env.get("AI_API_TOKEN_2e2dce8fcd6e");
  if (!token) throw new Error("AI token is not configured");

  const res = await fetch(
    `${API_BASE}/code/api/ai/v1beta/models/${MODEL}:streamGenerateContent`,
    {
      method: "POST",
      headers: {
        "x-goog-api-key": token,
        "Content-Type": "application/json",
        "X-Session-ID": crypto.randomUUID(),
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: system }] },
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 600,
          responseMimeType: "application/json",
        },
      }),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    let msg = "AI service error";
    try {
      const m = text.match(/data: (.+)/);
      const err = JSON.parse(m ? m[1] : text);
      msg = err.error?.message || msg;
    } catch {
      /* keep default */
    }
    throw new Error(msg);
  }

  const raw = await res.text();
  let out = "";
  for (const line of raw.split("\n")) {
    if (!line.startsWith("data:")) continue;
    const payload = line.slice(5).trim();
    if (!payload || payload === "[DONE]") continue;
    try {
      const chunk = JSON.parse(payload);
      const parts = chunk.candidates?.[0]?.content?.parts;
      for (const part of parts ?? []) {
        if (part.text) out += part.text;
      }
    } catch {
      /* skip malformed chunk */
    }
  }
  return out.trim();
}

function parseJSON<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(raw.slice(start, end + 1)) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}

interface Explanation {
  summary: string;
  next_steps: string[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { orderNumber, email } = await req.json();
    if (!orderNumber || !email) return json({ error: "invalid_payload" }, 400);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      return json({ error: "server_misconfigured" }, 500);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { data: order } = await admin
      .from("orders")
      .select("id,order_number,status,payment_status,total,created_at,shipping_address")
      .eq("order_number", orderNumber.toUpperCase())
      .eq("email", email.toLowerCase())
      .maybeSingle();
    if (!order) return json({ status: "not_found" }, 404);

    const { data: items } = await admin
      .from("order_items")
      .select("name,quantity")
      .eq("order_id", order.id);

    const courier = order.shipping_address?.courier;
    const itemList = (items ?? [])
      .map((i) => `${i.name} x${i.quantity}`)
      .join(", ");

    const system =
      "You are a warm, helpful customer-care assistant for JadeXpress, a Ghanaian vitamin and beauty store. " +
      "Explain the customer's order status in friendly plain language and tell them what happens next. " +
      "Return STRICT JSON only with exactly two keys: \"summary\" (a short paragraph) and " +
      "\"next_steps\" (an array of 2-4 short strings). No emoji.";

    const prompt = [
      "ORDER STATUS",
      `Order: ${order.order_number}`,
      `Status: ${order.status}`,
      `Payment: ${order.payment_status}`,
      `Total: GHS ${order.total}`,
      `Placed: ${order.created_at}`,
      courier ? `Courier: ${courier.provider ?? ""} (${courier.eta ?? ""})${courier.trackingNumber ? " tracking " + courier.trackingNumber : ""}` : "",
      itemList ? `Items: ${itemList}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const raw = await geminiText(system, prompt);
    const explanation = parseJSON<Explanation>(raw);
    if (!explanation) {
      return json({ error: "Could not explain this order. Please try again." }, 502);
    }

    return json({ status: "ok", explanation });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return json({ error: "server_error", detail: msg }, 500);
  }
});
