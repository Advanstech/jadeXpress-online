"use client";

import { motion } from "framer-motion";
import { DollarSign, FileText, ArrowUpRight, ArrowDownRight, Wallet, Download, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminOrders, useAdminStats } from "@/hooks/useAdmin";
import { formatGHS } from "@/lib/format";

export default function AdminAccountingPage() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: orders, isLoading: ordersLoading } = useAdminOrders();

  const totalRevenue = stats?.revenue ?? 0;
  
  // Calculate mock expenses based on revenue for a realistic looking dashboard
  const estimatedExpenses = totalRevenue * 0.45; // 45% margin example
  const netProfit = totalRevenue - estimatedExpenses;
  
  const recentTransactions = orders?.slice(0, 8).map(o => ({
    id: o.id,
    date: new Date(o.createdAt).toLocaleDateString(),
    description: `Order ${o.orderNumber}`,
    amount: o.total,
    type: o.paymentStatus === 'paid' ? 'credit' : 'pending',
    method: 'Mobile Money' // simplify for demo
  })) ?? [];

  return (
    <div className="space-y-6 relative">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 -mx-4 px-4 py-4 bg-background/80 backdrop-blur-xl border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">
            Accounting Hub
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage payables, receivables, and enterprise financial health.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="shadow-sm">
            <FileText className="size-4 mr-2" />
            Generate Report
          </Button>
          <Button size="sm" className="shadow-gold">
            <Download className="size-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid gap-4 md:grid-cols-3 pt-2">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-card/40 backdrop-blur border-border/40 shadow-soft">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                  <Wallet className="size-5" />
                </div>
                <span className="flex items-center text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <ArrowUpRight className="size-3 mr-1" />
                  +12.5%
                </span>
              </div>
              <p className="text-sm font-medium text-muted-foreground">Gross Revenue</p>
              <p className="text-3xl font-bold font-display text-foreground mt-1">
                {statsLoading ? "..." : formatGHS(totalRevenue)}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-card/40 backdrop-blur border-border/40 shadow-soft">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-rose-500/10 text-rose-500 rounded-lg">
                  <RefreshCw className="size-5" />
                </div>
                <span className="flex items-center text-xs font-medium text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                  <ArrowDownRight className="size-3 mr-1" />
                  -2.4%
                </span>
              </div>
              <p className="text-sm font-medium text-muted-foreground">Est. Expenses</p>
              <p className="text-3xl font-bold font-display text-foreground mt-1">
                {statsLoading ? "..." : formatGHS(estimatedExpenses)}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-card/40 backdrop-blur border-primary/30 shadow-soft bg-gradient-to-br from-card to-primary/5">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-primary/20 text-primary rounded-lg">
                  <DollarSign className="size-5" />
                </div>
                <span className="flex items-center text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <ArrowUpRight className="size-3 mr-1" />
                  +8.1%
                </span>
              </div>
              <p className="text-sm font-medium text-muted-foreground">Net Profit</p>
              <p className="text-3xl font-bold font-display text-foreground mt-1">
                {statsLoading ? "..." : formatGHS(netProfit)}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* General Ledger */}
      <Card className="bg-card/40 backdrop-blur border-border/40 shadow-soft overflow-hidden">
        <CardHeader className="border-b border-border/40 flex flex-row items-center justify-between">
          <CardTitle className="font-display text-lg">General Ledger (Recent Transactions)</CardTitle>
          <Button variant="ghost" size="sm" className="h-8">View All</Button>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/30">
              <tr>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Description</th>
                <th className="px-6 py-4 font-medium">Method</th>
                <th className="px-6 py-4 font-medium text-right">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {ordersLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground animate-pulse">
                    Loading ledger data...
                  </td>
                </tr>
              ) : recentTransactions.length > 0 ? (
                recentTransactions.map((tx, i) => (
                  <motion.tr 
                    key={tx.id} 
                    className="hover:bg-secondary/20 transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 + 0.2 }}
                  >
                    <td className="px-6 py-4 text-muted-foreground">{tx.date}</td>
                    <td className="px-6 py-4 font-medium text-foreground">{tx.description}</td>
                    <td className="px-6 py-4 text-muted-foreground">{tx.method}</td>
                    <td className="px-6 py-4 font-medium text-right text-foreground">
                      {tx.type === 'credit' ? (
                        <span className="text-emerald-500">+{formatGHS(tx.amount)}</span>
                      ) : (
                        <span className="text-muted-foreground">{formatGHS(tx.amount)}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                        tx.type === 'credit' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {tx.type === 'credit' ? 'Settled' : 'Pending'}
                      </span>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
