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
const UPSTREAM_TIMEOUT_MS = 45_000;

async function geminiText(system: string, prompt: string): Promise<string> {
  const token = Deno.env.get("AI_API_TOKEN_2e2dce8fcd6e");
  if (!token) throw new Error("AI token is not configured");

  const controller = new AbortController();
  const deadline = setTimeout(() => controller.abort(), 40_000);
  try {
    const res = await fetch(
      `${API_BASE}/code/api/ai/v1beta/models/${MODEL}:streamGenerateContent`,
      {
        method: "POST",
        signal: controller.signal,
        headers: {
          "x-goog-api-key": token,
          "Content-Type": "application/json",
          "X-Session-ID": crypto.randomUUID(),
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: system }] },
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 400,
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

    const reader = res.body?.getReader();
    if (!reader) return "";
    const decoder = new TextDecoder();
    let raw = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      raw += decoder.decode(value, { stream: true });
    }
    raw += decoder.decode();

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
  } finally {
    clearTimeout(deadline);
  }
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

interface QuizAnswer {
  goal?: string;
  skin?: string;
  form?: string;
  budget?: string;
  avoid?: string[];
}

interface Recommendation {
  slug: string;
  reason: string;
}

interface QuizResult {
  summary: string;
  recommendations: Recommendation[];
}

/** Deterministic pre-filter so the AI only reviews a small candidate set. */
function candidateCategory(goal: string | undefined): string | null {
  switch ((goal ?? "").toLowerCase()) {
    case "skin & beauty":
      return "cosmetics";
    case "immunity & energy":
      return "vitamins";
    case "sleep & calm":
    case "digestion":
    case "weight & fitness":
      return "supplements";
    default:
      return null;
  }
}

function budgetMax(budget: string | undefined): number | null {
  const b = (budget ?? "").toLowerCase();
  if (b.includes("under ghs 80") || b.includes("budget")) return 80;
  if (b.includes("mid") || b.includes("150")) return 150;
  return null; // premium / no limit
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const answers: QuizAnswer = (await req.json())?.answers ?? {};
    if (!answers || Object.keys(answers).length === 0) {
      return json({ error: "invalid_payload", build: "v3" }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      return json({ error: "server_misconfigured" }, 500);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // 1) Candidate products — pre-filtered by goal category + budget.
    let query = admin
      .from("products")
      .select("name,slug,brand,price,category_slug,short_description")
      .eq("status", "active");

    const cat = candidateCategory(answers.goal);
    if (cat) query = query.eq("category_slug", cat);
    const maxPrice = budgetMax(answers.budget);
    if (maxPrice != null) query = query.lte("price", maxPrice);

    const { data: candidates } = await query.limit(12);

    let pool = (candidates ?? []) as {
      name: string;
      slug: string;
      brand: string | null;
      price: number;
      category_slug: string | null;
      short_description: string | null;
    }[];
    // Fall back to the full active range if the filter returned nothing.
    if (pool.length === 0) {
      const { data: all } = await admin
        .from("products")
        .select("name,slug,brand,price,category_slug,short_description")
        .eq("status", "active")
        .limit(12);
      pool = (all ?? []) as typeof pool;
    }

    const catalog = pool
      .map((p) => {
        const desc = (p.short_description ?? "").slice(0, 110);
        return `- ${p.name} [slug=${p.slug}] (${p.brand ?? "JadeXpress"}, GHS ${p.price}, ${p.category_slug ?? ""}) ${desc ? "- " + desc : ""}`;
      })
      .join("\n");

    const system =
      "You are a warm, expert wellness advisor for JadeXpress, a Ghanaian vitamin, supplement and beauty store. " +
      "Recommend the most suitable products from the candidate list ONLY. " +
      'Return STRICT JSON only with exactly two keys: "summary" (a short friendly paragraph) and ' +
      '"recommendations" (an array of objects with exactly "slug" and "reason"; slug MUST be one of the ' +
      "[slug=...] values in the list). Pick 2-4 products. No emoji.";

    const prompt = [
      "CUSTOMER ANSWERS",
      `Goal: ${answers.goal ?? ""}`,
      `Skin: ${answers.skin ?? ""}`,
      `Form preference: ${answers.form ?? ""}`,
      `Budget: ${answers.budget ?? ""}`,
      `Avoid: ${Array.isArray(answers.avoid) ? answers.avoid.join(", ") : ""}`,
      "",
      "CANDIDATE PRODUCTS",
      catalog || "(empty)",
    ].join("\n");

    const raw = await geminiText(system, prompt);
    const result = parseJSON<QuizResult>(raw);
    if (!result || !Array.isArray(result.recommendations)) {
      return json({ error: "Could not generate recommendations. Please try again." }, 502);
    }

    const slugs = new Set(pool.map((p) => p.slug));
    const recommendations = result.recommendations.filter(
      (r) => r.slug && slugs.has(r.slug),
    );

    return json({
      status: "ok",
      summary: result.summary,
      recommendations,
    });
  } catch (e) {
    const err = e as Error;
    if (err.name === "AbortError") {
      return json({ error: "The quiz is taking too long. Please try again." }, 504);
    }
    const msg = err.message || String(e);
    return json({ error: "server_error", detail: msg }, 500);
  }
});
