"use client";
import { useEffect, useState } from "react";
import { Link } from "@/components/Link";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "@/hooks/useLocation";
import {
  Menu,
  PackageSearch,
  ShoppingBag,
  User as UserIcon,
  ShieldCheck,
  Package,
  Heart,
  LayoutGrid,
  LogOut,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InitialsAvatar } from "@/components/InitialsAvatar";
import { useAuth, useAdmin } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { NAV_LINKS } from "@/config/site";
import { cn } from "@/lib/utils";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const { isAdmin, role } = useAdmin();
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

  const displayName = profile?.full_name || user?.email || "Account";
  const firstName = displayName.split(" ")[0];

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

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button variant="ghost" size="icon" asChild className={iconBtn}>
              <Link to="/track-order" aria-label="Track order">
                <PackageSearch className="size-5" />
              </Link>
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "hidden sm:flex items-center gap-2 rounded-full py-1 pl-1.5 pr-2.5 transition-all outline-none",
                      "bg-primary-foreground/15 hover:bg-primary-foreground/25 text-primary-foreground border border-primary-foreground/20 shadow-sm",
                    )}
                    aria-label="User account menu"
                  >
                    <InitialsAvatar
                      name={displayName}
                      className="size-7 text-xs bg-amber-400 text-amber-950 font-bold ring-1 ring-white/30"
                    />
                    <span className="text-xs font-medium max-w-[110px] truncate">
                      {firstName}
                    </span>
                    {isAdmin && (
                      <span className="rounded bg-accent text-accent-foreground px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                        {role === "owner" ? "Admin" : role}
                      </span>
                    )}
                    <ChevronDown className="size-3.5 opacity-70" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-60 mt-2 rounded-2xl p-2 shadow-2xl border border-border bg-card/98 backdrop-blur"
                >
                  <div className="px-3 py-2.5 bg-secondary/60 rounded-xl mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <InitialsAvatar
                        name={displayName}
                        className="size-9 text-xs bg-primary text-primary-foreground font-bold shadow-soft"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {displayName}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                        <ShieldCheck className="size-3.5 text-primary" />
                        {role} privilege active
                      </div>
                    )}
                  </div>

                  {isAdmin && (
                    <>
                      <div className="mb-2 p-0.5 rounded-xl bg-gradient-to-r from-emerald-500 via-primary to-amber-500 shadow-md">
                        <DropdownMenuItem
                          asChild
                          className="cursor-pointer font-semibold text-white bg-gradient-to-r from-emerald-950/90 to-primary/95 hover:from-emerald-900 hover:to-primary focus:from-emerald-900 focus:to-primary rounded-[10px] py-2.5 px-3 border-0 transition-all"
                        >
                          <Link to="/admin" className="flex items-center justify-between w-full">
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
                        </DropdownMenuItem>
                      </div>
                      <DropdownMenuSeparator className="my-1.5" />
                    </>
                  )}

                  <DropdownMenuItem asChild className="cursor-pointer rounded-lg py-2">
                    <Link to="/account" className="flex items-center gap-2.5 w-full">
                      <LayoutGrid className="size-4 text-muted-foreground shrink-0" />
                      Account Overview
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer rounded-lg py-2">
                    <Link to="/account/orders" className="flex items-center gap-2.5 w-full">
                      <Package className="size-4 text-muted-foreground shrink-0" />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer rounded-lg py-2">
                    <Link to="/account/wishlist" className="flex items-center gap-2.5 w-full">
                      <Heart className="size-4 text-muted-foreground shrink-0" />
                      Wishlist
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer rounded-lg py-2">
                    <Link to="/account/profile" className="flex items-center gap-2.5 w-full">
                      <UserIcon className="size-4 text-muted-foreground shrink-0" />
                      Profile & Settings
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="my-1.5" />

                  <DropdownMenuItem
                    onClick={() => void signOut()}
                    className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 rounded-lg py-2 flex items-center gap-2.5"
                  >
                    <LogOut className="size-4 shrink-0" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                asChild
                className={cn(iconBtn, "hidden sm:flex")}
              >
                <Link to="/account/login" aria-label="Sign in to your account">
                  <UserIcon className="size-5" />
                </Link>
              </Button>
            )}

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
