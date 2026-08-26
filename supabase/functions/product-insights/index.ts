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
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** Calls Gemini (streaming-only route) and returns the accumulated text. */
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
          maxOutputTokens: 800,
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

interface Insights {
  who_for: string;
  best_time: string;
  pairs_with: string;
  tip: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { productId } = await req.json();
    if (!productId) return json({ error: "invalid_payload" }, 400);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      return json({ error: "server_misconfigured" }, 500);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // 1) Product data.
    const { data: product, error: pErr } = await admin
      .from("products")
      .select(
        "id,name,brand,price,category_slug,short_description,description,ingredients,usage_instructions,benefits",
      )
      .eq("id", productId)
      .maybeSingle();
    if (pErr) return json({ error: "db_error", detail: pErr.message }, 500);
    if (!product) return json({ error: "product_not_found" }, 404);

    // 2) Return cached insights when fresh.
    const { data: cached } = await admin
      .from("product_insights")
      .select("content,updated_at")
      .eq("product_id", productId)
      .maybeSingle();
    if (
      cached?.content &&
      cached.updated_at &&
      Date.now() - new Date(cached.updated_at).getTime() < CACHE_TTL_MS
    ) {
      return json({ status: "ok", insights: cached.content });
    }

    // 3) Generate.
    const system =
      "You are a warm, expert wellness advisor for JadeXpress, a Ghanaian vitamin, supplement and beauty store. " +
      "Explain this product in plain, friendly language. Return STRICT JSON only, with exactly these keys: " +
      '"who_for" (who it is best for), "best_time" (best time / how to take), "pairs_with" (what it pairs well with), ' +
      '"tip" (one pro tip). Keep each value to 1-2 short sentences. No emoji.';

    const prompt = [
      "PRODUCT",
      `Name: ${product.name}`,
      `Brand: ${product.brand ?? "JadeXpress"}`,
      `Category: ${product.category_slug ?? ""}`,
      `Price: GHS ${product.price}`,
      `Short: ${product.short_description ?? ""}`,
      `Description: ${product.description ?? ""}`,
      `Ingredients: ${product.ingredients ?? ""}`,
      `How to use: ${product.usage_instructions ?? ""}`,
      `Benefits: ${Array.isArray(product.benefits) ? product.benefits.join("; ") : ""}`,
    ].join("\n");

    const raw = await geminiText(system, prompt);
    const insights = parseJSON<Insights>(raw);
    if (!insights) {
      return json({ error: "Could not generate insights. Please try again." }, 502);
    }

    // 4) Cache it.
    await admin
      .from("product_insights")
      .upsert(
        {
          product_id: productId,
          content: insights,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "product_id" },
      );

    return json({ status: "ok", insights });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return json({ error: "server_error", detail: msg }, 500);
  }
});
