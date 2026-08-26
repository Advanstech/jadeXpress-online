"use client";
import { useEffect, useState } from "react";
import { Link } from "@/components/Link";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "@/hooks/useLocation";
import { Menu, PackageSearch, ShoppingBag, User } from "lucide-react";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { NAV_LINKS } from "@/config/site";
import { cn } from "@/lib/utils";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { itemCount, openCart } = useCart();
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setScrolled(false);
    setMenuOpen(false);
  }, [location.pathname]);

  const transparent = isHome && !scrolled;

  const iconBtn =
    "relative text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground";

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          transparent
            ? "border-b border-transparent bg-transparent"
            : "border-b border-primary-foreground/10 bg-primary/95 shadow-elegant backdrop-blur supports-[backdrop-filter]:bg-primary/85",
        )}
      >
        <div className="container flex h-16 items-center justify-between gap-4 md:h-20">
          <Logo variant="light" />

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  cn(
                    "rounded-full px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "text-primary-foreground"
                      : "text-primary-foreground/75 hover:text-primary-foreground",
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" asChild className={iconBtn}>
              <Link to="/track-order" aria-label="Track order">
                <PackageSearch className="size-5" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              asChild
              className={cn(iconBtn, "hidden sm:flex")}
            >
              <Link to="/account" aria-label="Account">
                <User className="size-5" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={iconBtn}
              onClick={openCart}
              aria-label="Open cart"
            >
              <div className="relative">
                <ShoppingBag className="size-5" />
                {itemCount > 0 && (
                  <span className="absolute -right-2 -top-2 grid min-h-[18px] min-w-[18px] place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </div>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(iconBtn, "lg:hidden")}
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </Button>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onOpenChange={setMenuOpen} />
    </>
  );
}
