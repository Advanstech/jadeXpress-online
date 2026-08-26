"use client";

import { useEffect, useState, type ReactNode } from "react";
import "@/i18n/config";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { SmoothScroll } from "@/components/SmoothScroll";
import { bootstrapGeneratedSiteAnalytics } from "@/analytics";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 1000 * 60,
          },
        },
      }),
  );

  useEffect(() => {
    bootstrapGeneratedSiteAnalytics();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <SmoothScroll>
            <TooltipProvider>
              <Toaster />
              <Sonner richColors position="top-center" />
              {children}
            </TooltipProvider>
          </SmoothScroll>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
