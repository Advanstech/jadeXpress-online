"use client";
import { useState } from "react";
import { MapPin, Pencil, Plus, Star, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useAddresses, useAddressMutations } from "@/hooks/useAddresses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GHANA_REGIONS } from "@/config/site";
import type { Address } from "@/types";
import { cn } from "@/lib/utils";

type Draft = Omit<Address, "id">;

const emptyDraft: Draft = {
  label: "Home",
  recipientName: "",
  phone: "",
  country: "Ghana",
  region: "Greater Accra",
  city: "",
  street: "",
  digitalAddress: "",
  isDefault: false,
};

export default function Addresses() {
  const { data: addresses, isLoading } = useAddresses();
  const { insert, update, remove, setDefault } = useAddressMutations();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const list = addresses ?? [];

  const startAdd = () => {
    setDraft({ ...emptyDraft });
    setEditId(null);
  };
  const startEdit = (a: Address) => {
    setDraft({
      label: a.label,
      recipientName: a.recipientName,
      phone: a.phone,
      country: a.country,
      region: a.region,
      city: a.city,
      street: a.street,
      digitalAddress: a.digitalAddress ?? "",
      isDefault: a.isDefault,
    });
    setEditId(a.id);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    if (!draft.recipientName || !draft.phone || !draft.city || !draft.street) {
      toast.error("Please complete the required fields.");
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await update(editId, draft);
        toast.success("Address updated.");
      } else {
        await insert(draft);
        toast.success("Address added.");
      }
      setDraft(null);
      setEditId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="eyebrow">Account</span>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">
            Addresses
          </h1>
        </div>
        {!draft && (
          <Button onClick={startAdd} className="shadow-gold">
            <Plus className="mr-2 size-4" />
            Add address
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      ) : list.length === 0 && !draft ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-secondary/30 py-16 text-center">
          <MapPin className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Save an address for faster checkout.
          </p>
          <Button onClick={startAdd}>Add your first address</Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {list.map((a) => (
            <div
              key={a.id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-border bg-card p-5 shadow-soft"
            >
              <div className="flex gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-secondary text-primary">
                  <MapPin className="size-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-display text-base font-semibold text-foreground">
                      {a.label}
                    </p>
                    {a.isDefault && (
                      <Badge className="bg-accent text-accent-foreground">Default</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {a.recipientName} · {a.phone}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {a.street}, {a.city}, {a.region}, {a.country}
                  </p>
                  {a.digitalAddress && (
                    <p className="text-xs text-muted-foreground">
                      GhanaPost GPS: {a.digitalAddress}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {!a.isDefault && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      void setDefault(a.id);
                      toast.success("Default address updated.");
                    }}
                  >
                    <Star className="mr-1 size-4" /> Set default
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => startEdit(a)} aria-label="Edit">
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    void remove(a.id);
                    toast.success("Address removed.");
                  }}
                  aria-label="Delete"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {draft && (
        <form
          onSubmit={save}
          className="rounded-lg border border-border bg-card p-5 shadow-elegant"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-foreground">
              {editId ? "Edit address" : "New address"}
            </h2>
            <button
              type="button"
              onClick={() => {
                setDraft(null);
                setEditId(null);
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-5" />
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Label">
              <Input
                value={draft.label}
                onChange={(e) => setDraft({ ...draft, label: e.target.value })}
              />
            </Field>
            <Field label="Recipient name" required>
              <Input
                value={draft.recipientName}
                onChange={(e) =>
                  setDraft({ ...draft, recipientName: e.target.value })
                }
              />
            </Field>
            <Field label="Phone" required>
              <Input
                value={draft.phone}
                onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
              />
            </Field>
            <Field label="Country">
              <Input
                value={draft.country}
                onChange={(e) => setDraft({ ...draft, country: e.target.value })}
              />
            </Field>
            <Field label="Region / State" required>
              {draft.country.toLowerCase().includes("ghana") ? (
                <Select
                  value={draft.region}
                  onValueChange={(v) => setDraft({ ...draft, region: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GHANA_REGIONS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={draft.region}
                  onChange={(e) => setDraft({ ...draft, region: e.target.value })}
                />
              )}
            </Field>
            <Field label="City" required>
              <Input
                value={draft.city}
                onChange={(e) => setDraft({ ...draft, city: e.target.value })}
              />
            </Field>
            <Field label="Street address" required className="sm:col-span-2">
              <AddressAutocomplete
                value={draft.street}
                onChange={(v) => setDraft({ ...draft, street: v })}
                onSelect={(s) =>
                  setDraft({
                    ...draft,
                    street: s.street || s.label,
                    city: s.city || draft.city,
                    region: s.region || draft.region,
                    country: s.country || draft.country,
                  })
                }
                countryBias={draft.country}
                placeholder="Start typing your address…"
              />
            </Field>
            {draft.country.toLowerCase().includes("ghana") && (
              <Field label="GhanaPost GPS" className="sm:col-span-2">
                <Input
                  value={draft.digitalAddress ?? ""}
                  onChange={(e) =>
                    setDraft({ ...draft, digitalAddress: e.target.value })
                  }
                />
              </Field>
            )}
            <label className="flex items-center gap-2 text-sm text-foreground sm:col-span-2">
              <input
                type="checkbox"
                checked={draft.isDefault}
                onChange={(e) =>
                  setDraft({ ...draft, isDefault: e.target.checked })
                }
                className={cn(
                  "size-4 rounded border-border text-primary focus:ring-primary",
                )}
              />
              Set as default address
            </label>
          </div>
          <div className="mt-5 flex gap-2">
            <Button type="submit" className="shadow-gold" disabled={saving}>
              {saving ? "Saving…" : editId ? "Save changes" : "Add address"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDraft(null);
                setEditId(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-sm font-medium text-foreground">
        {label} {required && <span className="text-accent">*</span>}
      </Label>
      {children}
    </div>
  );
}
