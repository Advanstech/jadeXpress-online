"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useTransfer, useApproveTransfer, useRejectTransfer } from "@/hooks/useTransfers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function TransferDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { data: transfer, isLoading } = useTransfer(resolvedParams.id);
  const { mutateAsync: approveTransfer, isPending: isApproving } = useApproveTransfer();
  const { mutateAsync: rejectTransfer, isPending: isRejecting } = useRejectTransfer();

  const [notes, setNotes] = useState("");

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

  const handleApprove = async () => {
    try {
      await approveTransfer({ id: resolvedParams.id, notes });
      toast.success("Transfer approved successfully. Stock has been synchronized.");
      router.push("/admin/inventory/transfers");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to approve transfer.");
    }
  };

  const handleReject = async () => {
    try {
      await rejectTransfer({ id: resolvedParams.id, notes });
      toast.success("Transfer request rejected.");
      router.push("/admin/inventory/transfers");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to reject transfer.");
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading transfer details...</div>;
  }

  if (!transfer) {
    return <div className="p-8 text-center text-muted-foreground">Transfer not found.</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/inventory/transfers">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Transfer #{transfer.transferNumber}</h1>
          <p className="text-muted-foreground mt-1">
            Created on {format(new Date(transfer.createdAt), "MMM d, yyyy h:mm a")}
          </p>
        </div>
        <div className="ml-auto">
          <Badge variant="outline" className={`px-3 py-1 text-sm ${getStatusColor(transfer.status)}`}>
            {transfer.status.replace("_", " ").toUpperCase()}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Branch Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Source (From)</p>
              <p className="font-semibold text-lg">{transfer.fromStore.name} ({transfer.fromStore.code})</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Destination (To)</p>
              <p className="font-semibold text-lg">{transfer.toStore.name} ({transfer.toStore.code})</p>
            </div>
            {transfer.notes && (
              <div className="bg-secondary/20 p-3 rounded-md">
                <p className="text-sm text-muted-foreground mb-1">Notes</p>
                <p className="text-sm whitespace-pre-wrap">{transfer.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {transfer.status === "pending_approval" && (
          <Card className="bg-card/50 backdrop-blur border-border/50 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)]">
            <CardHeader>
              <CardTitle className="text-lg">Approval Action</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Add Note (Optional)</label>
                <Textarea
                  placeholder="Reason for approval/rejection..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="resize-none"
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700"
                  onClick={handleApprove}
                  disabled={isApproving || isRejecting}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isApproving ? "Approving..." : "Approve & Sync Stock"}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 gap-2 border-destructive text-destructive hover:bg-destructive/10"
                  onClick={handleReject}
                  disabled={isApproving || isRejecting}
                >
                  <XCircle className="w-4 h-4" />
                  {isRejecting ? "Rejecting..." : "Reject Transfer"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Transfer Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/50 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/30 text-muted-foreground font-medium border-b border-border/50">
                <tr>
                  <th className="px-4 py-3">Product Name</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3 text-right">Qty Requested</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {transfer.items.map((item) => (
                  <tr key={item.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3 font-medium">{item.product.name}</td>
                    <td className="px-4 py-3 font-mono text-xs">{item.product.sku}</td>
                    <td className="px-4 py-3 text-right font-semibold">{item.quantityRequested}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
