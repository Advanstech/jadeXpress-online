"use client";

import { type ReactNode } from "react";
import { Link } from "@/components/Link";
import { ArrowLeft, Leaf } from "lucide-react";
import { Logo } from "@/components/layout/Logo";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="flex min-h-screen flex-col lg:grid lg:grid-cols-2">
      {/* Mobile top bar — no full site nav on auth pages */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4 lg:hidden">
        <Logo />
        <Link
          to="/"
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4" />
          Back to shop
        </Link>
      </div>

      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex">
        <Logo variant="light" />
        <div>
          <h2 className="font-display text-3xl font-semibold leading-tight">
            Wellness, delivered with care.
          </h2>
          <p className="mt-4 max-w-sm text-primary-foreground/80">
            Vitamins, supplements and clean beauty — curated for real life,
            delivered across Ghana and worldwide.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-primary-foreground/80">
            <li className="flex items-center gap-2">
              <Leaf className="size-4 text-accent" /> Authentic, sealed products
            </li>
            <li className="flex items-center gap-2">
              <Leaf className="size-4 text-accent" /> Track every order, end to end
            </li>
            <li className="flex items-center gap-2">
              <Leaf className="size-4 text-accent" /> Saved addresses & wishlist
            </li>
          </ul>
        </div>
        <p className="text-xs text-primary-foreground/60">
          © {new Date().getFullYear()} JadeXpress Enterprise
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-6">{children}</div>
          {footer && (
            <div className="mt-6 text-center text-sm text-muted-foreground">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
