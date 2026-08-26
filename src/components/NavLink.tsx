"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type To = string | { pathname: string; search?: string; hash?: string };

export function NavLink({
  to,
  end = false,
  className,
  children,
}: {
  to: To;
  end?: boolean;
  className?: string | (({ isActive }: { isActive: boolean }) => string);
  children: ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const target = typeof to === "string" ? to : to.pathname;
  const isActive = end ? pathname === target : pathname.startsWith(target);
  const computed = typeof className === "function" ? className({ isActive }) : className;

  return (
    <NextLink href={to as never} className={computed}>
      {children}
    </NextLink>
  );
}
