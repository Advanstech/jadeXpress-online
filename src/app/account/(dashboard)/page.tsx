"use client";
import { Link } from "@/components/Link";
import {
  ArrowRight,
  Heart,
  MapPin,
  Package,
  ShoppingBag,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { useAuth, useAdmin } from "@/context/AuthContext";
import { useOrders } from "@/hooks/useOrders";
import { useWishlist } from "@/hooks/useWishlist";
import { useAddresses } from "@/hooks/useAddresses";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Reveal } from "@/components/motion/Reveal";
import { formatGHS, formatDate } from "@/lib/format";

const stats = [
  { key: "orders", label: "Orders", icon: Package, to: "/account/orders" },
  { key: "wishlist", label: "Wishlist", icon: Heart, to: "/account/wishlist" },
  { key: "addresses", label: "Addresses", icon: MapPin, to: "/account/addresses" },
];

export default function AccountOverview() {
  const { profile } = useAuth();
  const { isAdmin, role } = useAdmin();
  const { data: orders, isLoading } = useOrders();
  const { products: wishlist } = useWishlist();
  const { data: addresses } = useAddresses();

  const name = profile?.full_name || "there";
  const recent = (orders ?? []).slice(0, 3);
  const counts = {
    orders: orders?.length ?? 0,
    wishlist: wishlist.length,
    addresses: addresses?.length ?? 0,
  };

  return (
    <div className="space-y-8">
      <Reveal>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="eyebrow">Account</span>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">
              Welcome back, {name.split(" ")[0]}
            </h1>
            <p className="mt-1 text-muted-foreground">
              Here's a snapshot of your JadeXpress account.
            </p>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/15 text-primary border border-primary/30 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                Super Admin ({role})
              </Badge>
              <Button asChild size="sm" className="shadow-gold">
                <Link to="/admin">
                  <ShieldCheck className="mr-1.5 size-4" />
                  Admin Dashboard
                </Link>
              </Button>
            </div>
          )}
        </div>
      </Reveal>

      {isAdmin && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground shadow-md">
              <ShieldCheck className="size-6" />
            </span>
            <div>
              <p className="font-display font-semibold text-foreground">
                Enterprise & POS Management Portal
              </p>
              <p className="text-xs text-muted-foreground">
                Full administrative access to Inventory, Suppliers, Accounting, Sales & Point of Sale.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/admin">Storefront Admin</Link>
            </Button>
            <Button asChild size="sm" className="shadow-gold">
              <a href="https://jade-xpress-pos.vercel.app" target="_blank" rel="noreferrer">
                POS Portal <ExternalLink className="ml-1 size-3.5" />
              </a>
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Link
            key={s.key}
            to={s.to}
            className="group flex items-center gap-4 rounded-lg border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elegant"
          >
            <span className="grid size-11 place-items-center rounded-xl bg-secondary text-primary">
              <s.icon className="size-5" />
            </span>
            <div>
              <p className="font-display text-2xl font-semibold text-foreground">
                {counts[s.key as keyof typeof counts]}
              </p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
            <ArrowRight className="ml-auto size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </Link>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-foreground">
            Recent orders
          </h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/account/orders">View all</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="mt-4 space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="mt-4 flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-secondary/30 py-12 text-center">
            <ShoppingBag className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              You haven't placed an order yet.
            </p>
            <Button asChild className="shadow-gold">
              <Link to="/shop">Start shopping</Link>
            </Button>
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {recent.map((o) => (
              <li key={o.id}>
                <Link
                  to={`/account/orders/${o.orderNumber}`}
                  className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40"
                >
                  <div className="flex -space-x-3">
                    {o.items.slice(0, 3).map((it, i) => (
                      <img
                        key={i}
                        src={it.image ?? ""}
                        alt={it.name}
                        crossOrigin="anonymous"
                        className="size-10 rounded-full border-2 border-background object-cover"
                      />
                    ))}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {o.orderNumber}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(o.createdAt)} · {o.items.length} item(s)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      {formatGHS(o.total)}
                    </p>
                    <Badge variant="outline" className="mt-1 capitalize">
                      {o.status}
                    </Badge>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
