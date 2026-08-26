"use client";
import { useAdminCustomers } from "@/hooks/useAdmin";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const roleStyles: Record<string, string> = {
  owner: "bg-accent text-accent-foreground",
  super_admin: "bg-primary text-primary-foreground",
  admin: "bg-primary/80 text-primary-foreground",
  manager: "bg-secondary text-secondary-foreground border border-border",
  customer: "bg-muted text-muted-foreground",
};

export default function AdminCustomers() {
  const { data: customers, isLoading } = useAdminCustomers();

  return (
    <div className="space-y-6">
      <div>
        <span className="eyebrow">Admin</span>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">
          Customers
        </h1>
        <p className="mt-1 text-muted-foreground">
          Everyone with a JadeXpress account and their role on the store.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : (customers ?? []).length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-secondary/30 py-16 text-center text-sm text-muted-foreground">
          No customers yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-soft">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody>
              {(customers ?? []).map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-border last:border-0 hover:bg-secondary/30"
                >
                  <td className="px-4 py-3 font-medium text-foreground">
                    {c.full_name || "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {c.phone || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      className={cn(
                        roleStyles[c.role ?? "customer"] ?? roleStyles.customer,
                      )}
                    >
                      {c.role ?? "customer"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {c.created_at ? formatDate(c.created_at) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
