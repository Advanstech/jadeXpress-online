"use client";
import { Link } from "@/components/Link";
import { Minus, Plus, ShoppingBag, Trash2, Truck } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { formatGHS } from "@/lib/format";
import { SITE } from "@/config/site";

export function CartDrawer() {
  const {
    items,
    subtotal,
    itemCount,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeItem,
  } = useCart();

  const threshold = SITE.freeShippingThreshold;
  const remaining = Math.max(0, threshold - subtotal);
  const progress = Math.min(100, (subtotal / threshold) * 100);
  const unlocked = subtotal >= threshold;

  return (
    <Sheet open={isCartOpen} onOpenChange={(o) => (o ? null : closeCart())}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 border-border bg-background p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="flex items-center gap-2 font-display text-lg text-foreground">
            <ShoppingBag className="size-5 text-accent" />
            Your cart
            <span className="text-sm font-normal text-muted-foreground">
              ({itemCount})
            </span>
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="grid size-16 place-items-center rounded-full bg-secondary">
              <ShoppingBag className="size-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-foreground">
                Your cart is empty
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Discover vitamins, supplements and clean beauty.
              </p>
            </div>
            <SheetClose asChild>
              <Button asChild className="shadow-gold">
                <Link to="/shop">Start shopping</Link>
              </Button>
            </SheetClose>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              {/* Free shipping progress */}
              <div className="rounded-lg border border-border bg-secondary/60 p-3">
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Truck className="size-4 text-accent" />
                  {unlocked ? (
                    <span>You've unlocked free delivery!</span>
                  ) : (
                    <span>
                      Add{" "}
                      <strong className="text-primary">
                        {formatGHS(remaining)}
                      </strong>{" "}
                      for free delivery
                    </span>
                  )}
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-accent transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {items.map((item) => (
                <div key={item.productId} className="flex gap-3">
                  <Link
                    to={`/product/${item.slug}`}
                    onClick={closeCart}
                    className="size-20 shrink-0 overflow-hidden rounded-md border border-border bg-secondary"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      crossOrigin="anonymous"
                      className="size-full object-cover"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex justify-between gap-2">
                      <Link
                        to={`/product/${item.slug}`}
                        onClick={closeCart}
                        className="line-clamp-2 text-sm font-medium leading-tight text-foreground hover:text-primary"
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-muted-foreground transition-colors hover:text-destructive"
                        aria-label="Remove item"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatGHS(item.price)}
                    </span>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1">
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1)
                          }
                          className="grid size-6 place-items-center rounded-full hover:bg-secondary"
                          aria-label="Decrease"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.maxStock}
                          className="grid size-6 place-items-center rounded-full hover:bg-secondary disabled:opacity-40"
                          aria-label="Increase"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        {formatGHS(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Checkout & Summary Footer */}
            <div className="mt-auto border-t border-border bg-card/98 backdrop-blur-md px-5 py-4 sm:px-6 sm:py-5 shadow-xl">
              {/* Pricing breakdown */}
              <div className="space-y-2 pb-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Subtotal</span>
                  <span className="font-display text-xl font-bold text-foreground">
                    {formatGHS(subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Truck className="size-3.5 text-accent" /> Delivery
                  </span>
                  <span className={unlocked ? "font-semibold text-emerald-600 dark:text-emerald-400" : ""}>
                    {unlocked ? "Free Delivery Unlocked" : "Calculated at checkout"}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <SheetClose asChild>
                  <Button
                    asChild
                    size="lg"
                    className="w-full shadow-gold h-12 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-between px-5"
                  >
                    <Link to="/checkout">
                      <span className="flex items-center gap-2">
                        Checkout
                      </span>
                      <span className="flex items-center gap-1.5 font-bold tabular-nums">
                        {formatGHS(subtotal)}
                      </span>
                    </Link>
                  </Button>
                </SheetClose>

                <SheetClose asChild>
                  <Button
                    asChild
                    variant="outline"
                    size="default"
                    className="w-full h-10 text-xs font-medium border-border hover:bg-secondary text-foreground"
                  >
                    <Link to="/shop">
                      Continue shopping
                    </Link>
                  </Button>
                </SheetClose>
              </div>

              {/* Trust Badge */}
              <p className="mt-3 text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Secure Checkout • MoMo & Card Payments
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
