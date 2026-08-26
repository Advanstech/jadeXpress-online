"use client";
import { useEffect, useState } from "react";
import { CheckCircle2, RefreshCw, Sparkles } from "lucide-react";
import { explainOrder, type OrderExplanation } from "@/hooks/useAI";
import { Skeleton } from "@/components/ui/skeleton";

interface OrderExplainerProps {
  orderNumber: string;
  email?: string;
}

export function OrderExplainer({ orderNumber, email }: OrderExplainerProps) {
  const [data, setData] = useState<OrderExplanation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    if (!orderNumber || !email) return;
    setLoading(true);
    setError(null);
    setData(null);
    explainOrder(orderNumber, email)
      .then((d) => setData(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [orderNumber, email]);

  return (
    <div className="rounded-lg border border-border bg-gradient-to-br from-card to-secondary/40 p-5 shadow-soft">
      <div className="flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
          <Sparkles className="size-4" />
        </span>
        <div>
          <p className="font-display text-sm font-semibold text-foreground">
            What does this mean?
          </p>
          <p className="text-xs text-muted-foreground">
            A quick plain-language summary of your order.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="mt-4 space-y-3">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      ) : error || !data ? (
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {error ?? "Couldn't load the summary right now."}
          </p>
          <button
            onClick={load}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <RefreshCw className="size-3.5" /> Retry
          </button>
        </div>
      ) : (
        <div className="mt-4">
          <p className="text-sm leading-relaxed text-foreground">{data.summary}</p>
          {data.next_steps.length > 0 && (
            <ul className="mt-3 space-y-2">
              {data.next_steps.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-accent" />
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
