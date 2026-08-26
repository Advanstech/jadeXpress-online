"use client";
import { Link } from "@/components/Link";
import { useParams } from "next/navigation";
import { ArrowLeft, PackageOpen } from "lucide-react";
import { useOrder } from "@/hooks/useOrders";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderView } from "@/components/order/OrderView";

export default function OrderDetail() {
  const { id } = useParams() as { id: string };
  const { data: order, isLoading } = useOrder(id);

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
        <OrderView {...order} />
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-secondary/30 py-16 text-center">
          <PackageOpen className="size-10 text-muted-foreground" />
          <div>
            <p className="font-display text-lg font-semibold text-foreground">
              Order not found
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
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
