"use client";

import { usePathname } from "next/navigation";

export function useLocation() {
  const pathname = usePathname() ?? "";

  return {
    pathname,
    search: "",
    hash: "",
    state: null,
  } as { pathname: string; search: string; hash: string; state: { from?: string } | null };
}
