"use client";
import { type ReactNode } from "react";
import { NavLink } from "@/components/NavLink";
import { Navigate } from "@/components/Navigate";
import { useLocation } from "@/hooks/useLocation";
import { motion } from "framer-motion";
import {
  Heart,
  LayoutGrid,
  LogOut,
  MapPin,
  Package,
  ShieldCheck,
  User,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { AIConcierge } from "@/components/ai/AIConcierge";
import { Button } from "@/components/ui/button";
import { InitialsAvatar } from "@/components/InitialsAvatar";
import { useAdmin, useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const navItems = [
  { to: "/account", label: "Overview", icon: LayoutGrid, end: true },
  { to: "/account/orders", label: "Orders", icon: Package, end: false },
  { to: "/account/addresses", label: "Addresses", icon: MapPin, end: false },
  { to: "/account/wishlist", label: "Wishlist", icon: Heart, end: false },
  { to: "/account/profile", label: "Profile", icon: User, end: false },
];

export default function AccountLayout({ children }: { children: ReactNode }) {
  const { user, profile, loading, signOut } = useAuth();
  const { isAdmin, role } = useAdmin();
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

  const name = profile?.full_name || user.email || "Account";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 pt-16 md:pt-20">
        <div className="container grid gap-8 py-10 lg:grid-cols-[260px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-lg border border-border bg-card p-5 shadow-soft">
              <div className="flex items-center gap-3">
                <InitialsAvatar name={name} className="size-12 text-base" />
                <div className="min-w-0">
                  <p className="truncate font-display text-base font-semibold text-foreground">
                    {name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            <nav className="mt-4 flex flex-col gap-1">
              {navItems.map((item) => (
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
              {isAdmin && (
                <div className="mt-3 mb-1 p-0.5 rounded-xl bg-gradient-to-r from-emerald-500 via-primary to-amber-500 shadow-md">
                  <NavLink
                    to="/admin"
                    className="flex items-center justify-between rounded-[10px] bg-gradient-to-r from-emerald-950 to-primary px-3 py-2.5 text-sm font-semibold text-white transition-all hover:from-emerald-900 hover:to-primary"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="grid size-6 place-items-center rounded-md bg-amber-400/20 text-amber-300 ring-1 ring-amber-400/40 shrink-0">
                        <ShieldCheck className="size-3.5" />
                      </span>
                      <span>Admin Console</span>
                    </div>
                    <span className="rounded bg-amber-400 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-slate-950 shrink-0">
                      {role}
                    </span>
                  </NavLink>
                </div>
              )}
              <Button
                variant="ghost"
                className="mt-2 justify-start gap-3 font-normal text-muted-foreground hover:text-destructive"
                onClick={() => void signOut()}
              >
                <LogOut className="size-4" />
                Sign out
              </Button>
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
