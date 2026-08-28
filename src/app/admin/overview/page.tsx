"use client";

import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { TrendingUp, Users, Package, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Mock Data
const revenueData = [
  { name: "Jan", total: 12000 },
  { name: "Feb", total: 15000 },
  { name: "Mar", total: 18000 },
  { name: "Apr", total: 14000 },
  { name: "May", total: 22000 },
  { name: "Jun", total: 28000 },
  { name: "Jul", total: 32000 },
];

const trafficData = [
  { name: "Mon", visitors: 400 },
  { name: "Tue", visitors: 300 },
  { name: "Wed", visitors: 550 },
  { name: "Thu", visitors: 450 },
  { name: "Fri", visitors: 700 },
  { name: "Sat", visitors: 900 },
  { name: "Sun", visitors: 850 },
];

export default function AdminOverviewPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-2">Welcome to the JadeXpress Enterprise command center.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Revenue", value: "₵ 128,500", icon: Wallet, trend: "+12.5%" },
          { title: "Active Customers", value: "2,450", icon: Users, trend: "+5.2%" },
          { title: "Orders (30d)", value: "845", icon: Package, trend: "+18.1%" },
          { title: "Conversion Rate", value: "4.2%", icon: TrendingUp, trend: "+1.1%" },
        ].map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
          >
            <Card className="bg-card/50 backdrop-blur border-border/50 shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="size-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-display text-foreground">{stat.value}</div>
                <p className="text-xs text-emerald-500 mt-1 font-medium tracking-wide">
                  {stat.trend} from last month
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card/50 backdrop-blur border-border/50 shadow-soft col-span-1">
          <CardHeader>
            <CardTitle className="font-display">Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.2} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `₵${value}`} 
                  />
                  <RechartsTooltip 
                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} 
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: '#333', borderRadius: '8px' }} 
                  />
                  <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/50 shadow-soft col-span-1">
          <CardHeader>
            <CardTitle className="font-display">Weekly Traffic</CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trafficData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.2} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: '#333', borderRadius: '8px' }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="visitors" 
                    stroke="currentColor" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: "currentColor" }} 
                    activeDot={{ r: 6 }} 
                    className="stroke-primary" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
