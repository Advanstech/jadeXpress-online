"use client";

import { useMemo, useState } from "react";
import { Link } from "@/components/Link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { recommendByQuiz, type QuizAnswers, type QuizResult } from "@/hooks/useAI";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

interface Step {
  id: keyof QuizAnswers;
  title: string;
  subtitle?: string;
  options?: string[];
  multi?: boolean;
}

const STEPS: Step[] = [
  {
    id: "goal",
    title: "What's your main goal?",
    subtitle: "Pick the outcome you care about most.",
    options: [
      "Immunity & energy",
      "Skin & beauty",
      "Sleep & calm",
      "Digestion",
      "Weight & fitness",
    ],
  },
  {
    id: "skin",
    title: "How would you describe your skin?",
    options: ["Oily", "Dry", "Combination", "Sensitive", "Normal"],
  },
  {
    id: "form",
    title: "Preferred format?",
    options: [
      "Capsules / tablets",
      "Gummies",
      "Powder",
      "Cream / serum",
      "No preference",
    ],
  },
  {
    id: "budget",
    title: "What's your budget per product?",
    options: [
      "Budget (under GHS 80)",
      "Mid (GHS 80–150)",
      "Premium (GHS 150+)",
      "No limit",
    ],
  },
];

const AVOID_OPTIONS = ["Dairy", "Gluten", "Added sugar", "Vegan only"];

export default function Quiz() {
  const { data: products, isLoading: productsLoading } = useProducts();
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [avoid, setAvoid] = useState<string[]>([]);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);

  const productMap = useMemo(
    () => new Map((products ?? []).map((p) => [p.slug, p])),
    [products],
  );

  const setAnswer = (id: keyof QuizAnswers, value: string) =>
    setAnswers((a) => ({ ...a, [id]: value }));

  const canContinue = step < STEPS.length
    ? !!answers[STEPS[step].id]
    : true;

  const submit = async () => {
    setLoading(true);
    try {
      const res = await recommendByQuiz({ ...answers, avoid });
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setAnswers({});
    setAvoid([]);
    setStep(0);
    setResult(null);
  };

  const recommended = useMemo(
    () =>
      (result?.recommendations ?? [])
        .map((r) => ({ ...r, product: productMap.get(r.slug) }))
        .filter((r) => r.product),
    [result, productMap],
  );

  const stepTitle = result
    ? "Your recommendations"
    : step < STEPS.length
      ? STEPS[step].title
      : "Almost there";

  return (
    <div className="bg-background">
      <section className="bg-primary text-primary-foreground">
        <div className="container py-14 md:py-20">
          <span className="eyebrow">Wellness quiz</span>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Find your routine
          </h1>
          <p className="mt-3 max-w-xl text-primary-foreground/80">
            Answer a few quick questions and we'll recommend products tailored
            to your goals — powered by AI, picked from our real catalogue.
          </p>
        </div>
      </section>

      <section className="container py-12">
        <div className="mx-auto max-w-3xl">
          {!result && !loading && (
            <>
              {/* Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Step {Math.min(step + 1, STEPS.length)} of {STEPS.length}
                  </span>
                  <span>{Math.round((Math.min(step, STEPS.length) / STEPS.length) * 100)}%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                    animate={{
                      width: `${(Math.min(step, STEPS.length) / STEPS.length) * 100}%`,
                    }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 shadow-soft md:p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.25 }}
                  >
                    {step < STEPS.length ? (
                      <div>
                        <h2 className="font-display text-2xl font-semibold text-foreground">
                          {stepTitle}
                        </h2>
                        {STEPS[step].subtitle && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {STEPS[step].subtitle}
                          </p>
                        )}
                        <div className="mt-6 grid gap-3 sm:grid-cols-2">
                          {STEPS[step].options?.map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setAnswer(STEPS[step].id, opt)}
                              className={cn(
                                "rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition-colors",
                                answers[STEPS[step].id] === opt
                                  ? "border-primary bg-primary text-primary-foreground shadow-soft"
                                  : "border-border bg-secondary/40 text-foreground hover:border-primary/40",
                              )}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h2 className="font-display text-2xl font-semibold text-foreground">
                          Anything to avoid?
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Optional — tell us about allergies or preferences.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-2">
                          {AVOID_OPTIONS.map((opt) => {
                            const active = avoid.includes(opt);
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() =>
                                  setAvoid((a) =>
                                    active ? a.filter((x) => x !== opt) : [...a, opt],
                                  )
                                }
                                className={cn(
                                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                                  active
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-border bg-secondary/40 text-foreground hover:border-primary/40",
                                )}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className="mt-8 flex items-center justify-between">
                  {step > 0 ? (
                    <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
                      <ArrowLeft className="mr-2 size-4" /> Back
                    </Button>
                  ) : (
                    <span />
                  )}
                  {step < STEPS.length ? (
                    <Button
                      className="shadow-gold"
                      disabled={!canContinue}
                      onClick={() => setStep((s) => s + 1)}
                    >
                      Continue <ArrowRight className="ml-2 size-4" />
                    </Button>
                  ) : (
                    <Button className="shadow-gold" onClick={() => void submit()}>
                      <Sparkles className="mr-2 size-4" />
                      Get my recommendations
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-12 text-center shadow-soft">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="font-display text-lg font-semibold text-foreground">
                Matching you with the right products…
              </p>
              <p className="text-sm text-muted-foreground">
                Our AI is reviewing the catalogue for your goals.
              </p>
            </div>
          )}

          {/* Results */}
          {result && !loading && (
            <div className="space-y-8">
              <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-secondary/40 p-6 shadow-soft">
                <div className="flex items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
                    <Sparkles className="size-4" />
                  </span>
                  <h2 className="font-display text-xl font-semibold text-foreground">
                    Your AI recommendations
                  </h2>
                </div>
                {result.summary && (
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    {result.summary}
                  </p>
                )}
                <Button variant="outline" size="sm" className="mt-4" onClick={reset}>
                  <RotateCcw className="mr-1.5 size-4" /> Retake quiz
                </Button>
              </div>

              {productsLoading ? (
                <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-square rounded-lg" />
                  ))}
                </div>
              ) : recommended.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border bg-secondary/30 py-14 text-center text-sm text-muted-foreground">
                  We couldn't find matching products just yet — try retaking the
                  quiz or{" "}
                  <Link to="/shop" className="font-medium text-primary hover:underline">
                    browse the shop
                  </Link>
                  .
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
                  {recommended.map((r) => (
                    <Reveal key={r.slug}>
                      <div>
                        <ProductCard product={r.product as Product} />
                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                          <span className="font-medium text-primary">Why:</span>{" "}
                          {r.reason}
                        </p>
                      </div>
                    </Reveal>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
