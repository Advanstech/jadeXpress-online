"use client";

import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Users, Package, Wallet, Clock, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminStats, useAdminOrders } from "@/hooks/useAdmin";
import { formatGHS } from "@/lib/format";

// Mock Data for charts until history API exists
const revenueData = [
  { name: "Mon", total: 1200 },
  { name: "Tue", total: 1500 },
  { name: "Wed", total: 1800 },
  { name: "Thu", total: 1400 },
  { name: "Fri", total: 2200 },
  { name: "Sat", total: 2800 },
  { name: "Sun", total: 3200 },
];

const trafficData = [
  { name: "Mon", visitors: 400, returning: 120 },
  { name: "Tue", visitors: 300, returning: 90 },
  { name: "Wed", visitors: 550, returning: 210 },
  { name: "Thu", visitors: 450, returning: 180 },
  { name: "Fri", visitors: 700, returning: 320 },
  { name: "Sat", visitors: 900, returning: 410 },
  { name: "Sun", visitors: 850, returning: 380 },
];

export default function AdminOverviewPage() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: orders, isLoading: ordersLoading } = useAdminOrders();

  const recentOrders = orders?.slice(0, 5) ?? [];

  return (
    <div className="space-y-8 relative">
      {/* Sticky Header with Backdrop Blur */}
      <div className="sticky top-0 z-20 -mx-4 px-4 py-4 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground mt-1">
          Welcome to the JadeXpress Enterprise command center.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 pt-4">
        {[
          { 
            title: "Total Revenue", 
            value: statsLoading ? "..." : formatGHS(stats?.revenue ?? 0), 
            icon: Wallet, 
            trend: "+12.5%", 
            color: "text-emerald-500", 
            bg: "bg-emerald-500/10" 
          },
          { 
            title: "Total Orders", 
            value: statsLoading ? "..." : stats?.orders ?? 0, 
            icon: Package, 
            trend: "+18.1%", 
            color: "text-blue-500", 
            bg: "bg-blue-500/10" 
          },
          { 
            title: "Total Customers", 
            value: statsLoading ? "..." : stats?.customers ?? 0, 
            icon: Users, 
            trend: "+5.2%", 
            color: "text-amber-500", 
            bg: "bg-amber-500/10" 
          },
          { 
            title: "Pending Orders", 
            value: statsLoading ? "..." : stats?.pending ?? 0, 
            icon: Clock, 
            trend: "-2.1%", 
            color: "text-rose-500", 
            bg: "bg-rose-500/10" 
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5, type: "spring", stiffness: 100 }}
          >
            <Card className="bg-card/40 backdrop-blur border-border/40 shadow-soft hover:shadow-lg hover:border-primary/30 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`size-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-display text-foreground">{stat.value}</div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="flex items-center text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    <TrendingUp className="size-3 mr-1" />
                    {stat.trend}
                  </span>
                  <span className="text-xs text-muted-foreground">vs last week</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Spline Area Chart */}
        <Card className="lg:col-span-4 bg-card/40 backdrop-blur border-border/40 shadow-soft relative overflow-hidden group">
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700" />
          
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <TrendingUp className="size-5 text-primary" />
              Traffic Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-0 pb-6">
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorReturning" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.05} />
                  <XAxis dataKey="name" stroke="currentColor" strokeOpacity={0.4} fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="currentColor" strokeOpacity={0.4} fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }} 
                  />
                  <Area 
                    type="natural" 
                    dataKey="returning" 
                    stroke="hsl(var(--chart-2))" 
                    fillOpacity={1} 
                    fill="url(#colorReturning)" 
                    strokeWidth={2}
                    animationDuration={1500}
                  />
                  <Area 
                    type="natural" 
                    dataKey="visitors" 
                    stroke="hsl(var(--primary))" 
                    fillOpacity={1} 
                    fill="url(#colorVisitors)" 
                    strokeWidth={3}
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card className="lg:col-span-3 bg-card/40 backdrop-blur border-border/40 shadow-soft">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Wallet className="size-5 text-primary" />
              Weekly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-0 pb-6">
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.05} />
                  <XAxis dataKey="name" stroke="currentColor" strokeOpacity={0.4} fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="currentColor" strokeOpacity={0.4} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₵${value}`} />
                  <RechartsTooltip 
                    cursor={{ fill: 'currentColor', opacity: 0.05 }} 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px' }} 
                  />
                  <Bar 
                    dataKey="total" 
                    radius={[6, 6, 0, 0]} 
                    className="fill-primary"
                    animationDuration={1500}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <Card className="bg-card/40 backdrop-blur border-border/40 shadow-soft overflow-hidden">
        <CardHeader className="border-b border-border/40">
          <CardTitle className="font-display">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {ordersLoading ? (
            <div className="p-8 text-center text-muted-foreground animate-pulse">Loading orders...</div>
          ) : recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-secondary/30">
                  <tr>
                    <th className="px-6 py-4 font-medium">Order ID</th>
                    <th className="px-6 py-4 font-medium">Customer</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Amount</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {recentOrders.map((order, i) => (
                    <motion.tr 
                      key={order.id} 
                      className="hover:bg-secondary/20 transition-colors"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 + 0.3 }}
                    >
                      <td className="px-6 py-4 font-medium text-foreground">{order.orderNumber}</td>
                      <td className="px-6 py-4 text-muted-foreground truncate max-w-[200px]">
                        {order.shippingAddress?.recipientName ?? "Guest"}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-medium text-foreground">
                        {formatGHS(order.total)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-500' : 
                          order.status === 'processing' ? 'bg-blue-500/10 text-blue-500' :
                          'bg-amber-500/10 text-amber-500'
                        }`}>
                          {order.status === 'delivered' && <CheckCircle2 className="size-3" />}
                          {order.status === 'processing' && <Package className="size-3" />}
                          {order.status === 'pending' && <Clock className="size-3" />}
                          <span className="capitalize">{order.status}</span>
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground">
              No recent orders found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
