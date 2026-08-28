"use client";

import { api } from "@/lib/api";
import type { OrderShippingAddress } from "@/types";

export interface TrackedOrderItem {
  name: string;
  price: number;
  quantity: number;
  image: string | null;
}

export interface TrackedTimelineEvent {
  status: string;
  note: string;
  createdAt: string;
}

export interface TrackedOrder {
  id: string;
  orderNumber: string;
  email: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  currency: string;
  shippingAddress: OrderShippingAddress;
  createdAt: string;
  items: TrackedOrderItem[];
  timeline: TrackedTimelineEvent[];
}

interface ApiOrderItem {
  name: string;
  pricePesewas: number;
  quantity: number;
  image: string | null;
}

interface ApiOrder {
  id: string;
  orderNumber: string;
  email: string;
  status: string;
  paymentStatus: string;
  subtotalPesewas: number;
  shippingFeePesewas: number;
  totalPesewas: number;
  currency: string;
  shippingAddress: OrderShippingAddress;
  createdAt: string;
  items: ApiOrderItem[];
  timeline: TrackedTimelineEvent[];
}

export async function trackOrder(
  orderNumber: string,
  email: string,
): Promise<TrackedOrder | null> {
  const url =
    `storefront/orders/track?orderNumber=${encodeURIComponent(orderNumber)}` +
    `&email=${encodeURIComponent(email)}`;
  try {
    const o = await api.get<ApiOrder>(url);
    return {
      id: o.id,
      orderNumber: o.orderNumber,
      email: o.email,
      status: o.status,
      paymentStatus: o.paymentStatus,
      subtotal: o.subtotalPesewas / 100,
      shippingFee: o.shippingFeePesewas / 100,
      total: o.totalPesewas / 100,
      currency: o.currency,
      shippingAddress: o.shippingAddress,
      createdAt: o.createdAt,
      items: o.items.map((i) => ({
        name: i.name,
        price: i.pricePesewas / 100,
        quantity: i.quantity,
        image: i.image,
      })),
      timeline: o.timeline,
    };
  } catch {
    return null;
  }
}
