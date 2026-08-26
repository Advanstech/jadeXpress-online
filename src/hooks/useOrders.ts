"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { Order, OrderItem, OrderShippingAddress, OrderStatus, OrderStatusEvent } from "@/types";

interface ApiOrderItem {
  id: string;
  orderId: string;
  productId: string | null;
  name: string;
  pricePesewas: number;
  quantity: number;
  image: string | null;
}

export interface ApiOrder {
  id: string;
  orderNumber: string;
  email: string;
  customerId?: string | null;
  storeId?: string | null;
  status: string;
  paymentStatus: string;
  paymentReference?: string | null;
  paymentGateway?: string | null;
  paymentMethod?: string | null;
  subtotalPesewas: number;
  shippingFeePesewas: number;
  totalPesewas: number;
  currency: string;
  shippingAddress: OrderShippingAddress;
  timeline: Array<{ status: string; note: string; createdAt: string }>;
  createdAt: string;
  items?: ApiOrderItem[];
}

function mapApiOrderItem(item: ApiOrderItem): OrderItem {
  return {
    id: item.id,
    productId: item.productId,
    name: item.name,
    price: item.pricePesewas / 100,
    quantity: item.quantity,
    image: item.image,
  };
}

export function mapApiOrder(o: ApiOrder): Order {
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    email: o.email,
    items: (o.items ?? []).map(mapApiOrderItem),
    subtotal: o.subtotalPesewas / 100,
    shippingFee: o.shippingFeePesewas / 100,
    total: o.totalPesewas / 100,
    currency: o.currency ?? "GHS",
    status: o.status as OrderStatus,
    paymentStatus: o.paymentStatus as Order["paymentStatus"],
    paymentReference: o.paymentReference,
    paymentGateway: o.paymentGateway,
    paymentMethod: o.paymentMethod,
    shippingAddress: o.shippingAddress as OrderShippingAddress,
    createdAt: o.createdAt,
    timeline: (o.timeline ?? []).map((t) => ({
      status: t.status as OrderStatus,
      note: t.note,
      createdAt: t.createdAt,
    })) as OrderStatusEvent[],
  };
}

export function useOrders() {
  const { user } = useAuth();
  return useQuery<Order[]>({
    queryKey: ["orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return [];
      const orders = await api.get<ApiOrder[]>("storefront/orders/mine");
      return orders.map(mapApiOrder);
    },
  });
}

export function useOrder(orderNumber: string | undefined) {
  const { user } = useAuth();
  return useQuery<Order | null>({
    queryKey: ["order", orderNumber],
    enabled: !!user && !!orderNumber,
    queryFn: async () => {
      if (!user || !orderNumber) return null;
      const url =
        `storefront/orders/track?orderNumber=${encodeURIComponent(orderNumber)}` +
        `&email=${encodeURIComponent(user.email)}`;
      const o = await api.get<ApiOrder>(url);
      return mapApiOrder(o);
    },
  });
}

export function useInvalidateOrders() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["orders"] });
    qc.invalidateQueries({ queryKey: ["order"] });
  };
}
