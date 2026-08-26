"use client";
import { Link } from "@/components/Link";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useWishlist } from "@/hooks/useWishlist";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StaggerGroup, staggerItem } from "@/components/motion/Reveal";

export default function Wishlist() {
  const { products, isLoading } = useWishlist();

  return (
    <div className="space-y-6">
      <div>
        <span className="eyebrow">Account</span>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">
          Your wishlist
        </h1>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-secondary/30 py-16 text-center">
          <Heart className="size-10 text-muted-foreground" />
          <div>
            <p className="font-display text-lg font-semibold text-foreground">
              No saved items yet
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Tap the heart on any product to save it for later.
            </p>
          </div>
          <Button asChild className="shadow-gold">
            <Link to="/shop">Browse products</Link>
          </Button>
        </div>
      ) : (
        <StaggerGroup className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3">
          {products.map((p) => (
            <motion.div key={p.id} variants={staggerItem}>
              <ProductCard product={p} />
            </motion.div>
          ))}
        </StaggerGroup>
      )}
    </div>
  );
}
