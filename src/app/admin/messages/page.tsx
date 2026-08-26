"use client";
import { toast } from "sonner";
import { Mail, Phone, User } from "lucide-react";
import { useAdminMessages } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/format";

export default function AdminMessages() {
  const { data: messages, isLoading } = useAdminMessages();

  const toggleRead = async () => {
    toast.info("Messages are not connected to the API yet.");
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="eyebrow">Admin</span>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">
          Contact messages
        </h1>
        <p className="mt-1 text-muted-foreground">
          Messages submitted through the contact page.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : (messages ?? []).length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-secondary/30 py-16 text-center text-sm text-muted-foreground">
          No messages yet.
        </div>
      ) : (
        <ul className="space-y-3">
          {(messages ?? []).map((m) => (
            <li
              key={m.id}
              className="rounded-lg border border-border bg-card p-5 shadow-soft"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="size-4 text-accent" />
                  <span className="font-semibold text-foreground">{m.name}</span>
                  <a
                    href={`mailto:${m.email}`}
                    className="flex items-center gap-1 text-muted-foreground hover:text-primary"
                  >
                    <Mail className="size-3.5" /> {m.email}
                  </a>
                  {m.phone && (
                    <a
                      href={`tel:${m.phone}`}
                      className="flex items-center gap-1 text-muted-foreground hover:text-primary"
                    >
                      <Phone className="size-3.5" /> {m.phone}
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!m.read && <Badge className="bg-accent text-accent-foreground">New</Badge>}
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(m.created_at)}
                  </span>
                </div>
              </div>
              {m.subject && (
                <p className="mt-2 text-sm font-medium text-foreground">{m.subject}</p>
              )}
              <p className="mt-1 text-sm text-muted-foreground">{m.message}</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-3"
                onClick={() => void toggleRead()}
              >
                {m.read ? "Mark as unread" : "Mark as read"}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
