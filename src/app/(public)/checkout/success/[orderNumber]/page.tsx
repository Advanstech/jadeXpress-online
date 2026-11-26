"use client";
import { useEffect, useState } from "react";
import { Link } from "@/components/Link";
import { useParams } from "next/navigation";
import { AlertTriangle, CheckCircle2, Loader2, PackageSearch } from "lucide-react";
import { toast } from "sonner";
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
  const [confirming, setConfirming] = useState(false);
  const [unconfirmed, setUnconfirmed] = useState(false);
  const [retrying, setRetrying] = useState(false);

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
        let o = await trackOrder(parsed.orderNumber, mail);
        setOrder(o);
        if (!o?.id) return;

        // The gateway callback and the USSD confirmation are not instantaneous:
        // poll the server, which re-verifies with the bank, instead of trusting
        // the redirect (or giving up after one attempt).
        for (let attempt = 0; attempt < 20 && o?.paymentStatus !== "paid"; attempt++) {
          setConfirming(attempt > 0);
          const status = await api.get<{ paymentStatus: string; intentStatus: string | null }>(
            `storefront/orders/${o.id}/payment-status`,
          );
          if (status.paymentStatus === "paid") {
            o = await trackOrder(parsed.orderNumber, mail);
            setOrder(o);
            break;
          }
          // Terminal gateway states — stop waiting and let staff follow up.
          if (
            status.intentStatus &&
            ["failed", "expired", "cancelled"].includes(status.intentStatus)
          ) {
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }

        // Still open after the poll window: the payer may never have completed
        // the prompt on the bank page. Never imply this order was paid.
        if (o?.paymentStatus !== "paid") setUnconfirmed(true);
        else sessionStorage.removeItem("jadexpress_pending_payment");
      } catch {
        setOrder(null);
      } finally {
        setConfirming(false);
        setLoading(false);
      }
    };

    void confirm();
  }, [orderNumber]);

  // Re-open a fresh hosted page for the same order — no money was taken, so
  // this is a retry, not a second charge.
  const retryPayment = async () => {
    const raw = sessionStorage.getItem("jadexpress_last_order");
    const parsed = raw
      ? (JSON.parse(raw) as { orderNumber: string; email: string; orderId?: string })
      : null;
    if (!parsed?.orderId) return;
    const pendingRaw = sessionStorage.getItem("jadexpress_pending_payment");
    const pending = pendingRaw
      ? (JSON.parse(pendingRaw) as {
          channel?: "card" | "momo";
          phone?: string;
          network?: "MTN" | "Telecel" | "AT";
        })
      : null;
    setRetrying(true);
    try {
      const { paymentUrl } = await api.post<{ paymentUrl: string }>(
        `storefront/orders/${parsed.orderId}/pay-link`,
        {
          channel: pending?.channel ?? "card",
          phone: pending?.phone,
          network: pending?.network,
        },
      );
      if (!paymentUrl) throw new Error("no payment url");
      window.location.href = paymentUrl;
    } catch {
      setRetrying(false);
      toast.error("Could not reopen the payment page. Please contact us and we will help.");
    }
  };

  return (
    <div className="bg-background">
      <section className="bg-primary text-primary-foreground">
        <div className="container flex flex-col items-center gap-4 py-16 text-center md:py-20">
          <span className="grid size-16 place-items-center rounded-full bg-primary-foreground/10 text-accent">
            {unconfirmed && !loading ? (
              <AlertTriangle className="size-8" />
            ) : (
              <CheckCircle2 className="size-8" />
            )}
          </span>
          <Reveal>
            <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {unconfirmed && !loading
                ? "Order received — payment pending"
                : "Thank you for your order!"}
            </h1>
            <p className="mt-3 text-primary-foreground/80">
              {orderNumber
                ? `Your order ${orderNumber} has been received.`
                : "Your order has been received."}
              {/* Never claim a confirmation email exists while the payment is
                  still open — it is only sent once the bank captures. */}
              {email &&
                (order?.paymentStatus === "paid"
                  ? ` A confirmation has been sent to ${email}.`
                  : order
                    ? ` We'll email your confirmation to ${email} once the payment is confirmed.`
                    : null)}
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

      <section className="container space-y-6 py-12">
        {confirming && (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
            <Loader2 className="size-4 shrink-0 animate-spin text-accent" />
            Confirming your payment with the bank — this can take a moment.
          </div>
        )}

        {unconfirmed && !loading && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="space-y-1 text-sm">
                <p className="font-display font-semibold text-amber-800 dark:text-amber-300">
                  Payment not confirmed yet
                </p>
                <p className="text-amber-800/80 dark:text-amber-200/80">
                  Your order is saved, but the bank has not reported a completed payment.
                  If you approved the prompt, give it a minute and refresh this page. If you
                  did not complete it, no money was taken — you can reopen the payment page.
                </p>
              </div>
            </div>
            <Button
              onClick={() => void retryPayment()}
              disabled={retrying}
              size="sm"
              className="mt-4"
            >
              {retrying && <Loader2 className="mr-2 size-4 animate-spin" />}
              Reopen payment page
            </Button>
          </div>
        )}

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
