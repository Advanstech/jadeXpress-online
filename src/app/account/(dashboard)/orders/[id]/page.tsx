"use client";
import { Link } from "@/components/Link";
import { useParams } from "next/navigation";
import { ArrowLeft, PackageOpen, Loader2, RefreshCcw } from "lucide-react";
import { useOrder } from "@/hooks/useOrders";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderView } from "@/components/order/OrderView";
import { api } from "@/lib/api";
import { useState } from "react";
import { toast } from "sonner";

export default function OrderDetail() {
  const { id } = useParams() as { id: string };
  const { data: order, isLoading } = useOrder(id);
  const [retrying, setRetrying] = useState(false);

  const retryPayment = async () => {
    if (!order?.id) return;
    setRetrying(true);
    try {
      const result = await api.post<{ paymentUrl: string; orderReference: string }>(
        `storefront/orders/${order.id}/pay-link`,
      );
      if (result.paymentUrl) {
        window.location.href = result.paymentUrl;
      } else {
        toast.error("Could not create a payment link.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to retry payment.");
    } finally {
      setRetrying(false);
    }
  };

  const canRetry = order
    ? order.paymentStatus !== "paid" &&
      (order.paymentGateway === "ngenius" || order.paymentGateway === "stanbic")
    : false;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm" className="px-2">
          <Link to="/account/orders">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <span className="eyebrow">Order</span>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            {id}
          </h1>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-96 w-full rounded-lg" />
      ) : order ? (
        <>
          {canRetry && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 mb-4">
              <div className="flex items-start gap-3">
                <RefreshCcw className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-400">
                    Payment not yet completed
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    Pay for this order to confirm it.
                  </p>
                </div>
              </div>
              <Button
                className="mt-3 w-full"
                onClick={retryPayment}
                disabled={retrying}
              >
                {retrying ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Retrying…
                  </>
                ) : (
                  <>
                    <RefreshCcw className="mr-2 size-4" />
                    Retry Payment
                  </>
                )}
              </Button>
            </div>
          )}
          <OrderView {...order} />
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-secondary/30 py-16 text-center">
          <PackageOpen className="size-10 text-muted-foreground" />
          <div>
            <p className="font-display text-lg font-semibold text-foreground">
              Order not found
            </p>
            <p className="mt-1 text-sm text-sm text-muted-foreground">
              We couldn't find this order in your account.
            </p>
          </div>
          <Button asChild>
            <Link to="/account/orders">Back to orders</Link>
          </Button>
        </div>
      )}
    </div>
  );
}