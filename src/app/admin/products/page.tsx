"use client";
import { useState } from "react";
import { toast } from "sonner";
import { useAdminProducts, useInvalidateAdmin } from "@/hooks/useAdmin";
import { api, getTokens, decodeJwt } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@/types";

export default function AdminProducts() {
  const { data: products, isLoading } = useAdminProducts();
  const invalidate = useInvalidateAdmin();
  const [priceDraft, setPriceDraft] = useState<Record<string, string>>({});
  const [stockDraft, setStockDraft] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const save = async (p: Product) => {
    setSaving(p.id);
    const price = Number(priceDraft[p.id] ?? p.price);
    const stock = Number(stockDraft[p.id] ?? p.stock);
    if (Number.isNaN(price) || Number.isNaN(stock) || price < 0 || stock < 0) {
      toast.error("Enter valid numbers.");
      setSaving(null);
      return;
    }

    const token = getTokens();
    const storeId = token ? decodeJwt(token.accessToken)?.storeId : undefined;
    if (!storeId) {
      toast.error("Store not found in session.");
      setSaving(null);
      return;
    }

    const delta = Math.round(stock - p.stock);
    try {
      const calls: Promise<unknown>[] = [
        api.put(`inventory/products/${p.id}`, {
          sellingPricePesewas: Math.round(price * 100),
        }),
      ];
      if (delta !== 0) {
        calls.push(
          api.post("inventory/adjustments", {
            productId: p.id,
            storeId,
            type: delta > 0 ? "adjustment_in" : "adjustment_out",
            quantity: Math.abs(delta),
            notes: "Admin storefront stock update",
          }),
        );
      }
      await Promise.all(calls);
      toast.success(`${p.name} updated.`);
      invalidate();
    } catch {
      toast.error("Couldn't save changes.");
    } finally {
      setSaving(null);
    }
  };

  const toggleStatus = async (p: Product) => {
    const next = p.status === "active" ? "inactive" : "active";
    try {
      await api.put(`inventory/products/${p.id}`, { status: next });
      toast.success(`${p.name} is now ${next}.`);
      invalidate();
    } catch {
      toast.error("Couldn't change status.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="eyebrow">Admin</span>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">
          Products
        </h1>
        <p className="mt-1 text-muted-foreground">
          Adjust pricing and stock, or show/hide products from the storefront.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-soft">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Price (GHS)</th>
                <th className="px-4 py-3 font-semibold">Stock</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(products ?? []).map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-border last:border-0 hover:bg-secondary/30"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="size-10 shrink-0 overflow-hidden rounded-md border border-border bg-secondary">
                        {p.images[0] && (
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            crossOrigin="anonymous"
                            className="size-full object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize text-foreground">
                    {p.categorySlug}
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={priceDraft[p.id] ?? p.price}
                      onChange={(e) =>
                        setPriceDraft({ ...priceDraft, [p.id]: e.target.value })
                      }
                      className="h-9 w-24"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      type="number"
                      min={0}
                      value={stockDraft[p.id] ?? p.stock}
                      onChange={(e) =>
                        setStockDraft({ ...stockDraft, [p.id]: e.target.value })
                      }
                      className="h-9 w-20"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={p.status === "active" ? "default" : "outline"}
                      className={
                        p.status === "active"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground"
                      }
                    >
                      {p.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        className="shadow-gold"
                        disabled={saving === p.id}
                        onClick={() => void save(p)}
                      >
                        {saving === p.id ? "Saving…" : "Save"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void toggleStatus(p)}
                      >
                        {p.status === "active" ? "Hide" : "Show"}
                      </Button>
                    </div>
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
