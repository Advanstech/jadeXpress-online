"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { mapApiProduct, type ApiProduct } from "@/lib/mappers";
import type { CategorySlug, Product } from "@/types";

export type ProductSort =
  | "featured"
  | "price-asc"
  | "price-desc"
  | "rating"
  | "newest";

export interface ProductFilters {
  category?: CategorySlug | "";
  brand?: string;
  search?: string;
  maxPrice?: number;
  sort?: ProductSort;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function buildQuery(filters: ProductFilters) {
  const p = new URLSearchParams();
  p.set("page", "1");
  p.set("limit", "20");
  if (filters.category) p.set("categorySlug", filters.category);
  if (filters.brand) p.set("brand", filters.brand);
  if (filters.search?.trim()) p.set("search", filters.search.trim());
  if (typeof filters.maxPrice === "number") {
    p.set("maxPrice", Math.round(filters.maxPrice * 100).toString());
  }
  if (filters.sort) p.set("sort", filters.sort);
  return `?${p.toString()}`;
}

export function useProducts(filters: ProductFilters = {}) {
  return useQuery<Product[]>({
    queryKey: ["products", filters],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<ApiProduct>>(
        `storefront/products${buildQuery(filters)}`,
      );
      return res.data.map(mapApiProduct);
    },
    staleTime: 1000 * 60 * 5,
  });
}
