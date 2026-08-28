"use client";
import { type ReactNode } from "react";
import { Navigate } from "@/components/Navigate";
import { useLocation } from "@/hooks/useLocation";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/context/AuthContext";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading } = useAdmin();
  const location = useLocation();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/account/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  if (!isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4">
        <div className="mx-auto max-w-md text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-secondary text-primary">
            <Lock className="size-6" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-semibold text-foreground">
            Admin access required
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account doesn't have an owner, admin or manager role on this
            store. Contact the enterprise owner to request access.
          </p>
          <Button asChild className="mt-6 shadow-gold">
            <a href="/">Back to store</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Standalone Sidebar */}
      <AdminSidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto custom-scrollbar relative">
        {/* Subtle background glow effect */}
        <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none -z-10" />
        
        <div className="container py-8 max-w-[1600px] min-h-full">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="min-h-full flex flex-col"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
