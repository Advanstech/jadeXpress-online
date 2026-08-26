"use client";
import { type ReactNode } from "react";
import { NavLink } from "@/components/NavLink";
import { Navigate } from "@/components/Navigate";
import { useLocation } from "@/hooks/useLocation";
import { motion } from "framer-motion";
import {
  LayoutGrid,
  Lock,
  LogOut,
  MessageSquare,
  Package,
  ShieldCheck,
  Store,
  Users,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { AIConcierge } from "@/components/ai/AIConcierge";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const adminNav = [
  { to: "/admin", label: "Overview", icon: LayoutGrid, end: true },
  { to: "/admin/orders", label: "Orders", icon: Package, end: false },
  { to: "/admin/products", label: "Products", icon: Store, end: false },
  { to: "/admin/customers", label: "Customers", icon: Users, end: false },
  { to: "/admin/messages", label: "Messages", icon: MessageSquare, end: false },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, role, isAdmin, loading } = useAdmin();
  const location = useLocation();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/account/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  if (!isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4">
        <div className="mx-auto max-w-md text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-secondary text-primary">
            <Lock className="size-6" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-semibold text-foreground">
            Admin access required
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account doesn't have an owner, admin or manager role on this
            store. Contact the enterprise owner to request access.
          </p>
          <Button asChild className="mt-6 shadow-gold">
            <a href="/">Back to store</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 pt-16 md:pt-20">
        <div className="container grid gap-8 py-10 lg:grid-cols-[260px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-lg border border-border bg-card p-5 shadow-soft">
              <div className="flex items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
                  <ShieldCheck className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-display text-base font-semibold text-foreground">
                    Admin dashboard
                  </p>
                  <p className="truncate text-xs capitalize text-muted-foreground">
                    {role} role
                  </p>
                </div>
              </div>
            </div>

            <nav className="mt-4 flex flex-col gap-1">
              {adminNav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-soft"
                        : "text-foreground/80 hover:bg-secondary hover:text-primary",
                    )
                  }
                >
                  <item.icon className="size-4" />
                  {item.label}
                </NavLink>
              ))}
              <NavLink
                to="/account"
                className="mt-2 flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
              >
                <LogOut className="size-4" />
                Back to account
              </NavLink>
            </nav>
          </aside>

          <div className="min-w-0">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >{children}
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
      <CartDrawer />
      <AIConcierge />
    </div>
  );
}
