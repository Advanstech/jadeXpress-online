"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { mapApiProduct, type ApiProduct } from "@/lib/mappers";
import type { Product, Review } from "@/types";

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useProduct(slug: string | undefined) {
  return useQuery<Product | null>({
    queryKey: ["product", slug],
    enabled: !!slug,
    queryFn: async () => {
      if (!slug) return null;
      const p = await api.get<ApiProduct>(
        `storefront/products/slug/${encodeURIComponent(slug)}`,
      );
      return mapApiProduct(p);
    },
  });
}

export function useReviews(productId: string | undefined) {
  return useQuery<Review[]>({
    queryKey: ["reviews", productId],
    enabled: !!productId,
    queryFn: async () => [],
  });
}

export function useRelatedProducts(product: Product | undefined) {
  return useQuery<Product[]>({
    queryKey: ["related", product?.slug],
    enabled: !!product,
    queryFn: async () => {
      if (!product) return [];
      const res = await api.get<PaginatedResponse<ApiProduct>>(
        `storefront/products?categorySlug=${encodeURIComponent(
          product.categorySlug,
        )}&limit=5&page=1`,
      );
      return res.data
        .map(mapApiProduct)
        .filter((p) => p.id !== product.id)
        .slice(0, 4);
    },
  });
}
