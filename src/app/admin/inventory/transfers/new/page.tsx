"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStores, useCreateTransfer } from "@/hooks/useTransfers";
import { useAdminProducts } from "@/hooks/useAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Trash2, Search, Plus } from "lucide-react";
import Link from "next/link";
import type { Product } from "@/types";

export default function NewTransferPage() {
  const router = useRouter();
  const { data: stores } = useStores();
  const { mutateAsync: createTransfer, isPending } = useCreateTransfer();

  const [fromStoreId, setFromStoreId] = useState("");
  const [toStoreId, setToStoreId] = useState("");
  const [notes, setNotes] = useState("");

  const [search, setSearch] = useState("");
  const { data: productsData, isLoading: isLoadingProducts } = useAdminProducts({
    limit: 10,
    search,
  });

  const [selectedItems, setSelectedItems] = useState<{ product: Product; qty: number }[]>([]);

  const addItem = (product: Product) => {
    if (selectedItems.find((i) => i.product.id === product.id)) {
      toast.error("Product already added to transfer.");
      return;
    }
    setSelectedItems((prev) => [...prev, { product, qty: 1 }]);
    setSearch("");
  };

  const updateQty = (id: string, qty: number) => {
    setSelectedItems((prev) =>
      prev.map((i) => (i.product.id === id ? { ...i, qty: Math.max(1, qty) } : i))
    );
  };

  const removeItem = (id: string) => {
    setSelectedItems((prev) => prev.filter((i) => i.product.id !== id));
  };

  const handleSubmit = async () => {
    if (!fromStoreId || !toStoreId) {
      toast.error("Please select both source and destination branches.");
      return;
    }
    if (fromStoreId === toStoreId) {
      toast.error("Source and destination branches cannot be the same.");
      return;
    }
    if (selectedItems.length === 0) {
      toast.error("Please add at least one product to transfer.");
      return;
    }

    try {
      await createTransfer({
        fromStoreId,
        toStoreId,
        notes,
        items: selectedItems.map((i) => ({
          productId: i.product.id,
          quantityRequested: i.qty,
          unitCostPesewas: i.product.price * 100,
        })),
      });
      toast.success("Stock transfer requested successfully.");
      router.push("/admin/inventory/transfers");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create transfer.");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/inventory/transfers">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Initiate Transfer</h1>
          <p className="text-muted-foreground mt-1">Move stock between branches</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Transfer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Source Branch (From)</label>
              <Select value={fromStoreId} onValueChange={setFromStoreId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Source Branch" />
                </SelectTrigger>
                <SelectContent>
                  {stores?.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Destination Branch (To)</label>
              <Select value={toStoreId} onValueChange={setToStoreId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Destination Branch" />
                </SelectTrigger>
                <SelectContent>
                  {stores?.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes (Optional)</label>
              <Input
                placeholder="Reason for transfer..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Add Products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {search.trim() !== "" && (
              <div className="border border-border/50 rounded-md overflow-hidden bg-background max-h-60 overflow-y-auto">
                {isLoadingProducts ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">Searching...</div>
                ) : productsData?.products.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">No products found.</div>
                ) : (
                  <div className="divide-y divide-border/50">
                    {productsData?.products.map((p) => (
                      <div key={p.id} className="p-2 flex items-center justify-between hover:bg-secondary/30">
                        <div>
                          <p className="font-medium text-sm">{p.name}</p>
                          <p className="text-xs text-muted-foreground">SKU: {p.sku}</p>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => addItem(p)}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Transfer Items ({selectedItems.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedItems.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              No products added yet.
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {selectedItems.map((item) => (
                <div key={item.product.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">SKU: {item.product.sku}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Qty:</span>
                      <Input
                        type="number"
                        min="1"
                        className="w-20 h-8"
                        value={item.qty}
                        onChange={(e) => updateQty(item.product.id, parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeItem(item.product.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={isPending || selectedItems.length === 0 || !fromStoreId || !toStoreId}
        >
          {isPending ? "Submitting..." : "Submit Transfer Request"}
        </Button>
      </div>
    </div>
  );
}
