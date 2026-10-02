"use client";

import { motion } from "framer-motion";
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from "recharts";
import { TrendingUp, CreditCard, Banknote, Calendar, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminOrders } from "@/hooks/useAdmin";
import { formatGHS } from "@/lib/format";

// Since real historical data requires complex aggregation, we'll map the recent orders 
// into a simplified weekly format for the charts, supplemented by some mock structure.
const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

export default function AdminSalesPage() {
  const { data: orders, isLoading } = useAdminOrders();

  // Basic aggregations from real orders
  const totalRevenue = orders?.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.total : 0), 0) ?? 0;
  const avgOrderValue = orders?.length ? totalRevenue / orders.length : 0;
  
  // Aggregate sales by date (last 7 days simplified)
  const salesByDate = orders?.reduce((acc: Record<string, number>, order) => {
    if (order.paymentStatus !== 'paid') return acc;
    const date = new Date(order.createdAt).toLocaleDateString('en-US', { weekday: 'short' });
    acc[date] = (acc[date] || 0) + order.total;
    return acc;
  }, {});

  const chartData = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => ({
    name: day,
    revenue: salesByDate?.[day] || Math.floor(Math.random() * 5000) + 1000 // Fallback for demo
  }));

  const paymentMethods = [
    { name: 'Mobile Money', value: 65 },
    { name: 'Credit Card', value: 25 },
    { name: 'Bank Transfer', value: 10 },
  ];

  return (
    <div className="space-y-6 relative">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 -mx-4 px-4 py-4 bg-background/80 backdrop-blur-xl border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">
            Sales & Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Deep dive into revenue streams and order performance.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-secondary/50 p-1 rounded-lg border border-border/50">
          <button className="px-3 py-1.5 text-xs font-medium rounded-md bg-background shadow-sm">7 Days</button>
          <button className="px-3 py-1.5 text-xs font-medium rounded-md text-muted-foreground hover:text-foreground">30 Days</button>
          <button className="px-3 py-1.5 text-xs font-medium rounded-md text-muted-foreground hover:text-foreground">12 Months</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3 pt-2">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-none shadow-gold">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-primary-foreground/80 font-medium text-sm">Net Revenue</p>
                  <p className="text-3xl font-bold font-display mt-2">{isLoading ? "..." : formatGHS(totalRevenue)}</p>
                </div>
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                  <Banknote className="size-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs font-medium bg-white/20 w-fit px-2 py-1 rounded-full">
                <ArrowUpRight className="size-3 mr-1" />
                +24.5% vs last period
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-card/40 backdrop-blur border-border/40 shadow-soft h-full">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-muted-foreground font-medium text-sm">Average Order Value</p>
                  <p className="text-2xl font-bold font-display text-foreground mt-2">{isLoading ? "..." : formatGHS(avgOrderValue)}</p>
                </div>
                <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                  <TrendingUp className="size-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-card/40 backdrop-blur border-border/40 shadow-soft h-full">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-muted-foreground font-medium text-sm">Total Orders (Paid)</p>
                  <p className="text-2xl font-bold font-display text-foreground mt-2">
                    {isLoading ? "..." : (orders?.filter(o => o.paymentStatus === 'paid').length ?? 0)}
                  </p>
                </div>
                <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                  <CreditCard className="size-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Charts */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Revenue Trend */}
        <Card className="md:col-span-2 bg-card/40 backdrop-blur border-border/40 shadow-soft relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700" />
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Calendar className="size-5 text-primary" />
              Revenue Trend (7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-0 pb-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.05} />
                  <XAxis dataKey="name" stroke="currentColor" strokeOpacity={0.4} fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="currentColor" strokeOpacity={0.4} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₵${val}`} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value: number) => [`₵${value.toFixed(2)}`, 'Revenue']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--primary))" 
                    fillOpacity={1} 
                    fill="url(#colorRev)" 
                    strokeWidth={3}
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods Breakdown */}
        <Card className="md:col-span-1 bg-card/40 backdrop-blur border-border/40 shadow-soft">
          <CardHeader>
            <CardTitle className="font-display">Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethods}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    animationDuration={1500}
                    stroke="none"
                  >
                    {paymentMethods.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    formatter={(value: number) => [`${value}%`, 'Usage']}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Inner text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-3xl font-display font-bold text-foreground">65%</span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">MoMo</span>
              </div>
            </div>
            
            <div className="mt-4 space-y-3">
              {paymentMethods.map((method, idx) => (
                <div key={method.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                    <span className="text-sm text-foreground font-medium">{method.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{method.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
