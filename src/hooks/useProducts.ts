"use client";

import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
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
  category?: CategorySlug | string | "";
  categorySlug?: string;
  brand?: string;
  search?: string;
  maxPrice?: number;
  sort?: ProductSort;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function buildQuery(filters: ProductFilters, page = 1, limit = 20) {
  const p = new URLSearchParams();
  p.set("page", page.toString());
  p.set("limit", limit.toString());
  const cat = filters.categorySlug || filters.category;
  if (cat) p.set("categorySlug", cat);
  if (filters.brand) p.set("brand", filters.brand);
  if (filters.search?.trim()) p.set("search", filters.search.trim());
  if (typeof filters.maxPrice === "number") {
    p.set("maxPrice", Math.round(filters.maxPrice * 100).toString());
  }
  if (filters.sort) p.set("sort", filters.sort);
  return `?${p.toString()}`;
}

export function useInfiniteProducts(filters: ProductFilters = {}, limit = 24) {
  return useInfiniteQuery<PaginatedResponse<ApiProduct>>({
    queryKey: ["products", "infinite", filters, limit],
    queryFn: async ({ pageParam = 1 }) => {
      const q = buildQuery(filters, pageParam as number, limit);
      const res = await api.get<PaginatedResponse<ApiProduct>>(`storefront/products${q}`);
      return res;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage?.meta) return undefined;
      const { page, totalPages } = lastPage.meta;
      return page < totalPages ? page + 1 : undefined;
    },
    staleTime: 1000 * 60 * 3,
  });
}

export function useProducts(filters: ProductFilters = {}) {
  return useQuery<Product[]>({
    queryKey: ["products", filters],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<ApiProduct>>(
        `storefront/products${buildQuery(filters, 1, 50)}`,
      );
      return res.data.map(mapApiProduct);
    },
    staleTime: 1000 * 60 * 3,
  });
}
