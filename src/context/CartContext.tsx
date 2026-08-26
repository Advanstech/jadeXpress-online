"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartItem, Product } from "@/types";

const STORAGE_KEY = "jadexpress_cart_v1";

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isCartOpen: boolean;
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function loadLocal(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadLocal);
  const [isCartOpen, setCartOpen] = useState(false);

  // Persist the working cart to localStorage (guest source of truth).
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore quota errors */
    }
  }, [items]);

  const addItem = useCallback(
    (product: Product, quantity = 1) => {
      setItems((prev) => {
        const max = product.stock;
        const existing = prev.find((i) => i.productId === product.id);
        const next = existing
          ? prev.map((i) =>
              i.productId === product.id
                ? { ...i, quantity: Math.min(max, i.quantity + quantity) }
                : i,
            )
          : [
              ...prev,
              {
                productId: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                image: product.images[0] ?? "",
                quantity: Math.min(max, quantity),
                maxStock: max,
              },
            ];
        return next;
      });
      setCartOpen(true);
    },
    [],
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      setItems((prev) => {
        const next = prev
          .map((i) =>
            i.productId === productId
              ? {
                  ...i,
                  quantity: Math.max(0, Math.min(i.maxStock, quantity)),
                }
              : i,
          )
          .filter((i) => i.quantity > 0);
        return next;
      });
    },
    [],
  );

  const removeItem = useCallback(
    (productId: string) => {
      setItems((prev) => prev.filter((i) => i.productId !== productId));
    },
    [],
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);

  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );
  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items],
  );

  const value: CartContextValue = {
    items,
    itemCount,
    subtotal,
    isCartOpen,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    openCart,
    closeCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
