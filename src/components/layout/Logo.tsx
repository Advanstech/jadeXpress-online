"use client";
import { Link } from "@/components/Link";
import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import { SITE } from "@/config/site";

interface LogoProps {
  variant?: "dark" | "light";
  className?: string;
}

export function Logo({ variant = "dark", className }: LogoProps) {
  const light = variant === "light";
  return (
    <Link to="/" className={cn("group flex items-center gap-2.5", className)}>
      <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-elegant transition-transform group-hover:scale-105">
        <Leaf className="size-5" />
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-lg font-semibold tracking-tight",
            light ? "text-primary-foreground" : "text-primary",
          )}
        >
          {SITE.name}
        </span>
        <span
          className={cn(
            "mt-0.5 text-[10px] font-medium uppercase tracking-[0.16em]",
            light ? "text-primary-foreground/70" : "text-muted-foreground",
          )}
        >
          {SITE.tagline}
        </span>
      </span>
    </Link>
  );
}
