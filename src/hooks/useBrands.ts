"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

/**
 * Distinct active product brands from the catalogue, so the homepage partners
 * strip stays in sync with what's actually in stock.
 */
export function useBrands() {
  return useQuery<string[]>({
    queryKey: ["brands"],
    queryFn: async () => {
      const brands = await api.get<string[]>("storefront/brands");
      return brands.filter((b): b is string => typeof b === "string" && !!b.trim());
    },
  });
}
