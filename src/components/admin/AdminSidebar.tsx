"use client";

import { useState } from "react";
import { NavLink } from "@/components/NavLink";
import { useAdminStats } from "@/hooks/useAdmin";
import { useAdmin } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LayoutGrid,
  TrendingUp,
  PackageSearch,
  Wallet,
  MessageSquare,
  Sparkles,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building2,
  Users
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const adminNav = [
  { to: "/admin/overview", label: "Overview", icon: LayoutGrid, end: true },
  { to: "/admin/sales", label: "Sales & Analytics", icon: TrendingUp, end: false },
  { to: "/admin/inventory", label: "Inventory Mgmt", icon: PackageSearch, end: false },
  { to: "/admin/accounting", label: "Accounting", icon: Wallet, end: false },
  { to: "/admin/customers", label: "Customers", icon: Users, end: false },
  { to: "/admin/messages", label: "Support Inbox", icon: MessageSquare, end: false, badge: "unread" },
  { to: "/admin/crm", label: "AI CRM", icon: Sparkles, end: false },
];

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { data: stats } = useAdminStats();
  const { role } = useAdmin();

  const toggleCollapse = () => setCollapsed((prev) => !prev);

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 280 }}
        className="sticky top-0 h-screen flex flex-col bg-card border-r border-border shadow-soft z-40 transition-all duration-300 ease-in-out"
      >
        {/* Header Section */}
        <div className="flex h-20 shrink-0 items-center justify-between px-4 border-b border-border/50">
          <AnimatePresence mode="popLayout">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-3 overflow-hidden"
              >
                <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-gold">
                  <Building2 className="size-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-display font-bold text-foreground text-lg leading-tight truncate">JadeXpress</span>
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Enterprise Admin</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle Button */}
          <button
            onClick={toggleCollapse}
            className={cn(
              "grid size-8 place-items-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors",
              collapsed && "mx-auto"
            )}
          >
            {collapsed ? <ChevronRight className="size-5" /> : <ChevronLeft className="size-5" />}
          </button>
        </div>

        {/* User Info Section (when expanded) */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 py-6 border-b border-border/50"
            >
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border/30">
                <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
                  <ShieldCheck className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-sm font-semibold text-foreground">
                    Admin Console
                  </p>
                  <p className="truncate text-xs capitalize text-muted-foreground">
                    Role: {role}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
          <nav className="flex flex-col gap-1.5">
            {adminNav.map((item) => {
              const badgeCount = item.badge === "unread" ? (stats?.unread ?? 0) : 0;
              
              const NavContent = (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      "group relative flex items-center rounded-xl transition-all duration-200",
                      collapsed ? "justify-center p-3" : "px-4 py-3 justify-between",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-gold"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )
                  }
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={cn("size-5 shrink-0 transition-transform group-hover:scale-110")} />
                    {!collapsed && (
                      <span className="font-medium text-sm truncate">{item.label}</span>
                    )}
                  </div>
                  
                  {/* Badge */}
                  {badgeCount > 0 && (
                    <span
                      className={cn(
                        "grid place-items-center font-bold text-white shadow-sm animate-pulse",
                        collapsed 
                          ? "absolute top-1.5 right-1.5 size-4 rounded-full bg-emerald-500 text-[10px]"
                          : "h-5 min-w-[20px] px-1.5 rounded-full bg-emerald-500 text-xs"
                      )}
                    >
                      {collapsed ? "" : badgeCount}
                    </span>
                  )}
                </NavLink>
              );

              return collapsed ? (
                <Tooltip key={item.to}>
                  <TooltipTrigger asChild>
                    {NavContent}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {item.label}
                    {badgeCount > 0 && <span className="ml-2 text-emerald-400">({badgeCount})</span>}
                  </TooltipContent>
                </Tooltip>
              ) : (
                NavContent
              );
            })}
          </nav>
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-border/50">
           <NavLink
              to="/account"
              className={cn(
                "group flex items-center rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors",
                collapsed ? "justify-center p-3" : "px-4 py-3 gap-3"
              )}
            >
              <LogOut className="size-5 shrink-0" />
              {!collapsed && <span className="font-medium text-sm">Exit Admin</span>}
            </NavLink>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
