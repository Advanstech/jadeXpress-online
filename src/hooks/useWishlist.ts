"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { mapApiProduct, type ApiProduct } from "@/lib/mappers";
import { useAuth } from "@/context/AuthContext";
import type { Product } from "@/types";

const WISH_KEY = "jx_wishlist";

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function loadIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WISH_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveIds(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(WISH_KEY, JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}

export function useWishlist() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery<{ products: Product[]; ids: Set<string> }>({
    queryKey: ["wishlist", user?.id],
    queryFn: async () => {
      const ids = new Set<string>(loadIds());
      if (ids.size === 0) return { products: [] as Product[], ids };
      const res = await api.get<PaginatedResponse<ApiProduct>>(
        "storefront/products?limit=200&page=1",
      );
      const products = res.data
        .filter((p) => ids.has(p.id))
        .map(mapApiProduct);
      return { products, ids };
    },
  });

  const data = query.data ?? { products: [] as Product[], ids: new Set<string>() };

  const toggle = async (productId: string) => {
    const current = new Set<string>(loadIds());
    if (current.has(productId)) {
      current.delete(productId);
    } else {
      current.add(productId);
    }
    saveIds(Array.from(current));
    await qc.invalidateQueries({ queryKey: ["wishlist"] });
  };

  const isWishlisted = (productId: string) => data.ids.has(productId);

  return {
    products: data.products,
    ids: data.ids,
    isWishlisted,
    toggle,
    isLoading: query.isLoading,
  };
}
