// Shared domain types for the JadeXpress storefront.

export type CategorySlug = "vitamins" | "supplements" | "cosmetics";

export interface Category {
  id: string;
  slug: CategorySlug;
  name: string;
  tagline: string;
  description: string;
  image: string;
  sortOrder: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  genericName?: string;
  dosageForm?: string;
  strength?: string;
  packSize?: number;
  unit?: string;
  categoryId: string | null;
  categorySlug: CategorySlug;
  price: number; // GHS
  compareAtPrice?: number | null;
  sku: string;
  stock: number;
  rating: number;
  reviewCount: number;
  images: string[];
  shortDescription: string;
  description: string;
  ingredients: string;
  usage: string;
  benefits: string[];
  isFeatured: boolean;
  isBestseller: boolean;
  /** active | inactive */
  status: string;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  maxStock: number;
}

export interface Address {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  country: string;
  region: string;
  city: string;
  street: string;
  digitalAddress?: string | null;
  isDefault: boolean;
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderStatusEvent {
  status: OrderStatus;
  note: string;
  createdAt: string;
}

export interface OrderShippingAddress {
  recipientName: string;
  phone: string;
  email: string;
  country: string;
  region: string;
  city: string;
  street: string;
  digitalAddress?: string | null;
  /** Courier quote attached at checkout (Speedaf / DHL mock). */
  courier?: {
    provider?: string;
    service?: string;
    eta?: string;
    trackingNumber?: string;
  } | null;
}

export interface OrderItem {
  id: string;
  productId: string | null;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  email: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: "unpaid" | "paid" | "demo";
  paymentReference?: string | null;
  paymentGateway?: string | null;
  paymentMethod?: string | null;
  shippingAddress: OrderShippingAddress;
  createdAt: string;
  timeline: OrderStatusEvent[];
}
