"use client";
import { useState } from "react";
import { toast } from "sonner";
import { useAdminOrders, useInvalidateAdmin } from "@/hooks/useAdmin";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatGHS, formatDate } from "@/lib/format";
import type { OrderStatus } from "@/types";

const statuses: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const statusStyles: Record<string, string> = {
  pending: "bg-accent text-accent-foreground",
  processing: "bg-primary text-primary-foreground",
  shipped: "bg-primary/80 text-primary-foreground",
  delivered: "bg-primary text-primary-foreground",
  cancelled: "bg-destructive text-destructive-foreground",
};

export default function AdminOrders() {
  const { data: orders, isLoading } = useAdminOrders();
  const invalidate = useInvalidateAdmin();
  const [updating, setUpdating] = useState<string | null>(null);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    setUpdating(orderId);
    try {
      await api.put(`storefront/orders/${orderId}/status`, {
        status,
        note: "Status updated by store admin",
      });
      toast.success(`Order marked ${status}.`);
    } catch {
      toast.error("Couldn't update the order.");
    }
    setUpdating(null);
    invalidate();
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="eyebrow">Admin</span>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">
          Orders
        </h1>
        <p className="mt-1 text-muted-foreground">
          Manage every order across the store — update fulfilment status here.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : (orders ?? []).length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-secondary/30 py-16 text-center text-sm text-muted-foreground">
          No orders yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-soft">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Items</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Payment</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {(orders ?? []).map((o) => (
                <tr
                  key={o.id}
                  className="border-b border-border last:border-0 hover:bg-secondary/30"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{o.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(o.createdAt)}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-foreground">{o.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {o.shippingAddress.recipientName}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {o.items.reduce((s, i) => s + i.quantity, 0)}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {formatGHS(o.total)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="capitalize">
                      {o.paymentStatus}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Select
                      value={o.status}
                      onValueChange={(v) => void updateStatus(o.id, v as OrderStatus)}
                      disabled={updating === o.id}
                    >
                      <SelectTrigger
                        className={`h-9 w-[150px] ${
                          statusStyles[o.status] ?? "bg-muted text-muted-foreground"
                        }`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map((s) => (
                          <SelectItem key={s} value={s} className="capitalize">
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
