"use client";
import { Suspense, type ReactNode } from "react";


/**
 * Bare layout for auth pages (login, register, forgot password) — no site
 * header/footer/cart. `AuthShell` renders its own minimal mobile top bar.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={null}>
        {children}
      </Suspense>
    </div>
  );
}
