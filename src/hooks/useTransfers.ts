"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Store {
  id: string;
  name: string;
  code: string;
}

export interface TransferItem {
  id: string;
  transferId: string;
  productId: string;
  quantityRequested: number;
  quantityDispatched: number;
  quantityReceived: number;
  unitCostPesewas: number;
  product: {
    id: string;
    name: string;
    sku: string;
  };
}

export interface StockTransfer {
  id: string;
  transferNumber: string;
  fromStoreId: string;
  toStoreId: string;
  status: "draft" | "pending_approval" | "approved" | "in_transit" | "received" | "rejected" | "cancelled";
  initiatedById: string | null;
  receivedById: string | null;
  notes: string | null;
  dispatchedAt: string | null;
  receivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  fromStore: Store;
  toStore: Store;
  items: TransferItem[];
}

export function useTransfers() {
  return useQuery<StockTransfer[]>({
    queryKey: ["admin", "transfers"],
    queryFn: async () => {
      const res = await api.get<StockTransfer[]>("inventory/transfers");
      return res;
    },
  });
}

export function useStores() {
  return useQuery<Store[]>({
    queryKey: ["admin", "stores"],
    queryFn: async () => {
      // Temporary workaround if we don't have a /stores endpoint
      // the transfer endpoints usually need stores.
      // If no endpoint, we can use a hardcoded list or add an endpoint later.
      // For now we assume api/src/modules/organisation exists or we can just fetch from a new endpoint.
      return api.get<Store[]>("storefront/stores").catch(() => [
        { id: "eb670b3e-e76e-4cc7-ab9d-3f034e321abc", name: "Israel Park", code: "ISR" },
        { id: "e033f9e9-158f-4d4f-b649-51000a6c0e5a", name: "Sowutuom", code: "SWT" }
      ]);
    },
  });
}

import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      return api.post("inventory/transfers", data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "transfers"] });
    },
  });
}

export function useTransfer(id: string) {
  return useQuery<StockTransfer>({
    queryKey: ["admin", "transfers", id],
    queryFn: async () => {
      return api.get<StockTransfer>(`inventory/transfers/${id}`);
    },
    enabled: !!id,
  });
}

export function useApproveTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      return api.put(`inventory/transfers/${id}/approve`, { notes });
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["admin", "transfers"] });
    },
  });
}

export function useRejectTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      return api.put(`inventory/transfers/${id}/reject`, { notes });
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["admin", "transfers"] });
    },
  });
}
