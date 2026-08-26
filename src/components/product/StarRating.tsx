import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  count?: number;
  size?: number;
  showCount?: boolean;
  className?: string;
}

export function StarRating({
  rating,
  count,
  size = 14,
  showCount = true,
  className,
}: StarRatingProps) {
  const rounded = Math.round(rating);
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            style={{ width: size, height: size }}
            className={cn(
              i <= rounded
                ? "fill-accent text-accent"
                : "fill-transparent text-muted-foreground/40",
            )}
          />
        ))}
      </div>
      {showCount && (
        <span className="text-xs text-muted-foreground">
          {rating > 0 ? rating.toFixed(1) : "New"}
          {typeof count === "number" && count > 0 ? ` (${count})` : ""}
        </span>
      )}
    </div>
  );
}

interface StarInputProps {
  value: number;
  onChange: (v: number) => void;
  size?: number;
}

export function StarInput({ value, onChange, size = 24 }: StarInputProps) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          className="transition-transform hover:scale-110"
          aria-label={`${i} stars`}
        >
          <Star
            style={{ width: size, height: size }}
            className={cn(
              i <= value
                ? "fill-accent text-accent"
                : "fill-transparent text-muted-foreground/40",
            )}
          />
        </button>
      ))}
    </div>
  );
}
