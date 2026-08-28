"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  count?: number;
  size?: number;
  showCount?: boolean;
  className?: string;
  countClassName?: string;
}

export function StarRating({
  rating,
  count,
  size = 14,
  showCount = true,
  className,
  countClassName,
}: StarRatingProps) {
  const safeRating = Math.max(0, Math.min(5, Number(rating) || 0));

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-0.5" aria-label={`Rating: ${safeRating.toFixed(1)} out of 5`}>
        {[1, 2, 3, 4, 5].map((i) => {
          const fillPercentage = Math.max(0, Math.min(100, (safeRating - (i - 1)) * 100));

          if (fillPercentage >= 100) {
            return (
              <Star
                key={i}
                style={{ width: size, height: size }}
                className="fill-accent text-accent transition-colors shrink-0"
              />
            );
          }

          if (fillPercentage <= 0) {
            return (
              <Star
                key={i}
                style={{ width: size, height: size }}
                className="fill-transparent text-muted-foreground/35 transition-colors shrink-0"
              />
            );
          }

          // Partial fill star with SVG mask / clip
          return (
            <div key={i} className="relative shrink-0" style={{ width: size, height: size }}>
              <Star
                style={{ width: size, height: size }}
                className="absolute inset-0 fill-transparent text-muted-foreground/35"
              />
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fillPercentage}%` }}
              >
                <Star
                  style={{ width: size, height: size }}
                  className="fill-accent text-accent shrink-0 max-w-none"
                />
              </div>
            </div>
          );
        })}
      </div>
      {showCount && (
        <span className={cn("text-xs font-medium text-muted-foreground", countClassName)}>
          {safeRating > 0 ? (
            <span className="text-foreground/90 font-semibold">{safeRating.toFixed(1)}</span>
          ) : (
            <span className="text-accent font-semibold">New</span>
          )}
          {typeof count === "number" && count > 0 ? (
            <span className="ml-1 text-muted-foreground/80">({count})</span>
          ) : null}
        </span>
      )}
    </div>
  );
}

interface StarInputProps {
  value: number;
  onChange: (v: number) => void;
  size?: number;
  className?: string;
}

export function StarInput({ value, onChange, size = 24, className }: StarInputProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const activeRating = hovered !== null ? hovered : value;

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
          onClick={() => onChange(i)}
          className="transition-transform duration-150 hover:scale-125 active:scale-95 focus:outline-hidden"
          aria-label={`Rate ${i} star${i > 1 ? "s" : ""}`}
        >
          <Star
            style={{ width: size, height: size }}
            className={cn(
              "transition-colors duration-150",
              i <= activeRating
                ? "fill-accent text-accent drop-shadow-[0_2px_8px_rgba(234,179,8,0.35)]"
                : "fill-transparent text-muted-foreground/35 hover:text-muted-foreground",
            )}
          />
        </button>
      ))}
      <span className="ml-2 text-xs font-semibold text-foreground">
        {activeRating === 5
          ? "⭐⭐⭐⭐⭐ Exceptional"
          : activeRating === 4
            ? "⭐⭐⭐⭐ Very Good"
            : activeRating === 3
              ? "⭐⭐⭐ Average"
              : activeRating === 2
                ? "⭐⭐ Fair"
                : "⭐ Poor"}
      </span>
    </div>
  );
}
