"use client";

import { useTransfers } from "@/hooks/useTransfers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRightLeft, Eye } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function TransfersPage() {
  const { data: transfers, isLoading } = useTransfers();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
      case "received":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "pending_approval":
      case "in_transit":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "rejected":
      case "cancelled":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      default:
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Stock Transfers</h1>
          <p className="text-muted-foreground mt-1">Manage inter-branch inventory transfers</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/admin/inventory/transfers/new">
            <Plus className="w-4 h-4" />
            New Transfer
          </Link>
        </Button>
      </div>

      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Transfer History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">Loading transfers...</div>
          ) : !transfers?.length ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-secondary/50 grid place-items-center mb-4">
                <ArrowRightLeft className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No transfers found</h3>
              <p className="text-muted-foreground text-sm max-w-sm">
                There are no stock transfers recorded yet. Create a new transfer to move stock between branches.
              </p>
              <Button asChild variant="outline" className="mt-6">
                <Link href="/admin/inventory/transfers/new">Initiate Transfer</Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-md border border-border/50 overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary/30 text-muted-foreground font-medium border-b border-border/50">
                  <tr>
                    <th className="px-4 py-3">Transfer #</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">From Branch</th>
                    <th className="px-4 py-3">To Branch</th>
                    <th className="px-4 py-3">Items</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {transfers.map((t) => (
                    <tr key={t.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3 font-mono font-medium">{t.transferNumber}</td>
                      <td className="px-4 py-3">{format(new Date(t.createdAt), "MMM d, yyyy")}</td>
                      <td className="px-4 py-3 font-medium">{t.fromStore.name}</td>
                      <td className="px-4 py-3 font-medium">{t.toStore.name}</td>
                      <td className="px-4 py-3">{t.items.length} items</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={getStatusColor(t.status)}>
                          {t.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/inventory/transfers/${t.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
