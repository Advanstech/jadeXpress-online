import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatGHS, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  TrackedOrderItem,
  TrackedTimelineEvent,
} from "@/lib/orders";

interface OrderViewProps {
  orderNumber: string;
  email?: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  currency: string;
  createdAt: string;
  items: TrackedOrderItem[];
  timeline: TrackedTimelineEvent[];
  shippingAddress: {
    recipientName: string;
    phone: string;
    email?: string;
    country: string;
    region: string;
    city: string;
    street: string;
    digitalAddress?: string | null;
    courier?: {
      provider?: string;
      service?: string;
      eta?: string;
      trackingNumber?: string;
    } | null;
  };
}

const statusStyles: Record<string, string> = {
  pending: "bg-accent text-accent-foreground",
  processing: "bg-primary text-primary-foreground",
  shipped: "bg-primary/80 text-primary-foreground",
  delivered: "bg-primary text-primary-foreground",
  cancelled: "bg-destructive text-destructive-foreground",
};

export function OrderView(order: OrderViewProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-secondary/40 p-5">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Order
          </p>
          <p className="font-display text-lg font-semibold text-foreground">
            {order.orderNumber}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={cn(statusStyles[order.status] ?? "bg-muted text-muted-foreground")}>
            {order.status}
          </Badge>
          <Badge variant="outline" className="capitalize">
            {order.paymentStatus}
          </Badge>
        </div>
      </div>

      <div className="grid gap-8 p-5 md:grid-cols-2">
        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-foreground">
            Items
          </h3>
          <ul className="mt-3 space-y-3">
            {order.items.map((item, i) => (
              <li key={i} className="flex gap-3">
                <div className="size-14 shrink-0 overflow-hidden rounded-md border border-border bg-secondary">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      crossOrigin="anonymous"
                      className="size-full object-cover"
                    />
                  )}
                </div>
                <div className="flex flex-1 justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {formatGHS(item.price * item.quantity)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <Separator className="my-4" />
          <div className="space-y-1.5 text-sm">
            <Row label="Subtotal" value={formatGHS(order.subtotal)} />
            <Row
              label="Delivery"
              value={order.shippingFee === 0 ? "Free" : formatGHS(order.shippingFee)}
            />
            <Row label="Total" value={formatGHS(order.total)} strong />
          </div>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-foreground">
            Delivery to
          </h3>
          <div className="mt-3 rounded-lg border border-border bg-secondary/30 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">
              {order.shippingAddress.recipientName}
            </p>
            <p>{order.shippingAddress.phone}</p>
            <p className="mt-1">
              {order.shippingAddress.street}, {order.shippingAddress.city}
            </p>
            <p>
              {order.shippingAddress.region}, {order.shippingAddress.country}
            </p>
            {order.shippingAddress.digitalAddress && (
              <p>GhanaPost GPS: {order.shippingAddress.digitalAddress}</p>
            )}
          </div>
          {order.shippingAddress.courier?.provider && (
            <div className="mt-3 rounded-lg border border-border bg-card p-4 text-sm">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Courier
              </p>
              <p className="mt-1 font-medium text-foreground">
                {order.shippingAddress.courier.provider}
                {order.shippingAddress.courier.service &&
                  ` · ${order.shippingAddress.courier.service}`}
              </p>
              <p className="text-sm text-muted-foreground">
                {order.shippingAddress.courier.eta}
              </p>
              {order.shippingAddress.courier.trackingNumber && (
                <p className="mt-1 text-xs font-medium text-primary">
                  Tracking {order.shippingAddress.courier.trackingNumber}
                </p>
              )}
            </div>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            Placed {formatDateTime(order.createdAt)}
          </p>
        </div>
      </div>

      <div className="border-t border-border p-5">
        <h3 className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-foreground">
          Status timeline
        </h3>
        <ol className="mt-4 space-y-4">
          {order.timeline.map((event, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                <Check className="size-3.5" />
              </span>
              <div>
                <p className="text-sm font-medium capitalize text-foreground">
                  {event.status}
                </p>
                {event.note && (
                  <p className="text-sm text-muted-foreground">{event.note}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(event.createdAt)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={strong ? "font-medium text-foreground" : "text-muted-foreground"}>
        {label}
      </span>
      <span className={strong ? "font-display text-base font-semibold text-foreground" : "font-medium text-foreground"}>
        {value}
      </span>
    </div>
  );
}
