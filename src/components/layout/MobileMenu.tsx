"use client";
import { Link } from "@/components/Link";
import { NavLink } from "@/components/NavLink";
import { motion } from "framer-motion";
import { ShoppingBag, User as UserIcon, PackageSearch, ShieldCheck, LogOut, Sparkles } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { InitialsAvatar } from "@/components/InitialsAvatar";
import { useAuth, useAdmin } from "@/context/AuthContext";
import { NAV_LINKS } from "@/config/site";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileMenu({ open, onOpenChange }: MobileMenuProps) {
  const { user, profile, signOut } = useAuth();
  const { isAdmin, role } = useAdmin();

  const displayName = profile?.full_name || user?.email || "Account";

  const accountLinks = [
    { label: "Track order", to: "/track-order", icon: PackageSearch },
    { label: "Cart", to: "/checkout", icon: ShoppingBag },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[300px] border-border bg-background p-0 flex flex-col justify-between">
        <div>
          <SheetHeader className="border-b border-border bg-primary px-5 py-4">
            <SheetTitle className="text-primary-foreground">
              <Logo variant="light" />
            </SheetTitle>
          </SheetHeader>

          {user && (
            <div className="p-4 border-b border-border bg-secondary/30">
              <div className="flex items-center gap-3">
                <InitialsAvatar name={displayName} className="size-10 text-sm bg-primary text-primary-foreground font-bold" />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground text-sm">{displayName}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              {isAdmin && (
                <div className="mt-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                  <ShieldCheck className="size-3.5 text-primary" />
                  {role} Access Active
                </div>
              )}
            </div>
          )}

          <motion.nav
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
            className="flex flex-col gap-1 p-4"
          >
            {NAV_LINKS.map((l) => (
              <motion.div
                key={l.to}
                variants={{ hidden: { opacity: 0, x: -12 }, visible: { opacity: 1, x: 0 } }}
              >
                <NavLink
                  to={l.to}
                  className={({ isActive }) =>
                    cn(
                      "block rounded-lg px-4 py-3 font-display text-lg font-medium transition-colors",
                      isActive
                        ? "bg-secondary text-primary"
                        : "text-foreground hover:bg-secondary",
                    )
                  }
                >
                  {l.label}
                </NavLink>
              </motion.div>
            ))}
          </motion.nav>

          <div className="flex flex-col gap-1 border-t border-border p-4">
            {isAdmin && (
              <div className="mb-2 p-0.5 rounded-xl bg-gradient-to-r from-emerald-500 via-primary to-amber-500 shadow-md">
                <Button
                  asChild
                  className="w-full justify-between font-semibold text-white bg-gradient-to-r from-emerald-950 to-primary hover:from-emerald-900 hover:to-primary border-0 rounded-[10px] h-auto py-2.5 px-3"
                >
                  <Link to="/admin">
                    <div className="flex items-center gap-2.5">
                      <span className="grid size-7 place-items-center rounded-lg bg-amber-400/20 text-amber-300 ring-1 ring-amber-400/40 shrink-0">
                        <ShieldCheck className="size-4" />
                      </span>
                      <div className="text-left min-w-0">
                        <p className="text-xs font-bold text-white leading-tight flex items-center gap-1">
                          Admin Console <Sparkles className="size-3 text-amber-300 animate-pulse shrink-0" />
                        </p>
                        <p className="text-[10px] text-emerald-200/80 font-normal truncate">POS & Management</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-extrabold uppercase tracking-wider bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded shrink-0">
                      {role}
                    </span>
                  </Link>
                </Button>
              </div>
            )}
            <Button
              variant="ghost"
              asChild
              className="justify-start gap-3 font-normal"
            >
              <Link to="/account">
                <UserIcon className="size-5 text-accent" /> {user ? "My Account" : "Sign In / Register"}
              </Link>
            </Button>
            {accountLinks.map((l) => (
              <Button
                key={l.label}
                variant="ghost"
                asChild
                className="justify-start gap-3 font-normal"
              >
                <Link to={l.to}>
                  <l.icon className="size-5 text-accent" /> {l.label}
                </Link>
              </Button>
            ))}
            {user && (
              <Button
                variant="ghost"
                onClick={() => {
                  void signOut();
                  onOpenChange(false);
                }}
                className="justify-start gap-3 font-normal text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="size-5" /> Sign Out
              </Button>
            )}
          </div>
        </div>

        <SheetClose asChild>
          <div className="p-4 border-t border-border">
            <Button asChild className="w-full">
              <Link to="/shop">Shop all products</Link>
            </Button>
          </div>
        </SheetClose>
      </SheetContent>
    </Sheet>
  );
}
