"use client";
import { useState, useEffect, useRef } from "react";
import { Link } from "@/components/Link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronRight, PackageOpen, Search, Loader2 } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import {
  useInfiniteProducts,
  type ProductSort,
} from "@/hooks/useProducts";
import { mapApiProduct } from "@/lib/mappers";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StaggerGroup, staggerItem, Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

const sortOptions: { value: ProductSort; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
  { value: "newest", label: "Newest" },
];

const SLUG_MAP: Record<string, string> = {
  vitamins: "vitamins-minerals",
  supplements: "supplements-wellness",
  cosmetics: "beauty-skin",
  beauty: "beauty-skin",
  skincare: "skincare-lotions",
  "children-health": "childrens-health",
  omega: "omega-fish-oils",
  protein: "protein-sports",
};

export default function CategoryPage() {
  const params = useParams();
  const rawSlug = typeof params?.slug === "string" ? params.slug : Array.isArray(params?.slug) ? params.slug[0] : "";
  const resolvedSlug = SLUG_MAP[rawSlug.toLowerCase()] ?? rawSlug;

  const { data: categories, isLoading: catLoading } = useCategories();
  const category = (categories ?? []).find(
    (c) => c.slug === resolvedSlug || c.slug === rawSlug
  );

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<ProductSort>("featured");

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteProducts(
    {
      categorySlug: resolvedSlug,
      search,
      sort,
    },
    24
  );

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

  const displayCategoryName = category?.name || (resolvedSlug ? resolvedSlug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) : "Category");
  const displayTagline = category?.tagline || "Curated premium wellness & body care collection";
  const displayImage = category?.image || `/categories/${resolvedSlug}.jpg`;

  return (
    <>
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        {displayImage ? (
          <img
            src={displayImage}
            alt={displayCategoryName}
            crossOrigin="anonymous"
            className="absolute inset-0 size-full object-cover opacity-35"
          />
        ) : (
          <div className="absolute inset-0 size-full bg-primary/40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary/60" />
        <div className="container relative z-10 py-14 md:py-20">
          <Reveal>
            <nav className="flex items-center gap-1 text-xs text-primary-foreground/70">
              <Link to="/" className="hover:text-primary-foreground">Home</Link>
              <ChevronRight className="size-3" />
              <Link to="/shop" className="hover:text-primary-foreground">Shop</Link>
              <ChevronRight className="size-3" />
              <span className="text-primary-foreground">{displayCategoryName}</span>
            </nav>
            <span className="mt-4 inline-block eyebrow">{displayTagline}</span>
            <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight md:text-5xl">
              {catLoading ? "…" : displayCategoryName}
            </h1>
            {category?.description && (
              <p className="mt-3 max-w-xl text-primary-foreground/80">
                {category.description}
              </p>
            )}
          </Reveal>
        </div>
      </section>

      {/* Category Pills Strip */}
      <div className="border-b border-border bg-card/60 backdrop-blur-md">
        <div className="container flex gap-2 overflow-x-auto py-3 no-scrollbar">
          {(categories ?? []).map((cat) => {
            const isActive = cat.slug === resolvedSlug || cat.slug === rawSlug;
            return (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className={cn(
                  "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary/70 text-foreground/70 hover:bg-secondary hover:text-foreground"
                )}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>
      </div>

      <section className="bg-background py-10">
        <div className="container">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs sm:flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={`Search ${displayCategoryName}…`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={sort}
              onValueChange={(v) => setSort(v as ProductSort)}
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

          <p className="mb-5 text-sm text-muted-foreground">
            {isLoading
              ? "Loading products…"
              : `Showing ${list.length} of ${total} ${total === 1 ? "product" : "products"}`}
          </p>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-2xl" />
              ))}
            </div>
          ) : list.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-secondary/40 py-16 text-center">
              <PackageOpen className="size-10 text-muted-foreground" />
              <div>
                <p className="font-display text-lg font-semibold text-foreground">
                  Nothing here yet
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  We're restocking this category soon.
                </p>
              </div>
              <Button asChild variant="outline">
                <Link to="/shop">Shop all products</Link>
              </Button>
            </div>
          ) : (
            <>
              <StaggerGroup className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
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
                    All {total} products in {displayCategoryName} loaded
                  </span>
                ) : null}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
