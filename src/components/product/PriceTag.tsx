import { Badge } from "@/components/ui/badge";
import { formatGHS } from "@/lib/format";
import { cn } from "@/lib/utils";

interface PriceTagProps {
  price: number;
  compareAtPrice?: number | null;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function PriceTag({
  price,
  compareAtPrice,
  className,
  size = "md",
}: PriceTagProps) {
  const hasDiscount =
    compareAtPrice != null && compareAtPrice > price;
  const pct = hasDiscount
    ? Math.round((1 - price / (compareAtPrice as number)) * 100)
    : 0;

  const priceSize =
    size === "lg" ? "text-2xl" : size === "sm" ? "text-sm" : "text-base";

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className={cn("font-semibold text-foreground", priceSize)}>
        {formatGHS(price)}
      </span>
      {hasDiscount && (
        <span className="text-sm text-muted-foreground line-through">
          {formatGHS(compareAtPrice as number)}
        </span>
      )}
      {hasDiscount && pct > 0 && (
        <Badge className="bg-accent text-accent-foreground hover:bg-accent">
          −{pct}%
        </Badge>
      )}
    </div>
  );
}
