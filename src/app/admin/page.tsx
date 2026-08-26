"use client";
import { Link } from "@/components/Link";
import {
  Banknote,
  Clock,
  Inbox,
  Package,
  ShoppingBag,
  Users,
} from "lucide-react";
import { useAdminStats, useAdminOrders } from "@/hooks/useAdmin";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Reveal } from "@/components/motion/Reveal";
import { formatGHS, formatDate } from "@/lib/format";

const statusStyles: Record<string, string> = {
  pending: "bg-accent text-accent-foreground",
  processing: "bg-primary text-primary-foreground",
  shipped: "bg-primary/80 text-primary-foreground",
  delivered: "bg-primary text-primary-foreground",
  cancelled: "bg-destructive text-destructive-foreground",
};

export default function AdminOverview() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: orders, isLoading: ordersLoading } = useAdminOrders();
  const recent = (orders ?? []).slice(0, 6);

  const cards = [
    {
      label: "Total revenue (paid)",
      value: stats ? formatGHS(stats.revenue) : "—",
      icon: Banknote,
    },
    {
      label: "Orders",
      value: stats?.orders ?? "—",
      icon: ShoppingBag,
    },
    {
      label: "Pending fulfilment",
      value: stats?.pending ?? "—",
      icon: Clock,
    },
    {
      label: "Products",
      value: stats?.products ?? "—",
      icon: Package,
    },
    {
      label: "Customers",
      value: stats?.customers ?? "—",
      icon: Users,
    },
    {
      label: "Messages",
      value: `${stats?.messages ?? "—"}${
        (stats?.unread ?? 0) > 0 ? ` (${stats.unread} new)` : ""
      }`,
      icon: Inbox,
    },
  ];

  return (
    <div className="space-y-8">
      <Reveal>
        <span className="eyebrow">Admin</span>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">
          Store overview
        </h1>
        <p className="mt-1 text-muted-foreground">
          A live snapshot of orders, products, customers and messages.
        </p>
      </Reveal>

      {statsLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <div
              key={c.label}
              className="flex items-center gap-4 rounded-lg border border-border bg-card p-5 shadow-soft"
            >
              <span className="grid size-11 place-items-center rounded-xl bg-secondary text-primary">
                <c.icon className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm text-muted-foreground">{c.label}</p>
                <p className="font-display text-xl font-semibold text-foreground">
                  {c.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-foreground">
            Recent orders
          </h2>
          <Link
            to="/admin/orders"
            className="text-sm font-medium text-primary hover:underline"
          >
            View all
          </Link>
        </div>

        {ordersLoading ? (
          <div className="mt-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed border-border bg-secondary/30 py-12 text-center text-sm text-muted-foreground">
            No orders yet.
          </div>
        ) : (
          <ul className="mt-4 space-y-2">
            {recent.map((o) => (
              <li
                key={o.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4 shadow-soft"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {o.orderNumber}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {o.email} · {formatDate(o.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-foreground">
                    {formatGHS(o.total)}
                  </span>
                  <Badge className={statusStyles[o.status] ?? "bg-muted"}>
                    {o.status}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
