"use client";
import { useState } from "react";
import { PackageSearch, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Reveal } from "@/components/motion/Reveal";
import { OrderView } from "@/components/order/OrderView";
import { OrderExplainer } from "@/components/order/OrderExplainer";
import { trackOrder, type TrackedOrder } from "@/lib/orders";

export default function TrackOrder() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [searched, setSearched] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim() || !email.trim()) {
      toast.error("Enter both your order number and email.");
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const result = await trackOrder(orderNumber.trim(), email.trim());
      setOrder(result);
      if (!result) toast.error("No order found for those details.");
    } catch {
      toast.error("Could not look up your order. Please try again.");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background">
      <section className="bg-primary text-primary-foreground">
        <div className="container py-14 md:py-20">
          <span className="eyebrow">Track order</span>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Where's my order?
          </h1>
          <p className="mt-3 max-w-xl text-primary-foreground/80">
            Enter your order number and the email you used at checkout to see
            live delivery status.
          </p>
        </div>
      </section>

      <section className="container py-12">
        <div className="grid gap-10 lg:grid-cols-[420px_1fr]">
          <Reveal>
            <form
              onSubmit={submit}
              className="rounded-lg border border-border bg-card p-6 shadow-soft"
            >
              <div className="space-y-4">
                <div>
                  <Label className="mb-1.5 block text-sm font-medium">Order number</Label>
                  <Input
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="e.g. JX-ABC123456"
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block text-sm font-medium">Email</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
                <Button type="submit" className="w-full shadow-gold" disabled={loading}>
                  <Search className="mr-2 size-4" />
                  {loading ? "Searching…" : "Track order"}
                </Button>
              </div>
            </form>
          </Reveal>

          <div>
            {loading ? (
              <Skeleton className="h-96 w-full rounded-lg" />
            ) : order ? (
              <div className="space-y-4">
                <OrderExplainer orderNumber={order.orderNumber} email={order.email} />
                <Reveal>
                  <OrderView {...order} />
                </Reveal>
              </div>
            ) : searched ? (
              <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border bg-secondary/40 py-16 text-center">
                <PackageSearch className="size-10 text-muted-foreground" />
                <div>
                  <p className="font-display text-lg font-semibold text-foreground">
                    Order not found
                  </p>
                  <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                    Double-check your order number and the email used at
                    checkout. If you just placed it, give it a moment and try
                    again.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border bg-secondary/30 py-20 text-center text-sm text-muted-foreground">
                Your order status will appear here.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
