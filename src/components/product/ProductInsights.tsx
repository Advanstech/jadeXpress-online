"use client";
import { Clock, HeartPulse, Sparkles, UserCheck } from "lucide-react";
import { useProductInsights } from "@/hooks/useAI";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductInsightsProps {
  productId: string;
}

const rows = [
  { key: "who_for", label: "Who it's for", icon: UserCheck },
  { key: "best_time", label: "Best time to use", icon: Clock },
  { key: "pairs_with", label: "Pairs well with", icon: HeartPulse },
  { key: "tip", label: "Pro tip", icon: Sparkles },
] as const;

export function ProductInsights({ productId }: ProductInsightsProps) {
  const { data, isLoading, isError, refetch, isFetching } =
    useProductInsights(productId);

  return (
    <div className="rounded-lg border border-border bg-gradient-to-br from-card to-secondary/40 p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          <p className="font-display text-sm font-semibold text-foreground">
            AI insights
          </p>
        </div>
        {isError && (
          <button
            onClick={() => void refetch()}
            disabled={isFetching}
            className="text-xs font-medium text-primary hover:underline disabled:opacity-50"
          >
            {isFetching ? "Loading…" : "Retry"}
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="mt-4 space-y-3">
          {rows.map((r) => (
            <div key={r.key}>
              <Skeleton className="h-3 w-28" />
              <Skeleton className="mt-1.5 h-3 w-full" />
            </div>
          ))}
        </div>
      ) : isError || !data ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Insights are unavailable right now. Please try again in a moment.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {rows.map((r) => (
            <div key={r.key} className="flex gap-2.5">
              <r.icon className="mt-0.5 size-4 shrink-0 text-accent" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {r.label}
                </p>
                <p className="mt-0.5 text-sm text-foreground">{data[r.key]}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
