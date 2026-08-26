"use client";
import { Link } from "@/components/Link";
import { NavLink } from "@/components/NavLink";
import { motion } from "framer-motion";
import { ShoppingBag, User, PackageSearch } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { NAV_LINKS } from "@/config/site";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileMenu({ open, onOpenChange }: MobileMenuProps) {
  const accountLinks = [
    { label: "Track order", to: "/track-order", icon: PackageSearch },
    { label: "Account", to: "/account", icon: User },
    { label: "Cart", to: "/checkout", icon: ShoppingBag },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[300px] border-border bg-background p-0">
        <SheetHeader className="border-b border-border bg-primary px-5 py-4">
          <SheetTitle className="text-primary-foreground">
            <Logo variant="light" />
          </SheetTitle>
        </SheetHeader>
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

        <div className="mt-2 flex flex-col gap-1 border-t border-border p-4">
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
        </div>

        <SheetClose asChild>
          <div className="p-4">
            <Button asChild className="w-full">
              <Link to="/shop">Shop all products</Link>
            </Button>
          </div>
        </SheetClose>
      </SheetContent>
    </Sheet>
  );
}
