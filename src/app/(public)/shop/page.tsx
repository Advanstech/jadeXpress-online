"use client";
import { useState, useEffect, useRef } from "react";
import { Search, SlidersHorizontal, PackageOpen, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import {
  useInfiniteProducts,
  type ProductFilters,
  type ProductSort,
} from "@/hooks/useProducts";
import { useBrands } from "@/hooks/useBrands";
import { useCategories } from "@/hooks/useCategories";
import { mapApiProduct } from "@/lib/mappers";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductFiltersContent } from "@/components/product/ProductFilters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  StaggerGroup,
  staggerItem,
} from "@/components/motion/Reveal";

const MAX_PRICE = 250;

const sortOptions: { value: ProductSort; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
];

export default function Shop() {
  const [filters, setFilters] = useState<ProductFilters>({
    sort: "featured",
    maxPrice: MAX_PRICE,
  });
  
  const [searchInput, setSearchInput] = useState(filters.search ?? "");
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();
  
  // Debounce search input to avoid spamming the API on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      if (filters.search !== searchInput) {
        setFilters((prev) => ({ ...prev, search: searchInput }));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput, filters.search]);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteProducts(filters, 24);

  const list = data?.pages.flatMap((page) => page.data.map(mapApiProduct)) ?? [];
  const total = data?.pages[0]?.meta?.total ?? list.length;

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sentinelRef.current || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "300px" }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const sidebar = (
    <ProductFiltersContent
      filters={filters}
      onChange={setFilters}
      categories={categories ?? []}
      brands={brands ?? []}
      maxPriceBound={MAX_PRICE}
    />
  );

  return (
    <>
      <section className="bg-primary text-primary-foreground">
        <div className="container py-14 md:py-20">
          <span className="eyebrow">Shop all</span>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-5xl">
            The collection
          </h1>
          <p className="mt-3 max-w-xl text-primary-foreground/80">
            Browse every JadeXpress vitamin, supplement and beauty essential in
            one place.
          </p>
        </div>
      </section>

      <section className="bg-background py-10">
        <div className="container grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-lg border border-border bg-card p-5 shadow-soft">
              {sidebar}
            </div>
          </aside>

          <div>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-xs sm:flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:gap-2">
                <Button
                  variant="outline"
                  className="lg:hidden"
                  onClick={() => setMobileOpen(true)}
                >
                  <SlidersHorizontal className="mr-2 size-4" />
                  Filters
                </Button>
                <Select
                  value={filters.sort ?? "featured"}
                  onValueChange={(v) =>
                    setFilters({ ...filters, sort: v as ProductSort })
                  }
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <p className="mb-5 text-sm text-muted-foreground">
              {isLoading
                ? "Loading products…"
                : `Showing ${list.length} of ${total} ${total === 1 ? "product" : "products"}`}
            </p>

            {isLoading ? (
              <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-2xl" />
                ))}
              </div>
            ) : list.length === 0 ? (
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-secondary/40 py-16 text-center">
                <PackageOpen className="size-10 text-muted-foreground" />
                <div>
                  <p className="font-display text-lg font-semibold text-foreground">
                    No products match
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Try adjusting your filters or search.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() =>
                    setFilters({ sort: "featured", maxPrice: MAX_PRICE })
                  }
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              <>
                <StaggerGroup className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3">
                  {list.map((p) => (
                    <motion.div key={p.id} variants={staggerItem}>
                      <ProductCard product={p} />
                    </motion.div>
                  ))}
                </StaggerGroup>

                {/* Infinite Scroll Trigger Sentinel */}
                <div
                  ref={sentinelRef}
                  className="mt-10 flex min-h-[60px] items-center justify-center py-6"
                >
                  {isFetchingNextPage ? (
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Loader2 className="size-5 animate-spin text-primary" />
                      Loading more products…
                    </div>
                  ) : hasNextPage ? (
                    <Button
                      variant="outline"
                      onClick={() => fetchNextPage()}
                      className="rounded-full px-6"
                    >
                      Load more products
                    </Button>
                  ) : list.length > 0 ? (
                    <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
                      All {total} products loaded
                    </span>
                  ) : null}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[300px] overflow-y-auto p-0">
          <SheetHeader className="border-b border-border px-5 py-4">
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="p-5">{sidebar}</div>
        </SheetContent>
      </Sheet>
    </>
  );
}
