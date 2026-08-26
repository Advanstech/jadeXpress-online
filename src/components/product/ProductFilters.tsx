"use client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { ProductFilters } from "@/hooks/useProducts";
import type { Category } from "@/types";
import { formatGHS } from "@/lib/format";

interface ProductFiltersContentProps {
  filters: ProductFilters;
  onChange: (next: ProductFilters) => void;
  categories: Category[];
  brands: string[];
  maxPriceBound: number;
}

export function ProductFiltersContent({
  filters,
  onChange,
  categories,
  brands,
  maxPriceBound,
}: ProductFiltersContentProps) {
  const maxPrice = filters.maxPrice ?? maxPriceBound;
  const set = (patch: Partial<ProductFilters>) =>
    onChange({ ...filters, ...patch });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-foreground">
          Category
        </h3>
        <RadioGroup
          value={filters.category ?? "all"}
          onValueChange={(v) =>
            set({ category: v === "all" ? "" : (v as ProductFilters["category"]) })
          }
          className="mt-3 gap-2"
        >
          <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground/80 hover:text-foreground">
            <RadioGroupItem value="all" id="cat-all" />
            All products
          </label>
          {categories.map((c) => (
            <label
              key={c.id}
              className="flex cursor-pointer items-center gap-2 text-sm text-foreground/80 hover:text-foreground"
            >
              <RadioGroupItem value={c.slug} id={`cat-${c.slug}`} />
              {c.name}
            </label>
          ))}
        </RadioGroup>
      </div>

      <Separator />

      <div>
        <h3 className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-foreground">
          Brand
        </h3>
        <RadioGroup
          value={filters.brand ?? "all"}
          onValueChange={(v) => set({ brand: v === "all" ? "" : v })}
          className="mt-3 gap-2"
        >
          <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground/80 hover:text-foreground">
            <RadioGroupItem value="all" id="brand-all" />
            All brands
          </label>
          {brands.map((b) => (
            <label
              key={b}
              className="flex cursor-pointer items-center gap-2 text-sm text-foreground/80 hover:text-foreground"
            >
              <RadioGroupItem value={b} id={`brand-${b}`} />
              {b}
            </label>
          ))}
        </RadioGroup>
      </div>

      <Separator />

      <div>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-foreground">
            Max price
          </h3>
          <span className="text-sm font-semibold text-primary">
            {formatGHS(maxPrice)}
          </span>
        </div>
        <Slider
          value={[maxPrice]}
          min={0}
          max={maxPriceBound}
          step={5}
          onValueChange={(v) => set({ maxPrice: v[0] })}
          className="mt-4"
        />
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>GHS 0</span>
          <span>{formatGHS(maxPriceBound)}</span>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => onChange({ category: "", brand: "", maxPrice: maxPriceBound })}
      >
        Clear filters
      </Button>
    </div>
  );
}
