"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef, type ReactNode } from "react";

type To = string | { pathname: string; search?: string; hash?: string };

export const NavLink = forwardRef<
  HTMLAnchorElement,
  {
    to: To;
    end?: boolean;
    className?: string | (({ isActive }: { isActive: boolean }) => string);
    children: ReactNode;
  } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className">
>(({ to, end = false, className, children, ...props }, ref) => {
  const pathname = usePathname() ?? "";
  const target = typeof to === "string" ? to : to.pathname;
  const isActive = end ? pathname === target : pathname.startsWith(target);
  const computed = typeof className === "function" ? className({ isActive }) : className;

  return (
    <NextLink ref={ref} href={to as never} className={computed} {...props}>
      {children}
    </NextLink>
  );
});

NavLink.displayName = "NavLink";
