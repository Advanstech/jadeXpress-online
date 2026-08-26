"use client";
import { useState } from "react";
import { Link } from "@/components/Link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronRight, PackageOpen, Search } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import {
  useProducts,
  type ProductSort,
} from "@/hooks/useProducts";
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
import type { CategorySlug } from "@/types";

const sortOptions: { value: ProductSort; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
];

export default function CategoryPage() {
  const { slug } = useParams();
  const { data: categories, isLoading: catLoading } = useCategories();
  const category = (categories ?? []).find((c) => c.slug === slug);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<ProductSort>("featured");
  const { data: products, isLoading } = useProducts({
    category: slug as CategorySlug | undefined,
    search,
    sort,
  });
  const list = products ?? [];

  return (
    <>
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <img
          src={category?.image}
          alt={category?.name ?? "Category"}
          crossOrigin="anonymous"
          className="absolute inset-0 size-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/85 to-primary/60" />
        <div className="container relative z-10 py-14 md:py-20">
          <Reveal>
            <nav className="flex items-center gap-1 text-xs text-primary-foreground/70">
              <Link to="/" className="hover:text-primary-foreground">Home</Link>
              <ChevronRight className="size-3" />
              <Link to="/shop" className="hover:text-primary-foreground">Shop</Link>
              <ChevronRight className="size-3" />
              <span className="text-primary-foreground">{category?.name}</span>
            </nav>
            <span className="mt-4 inline-block eyebrow">{category?.tagline}</span>
            <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight md:text-5xl">
              {catLoading ? "…" : category?.name ?? "Category"}
            </h1>
            {category?.description && (
              <p className="mt-3 max-w-xl text-primary-foreground/80">
                {category.description}
              </p>
            )}
          </Reveal>
        </div>
      </section>

      <section className="bg-background py-10">
        <div className="container">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs sm:flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={`Search ${category?.name ?? "products"}…`}
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
            {isLoading ? "Loading…" : `${list.length} ${list.length === 1 ? "product" : "products"}`}
          </p>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          ) : list.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border bg-secondary/40 py-16 text-center">
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
            <StaggerGroup className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
              {list.map((p) => (
                <motion.div key={p.id} variants={staggerItem}>
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </StaggerGroup>
          )}
        </div>
      </section>
    </>
  );
}
