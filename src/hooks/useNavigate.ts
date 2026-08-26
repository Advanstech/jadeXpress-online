"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

type NavigateOptions = { replace?: boolean; state?: { from?: string } };

export function useNavigate() {
  const router = useRouter();
  return useCallback(
    (to: string | number, options?: NavigateOptions) => {
      if (typeof to === "number") {
        if (to === -1) router.back();
        else if (to === 1) router.forward();
        return;
      }
      const from = options?.state?.from;
      const url = from ? `${to}?from=${encodeURIComponent(from)}` : to;
      if (options?.replace) router.replace(url);
      else router.push(url);
    },
    [router],
  );
}
