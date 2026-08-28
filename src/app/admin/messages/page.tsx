"use client";
import { useState } from "react";
import { toast } from "sonner";
import {
  Inbox,
  Mail,
  MailOpen,
  Phone,
  User,
  Clock,
  Search,
  Trash2,
  Archive,
  CheckCircle2,
  MessageSquare,
  Send,
  Sparkles,
  RefreshCw,
  Eye,
  AlertCircle,
  Clock3,
  CheckCheck,
} from "lucide-react";
import { useAdminMessages, useInvalidateAdmin, type ContactMessage } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatDateTime } from "@/lib/format";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

type FilterStatus = "all" | "unread" | "read" | "in_progress" | "replied" | "archived";

export default function AdminMessages() {
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [search, setSearch] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [adminReply, setAdminReply] = useState("");
  const [updating, setUpdating] = useState(false);

  const { data: messagesRes, isLoading, refetch, isRefetching } = useAdminMessages({
    status: filter === "all" ? undefined : filter,
    search: search || undefined,
  });

  const invalidateAdmin = useInvalidateAdmin();

  const messages = messagesRes?.data ?? [];
  const meta = messagesRes?.meta;

  const openMessageModal = (m: ContactMessage) => {
    setSelectedMessage(m);
    setAdminNote(m.adminNotes || "");
    setAdminReply(m.adminReply || "");
    // Automatically mark as read if it was unread
    if (m.status === "unread") {
      void updateStatus(m.id, "read", false);
    }
  };

  const updateStatus = async (id: string, status: ContactMessage["status"], showToast = true) => {
    try {
      await api.patch(`storefront/admin/inbox/${id}`, { status });
      invalidateAdmin();
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage((prev) => prev ? { ...prev, status, read: status !== "unread" } : null);
      }
      if (showToast) {
        toast.success(`Message marked as ${status.replace("_", " ")}`);
      }
    } catch (err: unknown) {
      toast.error((err as Error)?.message || "Failed to update status");
    }
  };

  const saveReplyAndNotes = async () => {
    if (!selectedMessage) return;
    setUpdating(true);
    try {
      await api.patch(`storefront/admin/inbox/${selectedMessage.id}`, {
        adminNotes: adminNote.trim() || null,
        adminReply: adminReply.trim() || null,
        status: adminReply.trim() ? "replied" : selectedMessage.status,
      });
      invalidateAdmin();
      toast.success("Inquiry resolution details saved!");
      setSelectedMessage((prev) =>
        prev
          ? {
              ...prev,
              adminNotes: adminNote.trim() || null,
              adminReply: adminReply.trim() || null,
              status: adminReply.trim() ? "replied" : prev.status,
              repliedAt: adminReply.trim() ? new Date().toISOString() : prev.repliedAt,
            }
          : null,
      );
    } catch (err: unknown) {
      toast.error((err as Error)?.message || "Failed to save inquiry notes");
    } finally {
      setUpdating(false);
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this message?")) return;
    try {
      await api.delete(`storefront/admin/inbox/${id}`);
      invalidateAdmin();
      if (selectedMessage?.id === id) setSelectedMessage(null);
      toast.success("Message deleted successfully");
    } catch (err: unknown) {
      toast.error((err as Error)?.message || "Failed to delete message");
    }
  };

  const getStatusBadge = (status: ContactMessage["status"]) => {
    switch (status) {
      case "unread":
        return <Badge className="bg-emerald-600 text-white font-medium animate-pulse">Unread</Badge>;
      case "read":
        return <Badge variant="secondary" className="text-muted-foreground">Read</Badge>;
      case "in_progress":
        return <Badge className="bg-amber-500 text-white font-medium">In Progress</Badge>;
      case "replied":
        return <Badge className="bg-primary text-primary-foreground font-medium flex items-center gap-1"><CheckCheck className="size-3" /> Replied</Badge>;
      case "archived":
        return <Badge variant="outline" className="text-muted-foreground border-dashed">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="eyebrow flex items-center gap-1.5">
            <Inbox className="size-3.5 text-primary" /> Admin Inbox
          </span>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground">
            Customer Inquiries & Messages
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage incoming messages, product inquiries, and feedback submitted via the storefront.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            disabled={isRefetching}
            className="gap-2"
          >
            <RefreshCw className={cn("size-3.5", isRefetching && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4 shadow-soft">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Total Messages</p>
          <p className="mt-1 font-display text-2xl font-bold text-foreground">
            {meta?.total ?? 0}
          </p>
        </div>
        <div className="rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 shadow-soft">
          <p className="text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
            <AlertCircle className="size-3" /> Unread Inquiries
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-emerald-700 dark:text-emerald-300">
            {meta?.unreadCount ?? 0}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 shadow-soft">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Filter Active</p>
          <p className="mt-1 font-display text-2xl font-bold capitalize text-primary">
            {filter}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 shadow-soft">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Support Status</p>
          <p className="mt-1 text-sm font-semibold text-foreground flex items-center gap-1.5 pt-1">
            <span className="size-2 rounded-full bg-emerald-500" /> All Systems Online
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-border bg-card p-3 shadow-soft">
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: "all", label: "All Messages" },
              { id: "unread", label: "Unread" },
              { id: "in_progress", label: "In Progress" },
              { id: "replied", label: "Replied" },
              { id: "archived", label: "Archived" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-semibold transition-all",
                filter === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              {tab.label}
              {tab.id === "unread" && (meta?.unreadCount ?? 0) > 0 && (
                <span className="ml-1.5 rounded-full bg-emerald-500 px-1.5 py-0.2 text-[10px] text-white">
                  {meta?.unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search sender, email, text…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-8 text-xs"
          />
        </div>
      </div>

      {/* Message List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      ) : messages.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-secondary/30 py-16 text-center">
          <Inbox className="mx-auto size-10 text-muted-foreground/50 mb-3" />
          <h3 className="font-display text-lg font-semibold text-foreground">No messages found</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1">
            {search || filter !== "all"
              ? "Try adjusting your search query or filter tab."
              : "No customer inquiries have been received yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              onClick={() => openMessageModal(m)}
              className={cn(
                "group relative cursor-pointer rounded-lg border p-5 transition-all shadow-soft hover:shadow-md hover:border-primary/50",
                m.status === "unread"
                  ? "border-emerald-500/40 bg-emerald-500/[0.02] dark:bg-emerald-500/[0.04]"
                  : "border-border bg-card",
              )}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 font-semibold text-foreground text-sm">
                      <User className="size-4 text-accent" />
                      <span>{m.name}</span>
                    </div>
                    <span className="text-muted-foreground text-xs">•</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Mail className="size-3.5" /> {m.email}
                    </span>
                    {m.phone && (
                      <>
                        <span className="text-muted-foreground text-xs">•</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Phone className="size-3.5" /> {m.phone}
                        </span>
                      </>
                    )}
                    <div className="ml-auto sm:ml-2">
                      {getStatusBadge(m.status)}
                    </div>
                  </div>

                  <h3 className="font-display text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                    {m.subject || "General Inquiry"}
                  </h3>

                  <p className="text-sm text-muted-foreground line-clamp-2 pr-4">
                    {m.message}
                  </p>

                  {m.adminReply && (
                    <div className="mt-2 rounded-md bg-secondary/50 p-2.5 text-xs text-foreground border border-border">
                      <p className="font-semibold flex items-center gap-1 text-primary">
                        <CheckCheck className="size-3.5" /> Admin Reply / Note:
                      </p>
                      <p className="mt-0.5 text-muted-foreground line-clamp-1">{m.adminReply}</p>
                    </div>
                  )}
                </div>

                <div className="flex sm:flex-col items-end justify-between gap-3 shrink-0 pt-2 sm:pt-0">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="size-3" />
                    {formatDateTime(m.createdAt)}
                  </span>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2.5 text-xs gap-1.5 hover:bg-primary/10 hover:text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        openMessageModal(m);
                      }}
                    >
                      <Eye className="size-3.5" /> View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        void deleteMessage(m.id);
                      }}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message Detail & Resolution Modal */}
      <Dialog open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedMessage && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between gap-2 pr-6">
                  <span className="eyebrow flex items-center gap-1.5">
                    <Inbox className="size-3.5 text-primary" /> Inquiry Detail
                  </span>
                  {getStatusBadge(selectedMessage.status)}
                </div>
                <DialogTitle className="font-display text-2xl font-bold mt-1 text-foreground">
                  {selectedMessage.subject || "Customer Inquiry"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Received on {formatDateTime(selectedMessage.createdAt)}
                </DialogDescription>
              </DialogHeader>

              {/* Sender Details Card */}
              <div className="rounded-lg border border-border bg-secondary/30 p-4 space-y-3">
                <div className="grid gap-2 sm:grid-cols-2 text-sm">
                  <div>
                    <span className="text-xs font-medium text-muted-foreground uppercase">Sender Name</span>
                    <p className="font-semibold text-foreground mt-0.5">{selectedMessage.name}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-muted-foreground uppercase">Email Address</span>
                    <p className="mt-0.5">
                      <a
                        href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject || "JadeXpress Inquiry")}`}
                        className="font-medium text-primary hover:underline flex items-center gap-1"
                      >
                        <Mail className="size-3.5" /> {selectedMessage.email}
                      </a>
                    </p>
                  </div>
                  {selectedMessage.phone && (
                    <div>
                      <span className="text-xs font-medium text-muted-foreground uppercase">Phone Number</span>
                      <p className="mt-0.5">
                        <a
                          href={`tel:${selectedMessage.phone}`}
                          className="font-medium text-foreground hover:text-primary flex items-center gap-1"
                        >
                          <Phone className="size-3.5" /> {selectedMessage.phone}
                        </a>
                      </p>
                    </div>
                  )}
                  <div>
                    <span className="text-xs font-medium text-muted-foreground uppercase">Quick Status</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {(["unread", "read", "in_progress", "replied", "archived"] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => void updateStatus(selectedMessage.id, st)}
                          className={cn(
                            "rounded px-2 py-0.5 text-[11px] font-medium transition-all capitalize",
                            selectedMessage.status === st
                              ? "bg-primary text-primary-foreground font-bold shadow-sm"
                              : "bg-background text-muted-foreground hover:text-foreground border border-border",
                          )}
                        >
                          {st.replace("_", " ")}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Inquiry Message Body */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Inquiry Message
                </label>
                <div className="rounded-lg border border-border bg-card p-4 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>

              {/* Admin Resolution & Reply Section */}
              <div className="space-y-3 pt-2 border-t border-border">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5 mb-1.5">
                    <MessageSquare className="size-3.5 text-primary" /> Resolution Notes / Customer Reply
                  </label>
                  <Textarea
                    rows={3}
                    placeholder="Document resolution steps, staff notes, or copy of reply sent to customer…"
                    value={adminReply}
                    onChange={(e) => setAdminReply(e.target.value)}
                    className="text-sm"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="shadow-gold gap-1.5"
                      onClick={() => void saveReplyAndNotes()}
                      disabled={updating}
                    >
                      <CheckCircle2 className="size-4" />
                      {updating ? "Saving…" : "Save Resolution"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="gap-1.5"
                    >
                      <a
                        href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject || "JadeXpress Inquiry")}&body=${encodeURIComponent(`\n\n--- Original Inquiry ---\n${selectedMessage.message}`)}`}
                      >
                        <Send className="size-3.5 text-accent" />
                        Reply via Email Client
                      </a>
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 gap-1.5"
                    onClick={() => void deleteMessage(selectedMessage.id)}
                  >
                    <Trash2 className="size-4" /> Delete
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
