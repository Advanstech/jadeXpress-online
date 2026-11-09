"use client";
import { useMemo, useState } from "react";
import { Link } from "@/components/Link";
import { PackageOpen } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatGHS, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

type PayFilter = "all" | "paid" | "unpaid" | "demo";

const payFilters: { value: PayFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "unpaid", label: "Pending" },
  { value: "demo", label: "Demo" },
];

const payBadge: Record<string, string> = {
  paid: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  unpaid: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  demo: "bg-muted text-muted-foreground",
};

export default function Orders() {
  const { data: orders, isLoading } = useOrders();
  const [filter, setFilter] = useState<PayFilter>("all");
  const list = useMemo(() => {
    const all = orders ?? [];
    return filter === "all" ? all : all.filter((o) => o.paymentStatus === filter);
  }, [orders, filter]);

  const counts = useMemo(() => {
    const all = orders ?? [];
    return {
      all: all.length,
      paid: all.filter((o) => o.paymentStatus === "paid").length,
      unpaid: all.filter((o) => o.paymentStatus === "unpaid").length,
      demo: all.filter((o) => o.paymentStatus === "demo").length,
    };
  }, [orders]);

  return (
    <div className="space-y-6">
      <div>
        <span className="eyebrow">Account</span>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">
          Your orders
        </h1>
      </div>

      {!isLoading && (orders ?? []).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {payFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                filter === f.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40",
              )}
            >
              {f.label}
              <span className="ml-1.5 text-xs opacity-70">{counts[f.value]}</span>
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-secondary/30 py-16 text-center">
          <PackageOpen className="size-10 text-muted-foreground" />
          <div>
            <p className="font-display text-lg font-semibold text-foreground">
              {filter === "all" ? "No orders yet" : "No orders in this filter"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {filter === "all"
                ? "When you place an order, it'll appear here."
                : "Try a different payment status filter."}
            </p>
          </div>
          {filter === "all" && (
            <Button asChild className="shadow-gold">
              <Link to="/shop">Start shopping</Link>
            </Button>
          )}
        </div>
      ) : (
        <ul className="space-y-3">
          {list.map((o) => (
            <li key={o.id}>
              <Link
                to={`/account/orders/${o.orderNumber}`}
                className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40"
              >
                <div className="flex -space-x-3">
                  {o.items.slice(0, 4).map((it, i) => (
                    <img
                      key={i}
                      src={it.image ?? ""}
                      alt={it.name}
                      crossOrigin="anonymous"
                      className="size-11 rounded-full border-2 border-background object-cover"
                    />
                  ))}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {o.orderNumber}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(o.createdAt)} · {o.items.length} item(s)
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={cn(
                      "capitalize",
                      payBadge[o.paymentStatus] ?? "",
                    )}
                  >
                    {o.paymentStatus === "unpaid" ? "payment pending" : o.paymentStatus}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {o.status}
                  </Badge>
                  <span className="text-sm font-semibold text-foreground">
                    {formatGHS(o.total)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
