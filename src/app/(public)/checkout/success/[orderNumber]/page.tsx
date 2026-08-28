"use client";
import { useEffect, useState } from "react";
import { Link } from "@/components/Link";
import { useParams, useSearchParams } from "next/navigation";
import { CheckCircle2, PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderView } from "@/components/order/OrderView";
import { Reveal } from "@/components/motion/Reveal";
import { trackOrder, type TrackedOrder } from "@/lib/orders";

export default function CheckoutSuccess() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string>("");
  const searchParams = useSearchParams();

  useEffect(() => {
    const raw = sessionStorage.getItem("jadexpress_last_order");
    const parsed = raw ? (JSON.parse(raw) as { orderNumber: string; email: string }) : null;
    const mail = parsed?.email ?? "";
    setEmail(mail);

    const confirm = async () => {
      if (!parsed?.orderNumber || !mail) {
        setLoading(false);
        return;
      }
      try {
        const o = await trackOrder(parsed.orderNumber, mail);
        setOrder(o);
        const ref = searchParams?.get("reference") || searchParams?.get("trxref");
        if (ref && o?.id) {
          await api.put(`storefront/orders/${o.id}/pay`, {
            reference: ref,
            gateway: "paystack",
          });
          const updated = await trackOrder(parsed.orderNumber, mail);
          setOrder(updated);
        }
      } catch {
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    confirm();
  }, [orderNumber, searchParams]);

  return (
    <div className="bg-background">
      <section className="bg-primary text-primary-foreground">
        <div className="container flex flex-col items-center gap-4 py-16 text-center md:py-20">
          <span className="grid size-16 place-items-center rounded-full bg-primary-foreground/10 text-accent">
            <CheckCircle2 className="size-8" />
          </span>
          <Reveal>
            <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Thank you for your order!
            </h1>
            <p className="mt-3 text-primary-foreground/80">
              {orderNumber
                ? `Your order ${orderNumber} has been received.`
                : "Your order has been received."}
              {email && ` A confirmation has been sent to ${email}.`}
            </p>
          </Reveal>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <Button asChild variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
              <Link to="/track-order">Track this order</Link>
            </Button>
            <Button asChild className="shadow-gold">
              <Link to="/shop">Continue shopping</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container py-12">
        {loading ? (
          <Skeleton className="h-96 w-full rounded-lg" />
        ) : order ? (
          <Reveal>
            <OrderView {...order} />
          </Reveal>
        ) : (
          <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border bg-secondary/40 py-16 text-center">
            <PackageSearch className="size-10 text-muted-foreground" />
            <div>
              <p className="font-display text-lg font-semibold text-foreground">
                {orderNumber
                  ? "We're confirming your order"
                  : "Order details unavailable"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Use your order number and email to track it anytime.
              </p>
            </div>
            <Button asChild>
              <Link to="/track-order">Track your order</Link>
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
