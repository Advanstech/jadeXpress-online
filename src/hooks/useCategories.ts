"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { mapApiCategory, type ApiCategory } from "@/lib/mappers";
import type { Category } from "@/types";

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const rows = await api.get<ApiCategory[]>("storefront/categories");
      return rows.map(mapApiCategory);
    },
    staleTime: 1000 * 60 * 10,
  });
}
