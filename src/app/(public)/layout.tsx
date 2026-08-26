"use client";

import { useEffect, type ReactNode } from "react";
import { useLocation } from "@/hooks/useLocation";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { AIConcierge } from "@/components/ai/AIConcierge";

export const dynamic = "force-dynamic";

export default function PublicLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className={isHome ? "" : "pt-16 md:pt-20"}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >{children}
        </motion.div>
      </main>
      <Footer />
      <CartDrawer />
      <AIConcierge />
    </div>
  );
}
