"use client";
import { Link } from "@/components/Link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/product/ProductCard";
import { Reveal, StaggerGroup, staggerItem } from "@/components/motion/Reveal";
import { useProducts } from "@/hooks/useProducts";
import { motion } from "framer-motion";

export function FeaturedProducts() {
  const { data: products, isLoading } = useProducts();
  const featured = (products ?? []).filter((p) => p.isFeatured).slice(0, 8);

  return (
    <section className="bg-secondary/50 py-20 md:py-28">
      <div className="container">
        <Reveal className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <span className="eyebrow">Handpicked for you</span>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Featured favourites
            </h2>
            <p className="mt-4 text-muted-foreground">
              The formulas our shoppers reach for again and again — backed by
              real reviews.
            </p>
          </div>
          <Button asChild variant="outline" className="shrink-0">
            <Link to="/shop">
              View all products
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </Reveal>

        <StaggerGroup className="mt-12 grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3"
                >
                  <Skeleton className="aspect-square w-full rounded-md" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ))
            : featured.map((p) => (
                <motion.div key={p.id} variants={staggerItem}>
                  <ProductCard product={p} />
                </motion.div>
              ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
