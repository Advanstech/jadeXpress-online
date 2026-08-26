"use client";
import { Link } from "@/components/Link";
import { Heart, ShoppingBag } from "lucide-react";
import type { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StarRating } from "./StarRating";
import { PriceTag } from "./PriceTag";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const { user } = useAuth();
  const outOfStock = product.stock <= 0;
  const image = product.images[0] ?? "";

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-elegant">
      <Link
        to={`/product/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-secondary"
      >
        <img
          src={image}
          alt={product.name}
          crossOrigin="anonymous"
          loading="lazy"
          className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {product.isBestseller && (
          <Badge className="absolute left-3 top-3 bg-accent text-accent-foreground hover:bg-accent">
            Bestseller
          </Badge>
        )}
        {outOfStock && (
          <div className="absolute inset-0 grid place-items-center bg-background/70 backdrop-blur-[1px]">
            <span className="rounded-full bg-foreground/90 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-background">
              Out of stock
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-4">
        <span className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
          {product.brand}
        </span>
        <Link
          to={`/product/${product.slug}`}
          className="font-display text-[15px] font-semibold leading-snug text-foreground transition-colors hover:text-primary sm:text-base"
        >
          {product.name}
        </Link>
        <StarRating rating={product.rating} count={product.reviewCount} />
        <p className="line-clamp-2 break-words text-xs text-muted-foreground">
          {product.shortDescription}
        </p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <PriceTag price={product.price} compareAtPrice={product.compareAtPrice} />
          <Button
            size="icon"
            className="size-9 rounded-full shadow-gold transition-transform hover:scale-105"
            disabled={outOfStock}
            onClick={() => addItem(product)}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingBag className="size-4" />
          </Button>
        </div>
      </div>

      {user && (
        <button
          type="button"
          onClick={() => toggle(product.id)}
          className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-background/85 text-foreground shadow-soft backdrop-blur transition-colors hover:text-primary"
          aria-label="Toggle wishlist"
        >
          <Heart
            className={cn(
              "size-4",
              isWishlisted(product.id) && "fill-destructive text-destructive",
            )}
          />
        </button>
      )}
    </div>
  );
}
