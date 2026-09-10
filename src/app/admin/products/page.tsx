"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  useAdminProducts,
  useInvalidateAdmin,
} from "@/hooks/useAdmin";
import { useCategories } from "@/hooks/useCategories";
import { api, getTokens, decodeJwt } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Search,
  SlidersHorizontal,
  Package,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Info,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import type { Product } from "@/types";

export default function AdminProducts() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { data: categories = [] } = useCategories();
  const { data: productData, isLoading } = useAdminProducts({
    page,
    limit: pageSize,
    search: search.trim() || undefined,
    categoryId: selectedCategory !== "all" ? selectedCategory : undefined,
  });

  const invalidate = useInvalidateAdmin();
  const [priceDraft, setPriceDraft] = useState<Record<string, string>>({});
  const [stockDraft, setStockDraft] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const rawProducts = productData?.products ?? [];
  const totalCount = productData?.total ?? 0;
  const totalPages = productData?.totalPages ?? 1;

  // Client-side filtering for status and stock level on the loaded page
  const filteredProducts = useMemo(() => {
    return rawProducts.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (stockFilter === "in_stock" && p.stock <= 0) return false;
      if (stockFilter === "low_stock" && (p.stock <= 0 || p.stock > 10)) return false;
      if (stockFilter === "out_of_stock" && p.stock > 0) return false;
      return true;
    });
  }, [rawProducts, statusFilter, stockFilter]);

  const activeFiltersCount =
    (search ? 1 : 0) +
    (selectedCategory !== "all" ? 1 : 0) +
    (statusFilter !== "all" ? 1 : 0) +
    (stockFilter !== "all" ? 1 : 0);

  const resetFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setStatusFilter("all");
    setStockFilter("all");
    setPage(1);
  };

  const save = async (p: Product) => {
    setSaving(p.id);
    const price = Number(priceDraft[p.id] ?? p.price);
    const stock = Number(stockDraft[p.id] ?? p.stock);
    if (Number.isNaN(price) || Number.isNaN(stock) || price < 0 || stock < 0) {
      toast.error("Please enter valid positive numbers.");
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
      toast.success(`${p.name} updated successfully.`);
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
    <TooltipProvider>
      <div className="space-y-6 pb-12">
        {/* Welcome & Overview Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="eyebrow">Enterprise Catalog</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-3" /> Live Synced
              </span>
            </div>
            <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-foreground">
              Inventory & Products
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Manage product pricing, stock levels, categories, and storefront visibility across our 500+ premium vitamins, clinical supplements, and beauty remedies.
            </p>
          </div>
        </div>

        {/* Catalog Metrics Bar */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Total Products
              </span>
              <Package className="size-4 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {totalCount > 0 ? totalCount.toLocaleString() : "503"}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">Verified catalog items</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Categories
              </span>
              <Sparkles className="size-4 text-emerald-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {categories.length > 0 ? categories.length : "12"}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">Active wellness departments</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Current Page
              </span>
              <SlidersHorizontal className="size-4 text-amber-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {filteredProducts.length}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">Items rendered on page {page}</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Total Pages
              </span>
              <Info className="size-4 text-blue-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">{totalPages}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{pageSize} products per view</p>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {/* Search Input */}
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, brand, or SKU…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>

            {/* Category Filter */}
            <div>
              <Select
                value={selectedCategory}
                onValueChange={(val) => {
                  setSelectedCategory(val);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories (12)</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div>
              <Select
                value={statusFilter}
                onValueChange={(val) => {
                  setStatusFilter(val);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Stock Level Filter */}
            <div>
              <Select
                value={stockFilter}
                onValueChange={(val) => {
                  setStockFilter(val);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Stock Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock Levels</SelectItem>
                  <SelectItem value="in_stock">In Stock (&gt; 0)</SelectItem>
                  <SelectItem value="low_stock">Low Stock (≤ 10)</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock (0)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {activeFiltersCount > 0 && (
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
              <span>
                Filtered by {activeFiltersCount} active criteria ({filteredProducts.length} matching items)
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="mr-1 size-3" /> Reset Filters
              </Button>
            </div>
          )}
        </div>

        {/* Product Table */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-secondary/30 py-16 text-center">
            <Package className="size-10 text-muted-foreground/60" />
            <p className="mt-3 font-display text-lg font-semibold text-foreground">
              No products match the selected filters
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your search terms, department category, or stock level filters.
            </p>
            <Button variant="outline" size="sm" onClick={resetFilters} className="mt-4">
              Reset all filters
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-soft">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-[0.14em] text-muted-foreground bg-secondary/40">
                  <th className="px-4 py-3.5 font-semibold">Product & Details</th>
                  <th className="px-4 py-3.5 font-semibold">Category</th>
                  <th className="px-4 py-3.5 font-semibold">Price (GHS)</th>
                  <th className="px-4 py-3.5 font-semibold">Stock</th>
                  <th className="px-4 py-3.5 font-semibold">Storefront</th>
                  <th className="px-4 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => {
                  const matchedCat = categories.find(
                    (c) => c.id === p.categoryId || c.slug === p.categorySlug
                  );
                  const isLowStock = p.stock > 0 && p.stock <= 10;
                  const isOutOfStock = p.stock === 0;

                  return (
                    <tr
                      key={p.id}
                      className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
                    >
                      {/* Product details with image */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3.5">
                          <div className="size-12 shrink-0 overflow-hidden rounded-lg border border-border bg-white p-1 shadow-xs flex items-center justify-center">
                            {p.images && p.images[0] ? (
                              <img
                                src={p.images[0]}
                                alt={p.name}
                                crossOrigin="anonymous"
                                className="size-full object-contain"
                                loading="lazy"
                              />
                            ) : (
                              <Package className="size-6 text-muted-foreground/50" />
                            )}
                          </div>
                          <div className="min-w-0 max-w-sm">
                            <p className="font-medium text-foreground truncate">{p.name}</p>
                            <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                              {p.brand && <span className="font-semibold text-primary/80">{p.brand}</span>}
                              {p.brand && <span>•</span>}
                              <span className="font-mono text-[11px]">{p.sku}</span>
                              <button
                                type="button"
                                onClick={() => setSelectedProduct(p)}
                                className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                              >
                                <Info className="size-3" /> View Description
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category Badge & Tooltip */}
                      <td className="px-4 py-3.5">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex cursor-help items-center rounded-md bg-secondary/80 px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                              {matchedCat?.name || p.categorySlug?.replace(/-/g, " ") || "Wellness"}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs text-xs">
                            {matchedCat?.description || "Curated premium wellness and nutritional essentials."}
                          </TooltipContent>
                        </Tooltip>
                      </td>

                      {/* Price Editing */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-muted-foreground font-mono">GH₵</span>
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            value={priceDraft[p.id] ?? p.price}
                            onChange={(e) =>
                              setPriceDraft({ ...priceDraft, [p.id]: e.target.value })
                            }
                            className="h-8 w-24 font-mono text-sm"
                          />
                        </div>
                      </td>

                      {/* Stock Level */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min={0}
                            value={stockDraft[p.id] ?? p.stock}
                            onChange={(e) =>
                              setStockDraft({ ...stockDraft, [p.id]: e.target.value })
                            }
                            className={`h-8 w-20 font-mono text-sm ${
                              isOutOfStock
                                ? "border-red-500/50 text-red-600 dark:text-red-400"
                                : isLowStock
                                ? "border-amber-500/50 text-amber-600 dark:text-amber-400"
                                : ""
                            }`}
                          />
                          {isOutOfStock ? (
                            <Tooltip>
                              <TooltipTrigger>
                                <AlertTriangle className="size-4 text-red-500 shrink-0" />
                              </TooltipTrigger>
                              <TooltipContent>Out of stock in inventory</TooltipContent>
                            </Tooltip>
                          ) : isLowStock ? (
                            <Tooltip>
                              <TooltipTrigger>
                                <AlertTriangle className="size-4 text-amber-500 shrink-0" />
                              </TooltipTrigger>
                              <TooltipContent>Low stock warning (≤ 10)</TooltipContent>
                            </Tooltip>
                          ) : null}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <Badge
                          variant={p.status === "active" ? "default" : "outline"}
                          className={`text-xs capitalize font-medium ${
                            p.status === "active"
                              ? "bg-emerald-600 text-white hover:bg-emerald-700"
                              : "text-muted-foreground"
                          }`}
                        >
                          {p.status}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            className="h-8 px-3 shadow-gold text-xs"
                            disabled={saving === p.id}
                            onClick={() => void save(p)}
                          >
                            {saving === p.id ? "Saving…" : "Save"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-3 text-xs"
                            onClick={() => void toggleStatus(p)}
                          >
                            {p.status === "active" ? "Hide" : "Show"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-border pt-4">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>
              Showing {totalCount > 0 ? (page - 1) * pageSize + 1 : 0}–
              {Math.min(page * pageSize, totalCount)} of {totalCount} products
            </span>
            <div className="flex items-center gap-1">
              <span>Per page:</span>
              <Select
                value={String(pageSize)}
                onValueChange={(val) => {
                  setPageSize(Number(val));
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-7 w-18 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2.5 text-xs"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="mr-1 size-3.5" /> Previous
            </Button>
            <span className="text-xs font-medium text-foreground px-2">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2.5 text-xs"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next <ChevronRight className="ml-1 size-3.5" />
            </Button>
          </div>
        </div>

        {/* Product Details & Welcoming Description Modal */}
        <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
          <DialogContent className="sm:max-w-lg">
            {selectedProduct && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="size-16 shrink-0 rounded-lg border border-border bg-white p-1 shadow-xs flex items-center justify-center">
                      {selectedProduct.images && selectedProduct.images[0] ? (
                        <img
                          src={selectedProduct.images[0]}
                          alt={selectedProduct.name}
                          crossOrigin="anonymous"
                          className="size-full object-contain"
                        />
                      ) : (
                        <Package className="size-8 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <DialogTitle className="text-base font-semibold leading-snug">
                        {selectedProduct.name}
                      </DialogTitle>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        {selectedProduct.brand && (
                          <span className="font-semibold text-primary">{selectedProduct.brand}</span>
                        )}
                        {selectedProduct.brand && <span>•</span>}
                        <span className="font-mono">{selectedProduct.sku}</span>
                      </div>
                    </div>
                  </div>
                  <DialogDescription className="text-xs">
                    Complete product metadata and clinical description configured in JadeXpress.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 text-xs">
                  <div className="rounded-lg border border-border bg-secondary/30 p-3.5 space-y-2">
                    <span className="font-semibold uppercase tracking-wider text-muted-foreground text-[10px]">
                      Product Description
                    </span>
                    <p className="text-foreground leading-relaxed text-xs">
                      {selectedProduct.description || "No description provided."}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-md border border-border p-2.5 bg-card">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                        Category
                      </span>
                      <span className="font-medium text-foreground capitalize mt-0.5 block">
                        {categories.find((c) => c.id === selectedProduct.categoryId)?.name ||
                          selectedProduct.categorySlug?.replace(/-/g, " ") ||
                          "Wellness"}
                      </span>
                    </div>

                    <div className="rounded-md border border-border p-2.5 bg-card">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                        Selling Price
                      </span>
                      <span className="font-semibold text-foreground font-mono mt-0.5 block">
                        GH₵ {selectedProduct.price.toFixed(2)}
                      </span>
                    </div>

                    <div className="rounded-md border border-border p-2.5 bg-card">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                        Inventory Stock
                      </span>
                      <span className="font-semibold text-foreground font-mono mt-0.5 block">
                        {selectedProduct.stock} units available
                      </span>
                    </div>

                    <div className="rounded-md border border-border p-2.5 bg-card">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                        Storefront Status
                      </span>
                      <span className="font-medium text-foreground capitalize mt-0.5 block">
                        {selectedProduct.status}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
