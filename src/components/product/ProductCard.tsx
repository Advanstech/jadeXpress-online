"use client";
import { Link } from "@/components/Link";
import { Heart, ShoppingBag, PackageOpen } from "lucide-react";
import type { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StarRating } from "./StarRating";
import { PriceTag } from "./PriceTag";
import { getIntelligentTheme } from "@/lib/product-theme";

interface ProductCardProps {
  product: Product;
}

function StockBadge({ qty }: { qty: number }) {
  if (qty <= 0) {
    return (
      <span
        className="rounded-full px-2.5 py-0.5 text-[10px] font-bold shadow-xs backdrop-blur-md"
        style={{
          background: "rgba(239, 68, 68, 0.15)",
          color: "#ef4444",
          border: "1px solid rgba(239, 68, 68, 0.3)",
        }}
      >
        Out of Stock
      </span>
    );
  }
  if (qty < 10) {
    return (
      <span
        className="rounded-full px-2.5 py-0.5 text-[10px] font-bold shadow-xs backdrop-blur-md"
        style={{
          background: "rgba(245, 158, 11, 0.15)",
          color: "#f59e0b",
          border: "1px solid rgba(245, 158, 11, 0.3)",
        }}
      >
        Low: {qty}
      </span>
    );
  }
  return (
    <span
      className="rounded-full px-2.5 py-0.5 text-[10px] font-bold shadow-xs backdrop-blur-md"
      style={{
        background: "rgba(34, 197, 94, 0.15)",
        color: "#10b981",
        border: "1px solid rgba(34, 197, 94, 0.3)",
      }}
    >
      {qty} units
    </span>
  );
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const { user } = useAuth();
  const outOfStock = product.stock <= 0;
  const image = product.images?.[0] || "";
  const productHref = product.slug ? `/product/${product.slug}` : `/product/${product.id}`;
  const theme = getIntelligentTheme(product.categorySlug, product.name);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-elegant">
      <Link
        to={productHref}
        className="relative flex aspect-square w-full items-center justify-center overflow-hidden bg-card p-5 transition-all duration-300"
      >
        {/* Ambient Radial Spotlight Glow */}
        <div
          className="pointer-events-none absolute inset-0 opacity-85 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: theme.gradient }}
        />

        {image ? (
          <img
            src={image}
            alt={product.name}
            crossOrigin="anonymous"
            loading="lazy"
            className="relative z-10 size-full object-contain transition-all duration-500 group-hover:scale-105"
            style={{
              filter: "drop-shadow(0 10px 16px rgba(0, 0, 0, 0.18))",
            }}
          />
        ) : (
          <div className="relative z-10 flex size-full items-center justify-center text-muted-foreground/30">
            <PackageOpen className="size-14" style={{ color: theme.accent }} />
          </div>
        )}

        {/* Soft bottom vignette transition to card body */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-8 bg-gradient-to-t from-card to-transparent" />

        {/* Top Badges: Bestseller / Stock */}
        {product.isBestseller && (
          <Badge className="absolute left-2.5 top-2.5 z-20 bg-accent text-[10px] text-accent-foreground shadow-xs hover:bg-accent">
            Bestseller
          </Badge>
        )}

        <div className="absolute right-2.5 top-2.5 z-20">
          <StockBadge qty={product.stock} />
        </div>

        {/* Category Pill at bottom left */}
        <div className="absolute bottom-2.5 left-2.5 z-20">
          <span
            className="rounded-md px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest shadow-xs backdrop-blur-md"
            style={{
              color: theme.accent,
              background: theme.tagBg,
            }}
          >
            {product.categorySlug?.replace(/-/g, " ") || "Wellness"}
          </span>
        </div>
      </Link>

      <div className="relative z-20 flex flex-1 flex-col gap-2 p-3.5 sm:p-4">
        {/* Brand & Spec Row */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="font-semibold uppercase tracking-[0.14em] text-accent">
            {product.brand || "JadeXpress"}
          </span>
          {product.dosageForm ? (
            <span className="truncate rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-foreground/80">
              {product.dosageForm}
            </span>
          ) : (
            <span className="font-mono text-[10px] text-muted-foreground/70">
              {product.sku}
            </span>
          )}
        </div>

        {/* Product Title */}
        <Link
          to={productHref}
          className="line-clamp-2 font-display text-[15px] font-semibold leading-snug text-foreground transition-colors hover:text-primary sm:text-base"
        >
          {product.name}
        </Link>

        <StarRating rating={product.rating} count={product.reviewCount} />

        {/* Short Description */}
        {product.shortDescription && (
          <p className="line-clamp-2 break-words text-xs leading-relaxed text-muted-foreground">
            {product.shortDescription}
          </p>
        )}

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
          className="absolute right-3 top-12 z-30 grid size-8 place-items-center rounded-full bg-background/85 text-foreground shadow-soft backdrop-blur transition-colors hover:text-primary"
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

      {/* Hover Ambient Border Highlight */}
      <div
        className="pointer-events-none absolute inset-0 z-30 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          boxShadow: `inset 0 0 0 1.5px ${theme.accent}`,
        }}
      />
    </div>
  );
}
