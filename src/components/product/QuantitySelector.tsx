import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
  value: number;
  onChange: (v: number) => void;
  max: number;
  min?: number;
  className?: string;
}

export function QuantitySelector({
  value,
  onChange,
  max,
  min = 1,
  className,
}: QuantitySelectorProps) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-full border border-border bg-card p-1",
        className,
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8 rounded-full"
        onClick={dec}
        disabled={value <= min}
        aria-label="Decrease quantity"
      >
        <Minus className="size-4" />
      </Button>
      <span className="w-7 text-center text-sm font-semibold tabular-nums">
        {value}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8 rounded-full"
        onClick={inc}
        disabled={value >= max}
        aria-label="Increase quantity"
      >
        <Plus className="size-4" />
      </Button>
    </div>
  );
}
