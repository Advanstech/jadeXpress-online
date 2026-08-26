"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { mapApiOrder, type ApiOrder } from "@/hooks/useOrders";
import type { Order, Product, CategorySlug } from "@/types";

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ApiProduct {
  id: string;
  sku: string;
  slug?: string | null;
  name: string;
  genericName?: string | null;
  brand?: string | null;
  description?: string | null;
  shortDescription?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
  categorySlug?: string | null;
  type?: string | null;
  status: string;
  sellingPricePesewas: number;
  compareAtPricePesewas?: number | null;
  images?: string[];
  imageUrl?: string | null;
  quantity?: number;
  stockLevel?: number;
  isFeatured?: boolean;
  isBestseller?: boolean;
  rating?: number;
  reviewCount?: number;
  ingredients?: string | null;
  usageInstructions?: string | null;
  benefits?: string[];
}

function mapApiProduct(p: ApiProduct): Product {
  const images: string[] =
    p.images && p.images.length > 0
      ? p.images
      : p.imageUrl
        ? [p.imageUrl]
        : [];

  return {
    id: p.id,
    slug: p.slug ?? "",
    name: p.name,
    brand: p.brand ?? "",
    categoryId: p.categoryId ?? null,
    categorySlug: (p.categorySlug ?? p.categoryName ?? "supplements") as CategorySlug,
    price: p.sellingPricePesewas / 100,
    compareAtPrice:
      p.compareAtPricePesewas != null ? p.compareAtPricePesewas / 100 : null,
    sku: p.sku,
    stock: p.quantity ?? p.stockLevel ?? 0,
    rating: Number(p.rating ?? 0),
    reviewCount: p.reviewCount ?? 0,
    images,
    shortDescription: p.shortDescription ?? "",
    description: p.description ?? "",
    ingredients: p.ingredients ?? "",
    usage: p.usageInstructions ?? "",
    benefits: p.benefits ?? [],
    isFeatured: p.isFeatured ?? false,
    isBestseller: p.isBestseller ?? false,
    status: p.status,
  };
}

interface ApiCustomer {
  id: string;
  firstName: string;
  lastName?: string | null;
  phone?: string | null;
  email?: string | null;
  createdAt: string;
}

export interface AdminCustomer {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: string | null;
  created_at: string | null;
}

function mapApiCustomer(c: ApiCustomer): AdminCustomer {
  const full = `${c.firstName} ${c.lastName ?? ""}`.trim();
  return {
    id: c.id,
    full_name: full || null,
    phone: c.phone ?? null,
    role: "customer",
    created_at: c.createdAt,
  };
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  read: boolean;
  created_at: string;
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const [orders, customersRes, productsRes] = await Promise.all([
        api.get<ApiOrder[]>("storefront/orders").catch(() => [] as ApiOrder[]),
        api
          .get<PaginatedResponse<{ id: string }>>("customers?limit=1&page=1")
          .catch(() => ({ data: [], meta: { total: 0 } }) as PaginatedResponse<{ id: string }>),
        api
          .get<PaginatedResponse<{ id: string }>>("inventory/products?limit=1&page=1")
          .catch(() => ({ data: [], meta: { total: 0 } }) as PaginatedResponse<{ id: string }>),
      ]);

      const paid = orders.filter((o) => o.paymentStatus === "paid");
      const revenue = paid.reduce((sum, o) => sum + o.totalPesewas / 100, 0);

      return {
        orders: orders.length,
        pending: orders.filter((o) => o.status === "pending").length,
        revenue,
        products: productsRes.meta.total,
        customers: customersRes.meta.total,
        messages: 0,
        unread: 0,
      };
    },
  });
}

export function useAdminOrders() {
  return useQuery<Order[]>({
    queryKey: ["admin", "orders"],
    queryFn: async () => {
      const orders = await api.get<ApiOrder[]>("storefront/orders");
      return orders.map(mapApiOrder);
    },
  });
}

export function useAdminProducts() {
  return useQuery<Product[]>({
    queryKey: ["admin", "products"],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<ApiProduct>>(
        "inventory/products?limit=100&page=1",
      );
      return res.data.map(mapApiProduct);
    },
  });
}

export function useAdminCustomers() {
  return useQuery<AdminCustomer[]>({
    queryKey: ["admin", "customers"],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<ApiCustomer>>(
        "customers?limit=100&page=1",
      );
      return res.data.map(mapApiCustomer);
    },
  });
}

export function useAdminMessages() {
  return useQuery<ContactMessage[]>({
    queryKey: ["admin", "messages"],
    queryFn: async () => [],
  });
}

export function useInvalidateAdmin() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["admin"] });
  };
}
