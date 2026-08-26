"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function Navigate({
  to,
  replace,
  state,
}: {
  to: string;
  replace?: boolean;
  state?: { from?: string } | null;
}) {
  const router = useRouter();
  useEffect(() => {
    const from = state?.from;
    const url = from ? `${to}?from=${encodeURIComponent(from)}` : to;
    if (replace) router.replace(url);
    else router.push(url);
  }, [router, to, replace, state]);
  return null;
}
