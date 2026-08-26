"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { Address } from "@/types";

export function useAddresses() {
  const { user } = useAuth();
  return useQuery<Address[]>({
    queryKey: ["addresses", user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return [];
      return api.get<Address[]>("storefront/addresses");
    },
  });
}

export function useAddressMutations() {
  const qc = useQueryClient();

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ["addresses"] });

  const insert = async (input: Omit<Address, "id">) => {
    await api.post<Address>("storefront/addresses", input);
    await invalidate();
  };

  const update = async (id: string, input: Partial<Address>) => {
    await api.put<Address>(`storefront/addresses/${id}`, input);
    await invalidate();
  };

  const remove = async (id: string) => {
    await api.delete<void>(`storefront/addresses/${id}`);
    await invalidate();
  };

  const setDefault = async (id: string) => {
    await api.put<Address>(`storefront/addresses/${id}`, { isDefault: true });
    await invalidate();
  };

  return { insert, update, remove, setDefault };
}
