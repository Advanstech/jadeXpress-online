"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "@/hooks/useNavigate";
import {
  CheckCircle2,
  CreditCard,
  Loader2,
  Lock,
  ShoppingBag,
  Smartphone,
  Store,
  Truck,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useAddresses, useAddressMutations } from "@/hooks/useAddresses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Reveal } from "@/components/motion/Reveal";
import { Link } from "@/components/Link";
import { Skeleton } from "@/components/ui/skeleton";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import { api } from "@/lib/api";
import { type ApiOrder } from "@/hooks/useOrders";
import { getCourierQuote, type CourierQuote } from "@/lib/couriers";
import { formatGHS } from "@/lib/format";
import { SITE, GHANA_REGIONS } from "@/config/site";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type PaymentMethod =
  | "mtn_momo"
  | "vodafone_cash"
  | "airteltigo"
  | "card";

// Only rails that actually collect money are listed. A "bank transfer" option
// was removed rather than silently opening the card page — it needs a real
// deposit-verification flow (and the owner's account details) before it can
// promise a transfer reference.
const paymentMethods: {
  value: PaymentMethod;
  label: string;
  hint: string;
  icon: typeof Smartphone;
}[] = [
  { value: "mtn_momo", label: "MTN MoMo", hint: "MTN wallet", icon: Smartphone },
  { value: "vodafone_cash", label: "Telecel Cash", hint: "Telecel wallet", icon: Smartphone },
  { value: "airteltigo", label: "AT Money", hint: "AT wallet", icon: Smartphone },
  { value: "card", label: "Debit / credit card", hint: "Visa & Mastercard", icon: CreditCard },
];

interface FormState {
  recipientName: string;
  phone: string;
  email: string;
  country: string;
  region: string;
  city: string;
  street: string;
  digitalAddress: string;
  deliveryBranch: string;
}

interface BranchOption {
  id: string;
  code: string;
  name: string;
  address: string | null;
  city: string;
  phone: string | null;
}

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart, hydrated: cartHydrated } = useCart();
  const { user, profile } = useAuth();
  const { data: addresses } = useAddresses();
  const { insert: saveAddressRow, update: updateAddressRow } = useAddressMutations();

  const [form, setForm] = useState<FormState>({
    recipientName: "",
    phone: "",
    email: "",
    country: "Ghana",
    region: "Greater Accra",
    city: "",
    street: "",
    digitalAddress: "",
    deliveryBranch: "",
  });
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [placing, setPlacing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [saveAddress, setSaveAddress] = useState(true);

  const [quote, setQuote] = useState<CourierQuote | null>(null);

  // Payment
  const [method, setMethod] = useState<PaymentMethod>("mtn_momo");
  // What the bank outlet can actually take. null = not observed yet, keep the
  // full list; false = the pay page genuinely has no wallet option, so the
  // customer must not be sent down that path.
  const [rail, setRail] = useState<{
    mobileMoneyAvailable: boolean | null;
    cardSchemes: string[];
  }>({ mobileMoneyAvailable: null, cardSchemes: [] });
  const [momoPhone, setMomoPhone] = useState("");
  // Confirmation gate — nothing is ordered or charged before the customer
  // has seen the contact + delivery details back once.
  const [reviewOpen, setReviewOpen] = useState(false);
  // Which saved address the form is currently mirroring (null = new address).
  const [savedAddressId, setSavedAddressId] = useState<string | null>(null);
  // The browser is navigating to the bank page — the overlay must stay up until
  // the new document actually loads.
  const [redirecting, setRedirecting] = useState(false);
  // Escape hatch if a blocker keeps the redirect from leaving the page.
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  const defaultAddr = addresses?.find((a) => a.isDefault) ?? addresses?.[0];

  useEffect(() => {
    if (user || profile) {
      setForm((f) => ({
        ...f,
        email: f.email || user?.email || "",
        recipientName: f.recipientName || profile?.full_name || "",
        phone: f.phone || profile?.phone || "",
      }));
      setMomoPhone((prev) => prev || profile?.phone || "");
    }
  }, [user, profile]);

  useEffect(() => {
    if (!defaultAddr) return;
    setForm((f) => {
      // Never overwrite something they have already started typing — a non-empty
      // street means this is their own address, not a blank form.
      if (f.street.trim()) return f;
      return {
        ...f,
        recipientName: f.recipientName || defaultAddr.recipientName,
        phone: f.phone || defaultAddr.phone,
        country: defaultAddr.country || f.country,
        region: defaultAddr.region || f.region,
        city: defaultAddr.city || f.city,
        street: defaultAddr.street,
        digitalAddress: defaultAddr.digitalAddress ?? "",
      };
    });
    setSavedAddressId(defaultAddr.id);
    setSaveAddress(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultAddr?.id]);

  // Courier quote (Speedaf / DHL) for the delivery estimate.
  useEffect(() => {
    let active = true;
    getCourierQuote(form.country, subtotal).then((q) => {
      if (active) setQuote(q);
    });
    return () => {
      active = false;
    };
  }, [form.country, subtotal]);

  // Delivery branches — public list of active stores (Dzorwulu, Israel Park…).
  useEffect(() => {
    api
      .get<BranchOption[]>("storefront/branches")
      .then((list) => {
        if (Array.isArray(list)) {
          setBranches(list);
          setForm((f) =>
            f.deliveryBranch || list.length === 1
              ? { ...f, deliveryBranch: f.deliveryBranch || list[0].name }
              : f,
          );
        }
      })
      .catch(() => setBranches([]));
  }, []);

  const shipping = quote?.fee ?? (form.country.toLowerCase().includes("ghana")
    ? subtotal >= SITE.freeShippingThreshold ? 0 : SITE.shippingFeeGhana
    : SITE.shippingFeeInternational);
  const total = subtotal + shipping;
  const isGhana = form.country.toLowerCase().includes("ghana");

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

  const pickAddress = (id: string) => {
    const a = addresses?.find((x) => x.id === id);
    if (!a) return;
    set({
      recipientName: a.recipientName,
      phone: a.phone,
      country: a.country,
      region: a.region,
      city: a.city,
      street: a.street,
      digitalAddress: a.digitalAddress ?? "",
    });
    setSavedAddressId(a.id);
    setSaveAddress(true);
  };

  /**
   * Keep the customer's address book in step with what they actually used:
   * editing a saved address updates it in place, a brand-new one is added.
   * Runs after the order exists and never blocks it.
   */
  const persistAddress = async (addr: {
    recipientName: string;
    phone: string;
    country: string;
    region: string;
    city: string;
    street: string;
    digitalAddress: string | null;
  }) => {
    if (!user || !saveAddress) return;
    try {
      if (savedAddressId) {
        const current = (addresses ?? []).find((a) => a.id === savedAddressId);
        const dirty =
          !current ||
          current.recipientName !== addr.recipientName ||
          current.phone !== addr.phone ||
          current.country !== addr.country ||
          current.region !== addr.region ||
          current.city !== addr.city ||
          current.street !== addr.street ||
          (current.digitalAddress ?? "") !== (addr.digitalAddress ?? "");
        if (dirty) {
          await updateAddressRow(savedAddressId, {
            recipientName: addr.recipientName,
            phone: addr.phone,
            country: addr.country,
            region: addr.region,
            city: addr.city,
            street: addr.street,
            digitalAddress: addr.digitalAddress,
          });
        }
        return;
      }
      const duplicate = (addresses ?? []).some(
        (a) =>
          a.street.trim().toLowerCase() === addr.street.toLowerCase() &&
          a.city.trim().toLowerCase() === addr.city.toLowerCase() &&
          a.region.trim().toLowerCase() === addr.region.toLowerCase(),
      );
      if (duplicate) return;
      await saveAddressRow({
        label: "Delivery",
        recipientName: addr.recipientName,
        phone: addr.phone,
        country: addr.country,
        region: addr.region,
        city: addr.city,
        street: addr.street,
        digitalAddress: addr.digitalAddress,
        isDefault: (addresses?.length ?? 0) === 0,
      });
    } catch {
      /* non-blocking — the order must still go through */
    }
  };

  const validate = () => {
    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return false;
    }
    if (!form.recipientName.trim() || !form.phone.trim() || !form.email.trim()) {
      toast.error("Please complete your name, phone and email.");
      return false;
    }
    if (!form.city.trim() || !form.street.trim()) {
      toast.error("Please enter your delivery address.");
      return false;
    }
    if (isGhana && branches.length > 0 && !form.deliveryBranch) {
      toast.error("Please choose the branch to deliver from.");
      return false;
    }
    if (method === "mtn_momo" || method === "vodafone_cash" || method === "airteltigo") {
      if (!momoPhone.trim()) {
        toast.error("Enter the mobile money phone number.");
        return false;
      }
    }
    return true;
  };

  const placeOrder = async () => {
    if (!validate()) return;
    setPlacing(true);
    try {
      const shippingAddress = {
        recipientName: form.recipientName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        country: form.country.trim(),
        region: form.region.trim(),
        city: form.city.trim(),
        street: form.street.trim(),
        digitalAddress: form.digitalAddress.trim() || null,
        deliveryBranch: form.deliveryBranch || null,
        courier: quote
          ? {
              provider: quote.provider,
              service: quote.service,
              eta: quote.eta,
              trackingNumber: quote.trackingNumber,
            }
          : null,
      };

      // Sync the confirmed address back to the customer's profile. Done after the
      // order is created (below) so an abandoned checkout leaves no stray rows.
      // Every online tender is collected on the Stanbic/N-Genius hosted page:
      // cards (Visa/Mastercard) and Mobile Money (MTN/Telecel/AT). The wallet
      // choice and the PIN prompt happen on the bank's page — never here.
      const paymentGateway = "ngenius";
      const channel: "card" | "momo" = method === "card" ? "card" : "momo";
      const network =
        method === "mtn_momo" ? "MTN" : method === "vodafone_cash" ? "Telecel" : "AT";

      const payload = {
        email: shippingAddress.email,
        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          price: Math.round(i.price * 100),
          quantity: i.quantity,
          image: i.image || null,
        })),
        shippingFeePesewas: Math.round(shipping * 100),
        shippingAddress,
        paymentGateway,
        notes: `Payment method: ${method}`,
      };

      const order = await api.post<ApiOrder>("storefront/orders", payload);
      const { orderNumber, id } = order;

      // The order exists — now it is safe to write the address book.
      await persistAddress(shippingAddress);

      sessionStorage.setItem(
        "jadexpress_last_order",
        JSON.stringify({ orderNumber, email: shippingAddress.email, orderId: id }),
      );

      if (paymentGateway === "ngenius") {
        setProcessing(true);
        const { paymentUrl } = await api.post<{ paymentUrl: string }>(
          `storefront/orders/${id}/pay-link`,
          {
            channel,
            phone: channel === "momo" ? momoPhone : undefined,
            network: channel === "momo" ? network : undefined,
          },
        );
        if (paymentUrl) {
          // Remember how the payer chose to pay so the success page can reopen
          // the hosted page if the bank never reports a completed payment.
          sessionStorage.setItem(
            "jadexpress_pending_payment",
            JSON.stringify({
              orderNumber,
              channel,
              phone: channel === "momo" ? momoPhone : undefined,
              network: channel === "momo" ? network : undefined,
            }),
          );
          // The order now exists and is awaiting collection — the bank page owns
          // the payment from here on, so the local cart is done.
          setRedirecting(true);
          setPaymentUrl(paymentUrl);
          clearCart();
          window.location.href = paymentUrl;
          return;
        }
        // Never fall through to a fake "thank you" — an order that was not
        // collected must fail loudly so staff can follow up.
        throw new Error("Payment page unavailable");
      }

      // No other rail is wired: the order exists but is unpaid, and the error
      // toast above tells the customer nothing was charged.
    } catch {
      toast.error("Payment could not be started. No money was taken — please try again.");
      // Only the failure path clears the flags: on success we stay in the busy
      // state until the browser leaves the page.
      setPlacing(false);
      setProcessing(false);
      setRedirecting(false);
    }
  };

  const reviewOrder = () => {
    if (!validate()) return;
    setReviewOpen(true);
  };

  const editFromReview = () => {
    setReviewOpen(false);
    document
      .getElementById("checkout-form")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const isMomo =
    method === "mtn_momo" || method === "vodafone_cash" || method === "airteltigo";

  // Tender availability is owned by the bank, not by us: read it once and
  // demote the wallet options when the outlet has none provisioned.
  useEffect(() => {
    let alive = true;
    api
      .get<{ mobileMoneyAvailable: boolean | null; cardSchemes: string[] }>(
        "storefront/payment-methods",
      )
      .then((res) => {
        if (!alive || !res) return;
        setRail({
          mobileMoneyAvailable: res.mobileMoneyAvailable ?? null,
          cardSchemes: res.cardSchemes ?? [],
        });
        if (res.mobileMoneyAvailable === false) {
          setMethod((current) => (current === "card" ? current : "card"));
        }
      })
      .catch(() => {
        /* informational only — keep the full list */
      });
    return () => {
      alive = false;
    };
  }, []);

  const walletsBlocked = rail.mobileMoneyAvailable === false;
  const walletHint = walletsBlocked ? "Awaiting bank activation" : null;
  const cardHint =
    rail.cardSchemes.length > 0 && !rail.cardSchemes.includes("MASTERCARD")
      ? `${rail.cardSchemes.join(" · ")} — more schemes being added`
      : "Visa & Mastercard";
  const methodLabel =
    paymentMethods.find((m) => m.value === method)?.label ?? "Secure payment";

  // The cart is restored from localStorage after mount. Until then render a
  // skeleton: the server always renders with an empty cart, so branching on
  // `items.length` during hydration would swap the whole page on the client.
  if (!cartHydrated) {
    return (
      <div className="container py-10">
        <Skeleton className="h-8 w-48" />
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-40 w-full rounded-lg" />
          </div>
          <Skeleton className="h-72 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container flex flex-col items-center gap-4 py-24 text-center">
        <ShoppingBag className="size-12 text-muted-foreground" />
        <h1 className="font-display text-2xl font-semibold">Your cart is empty</h1>
        <p className="text-muted-foreground">Add a few essentials before checking out.</p>
        <Button onClick={() => navigate("/shop")}>Continue shopping</Button>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <section className="border-b border-border bg-secondary/40">
        <div className="container py-10">
          <span className="eyebrow">Checkout</span>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
            Complete your order
          </h1>
        </div>
      </section>

      <section className="container py-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
          {/* Form */}
          <Reveal>
            <div id="checkout-form" className="space-y-8">
              <FieldGroup title="Contact & delivery">
                {!user && (
                  <div className="mb-5 flex flex-col gap-3 rounded-lg border border-border bg-secondary/30 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-card text-primary">
                        <UserRound className="size-4" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          Have an account? Sign in to check out faster
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          We&apos;ll fill your saved details and keep this order in your
                          history — or continue as a guest below.
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link to="/account/login?from=/checkout">Sign in</Link>
                      </Button>
                      <Button asChild size="sm">
                        <Link to="/account/register?from=/checkout">Create account</Link>
                      </Button>
                    </div>
                  </div>
                )}

                {(addresses ?? []).length > 0 && (
                  <div className="mb-5 rounded-lg border border-border bg-secondary/30 p-4">
                    <Label className="mb-1.5 block text-sm font-medium">
                      Deliver to a saved address
                    </Label>
                    <Select
                      value={savedAddressId ?? undefined}
                      onValueChange={pickAddress}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a saved address…" />
                      </SelectTrigger>
                      <SelectContent>
                        {addresses?.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.label} — {a.street}, {a.city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {savedAddressId
                        ? "Edit any field below and we'll update this address in your account."
                        : "Picking one fills the details below automatically."}
                    </p>
                  </div>
                )}

                {isGhana && branches.length > 0 && (
                  <Field label="Deliver from branch" required className="mb-5">
                    {/* Cards rather than a dropdown: two taps-of-the-thumb
                        targets on a phone, and the address is visible without
                        opening anything. */}
                    <div className="grid gap-2 sm:grid-cols-2">
                      {branches.map((b) => {
                        const active = form.deliveryBranch === b.name;
                        return (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => set({ deliveryBranch: b.name })}
                            aria-pressed={active}
                            className={cn(
                              "flex items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                              active
                                ? "border-primary bg-primary/5 ring-1 ring-primary"
                                : "border-border bg-card hover:border-primary/40",
                            )}
                          >
                            <span
                              className={cn(
                                "mt-0.5 grid size-8 shrink-0 place-items-center rounded-full",
                                active
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-secondary text-primary",
                              )}
                            >
                              <Store className="size-4" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    "truncate text-sm font-semibold",
                                    active ? "text-primary" : "text-foreground",
                                  )}
                                >
                                  {b.name}
                                </span>
                                {active && (
                                  <CheckCircle2 className="size-4 shrink-0 text-primary" />
                                )}
                              </span>
                              <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                                {b.address || b.city}
                              </span>
                              {b.phone && (
                                <span className="mt-1 block text-xs text-muted-foreground">
                                  {b.phone}
                                </span>
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      We dispatch from the branch closest to your address for
                      faster delivery.
                    </p>
                  </Field>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full name" required>
                    <Input
                      value={form.recipientName}
                      onChange={(e) => set({ recipientName: e.target.value })}
                      placeholder="e.g. Ama Owusu"
                    />
                  </Field>
                  <Field label="Phone" required>
                    <Input
                      value={form.phone}
                      onChange={(e) => set({ phone: e.target.value })}
                      placeholder="e.g. 024 000 0000"
                    />
                  </Field>
                  <Field label="Email" required className="sm:col-span-2">
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => set({ email: e.target.value })}
                      placeholder="you@example.com"
                    />
                  </Field>
                  <Field label="Country" required>
                    <Input
                      value={form.country}
                      onChange={(e) => set({ country: e.target.value })}
                      placeholder="Ghana"
                    />
                  </Field>
                  <Field label="Region / State" required>
                    {isGhana ? (
                      <Select
                        value={form.region}
                        onValueChange={(v) => set({ region: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select region" />
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
                        value={form.region}
                        onChange={(e) => set({ region: e.target.value })}
                        placeholder="State / province"
                      />
                    )}
                  </Field>
                  <Field label="City" required>
                    <Input
                      value={form.city}
                      onChange={(e) => set({ city: e.target.value })}
                      placeholder="e.g. Accra"
                    />
                  </Field>
                  <Field label="Street address" required className="sm:col-span-2">
                    <AddressAutocomplete
                      value={form.street}
                      onChange={(v) => set({ street: v })}
                      onSelect={(s) =>
                        set({
                          street: s.street || s.label,
                          city: s.city || form.city,
                          region: s.region || form.region,
                          country: s.country || form.country,
                        })
                      }
                      countryBias={form.country}
                      placeholder="Start typing your address…"
                    />
                  </Field>
                  {isGhana && (
                    <Field label="GhanaPost GPS" className="sm:col-span-2">
                      <Input
                        value={form.digitalAddress}
                        onChange={(e) => set({ digitalAddress: e.target.value })}
                        placeholder="e.g. GA-123-4567"
                      />
                    </Field>
                  )}
                </div>

                {user && (
                  <label className="mt-4 flex items-start gap-2 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={saveAddress}
                      onChange={(e) => setSaveAddress(e.target.checked)}
                      className="mt-0.5 size-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <span>
                      {savedAddressId
                        ? "Keep my saved address in sync with these details."
                        : "Save this address to my account for faster checkout next time."}
                    </span>
                  </label>
                )}
              </FieldGroup>

              <FieldGroup title="Delivery">
                <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                      <Truck className="size-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {quote ? quote.provider : "Fetching courier…"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {quote ? `${quote.service} · ${quote.eta}` : "Estimating delivery"}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {shipping === 0 ? (
                      <span className="text-accent">Free</span>
                    ) : (
                      formatGHS(shipping)
                    )}
                  </p>
                </div>
              </FieldGroup>

              <FieldGroup title="Payment">
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Lock className="size-4 text-accent" />
                    Pay securely through Stanbic Bank Ghana
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {paymentMethods.map((m) => {
                      const active = method === m.value;
                      // The bank hasn't provisioned wallets on this outlet yet:
                      // offering them would send the customer to a card-only page.
                      const disabled = walletsBlocked && m.value !== "card";
                      const hint =
                        disabled
                          ? walletHint
                          : m.value === "card"
                            ? cardHint
                            : m.hint;
                      return (
                        <button
                          key={m.value}
                          type="button"
                          onClick={() => setMethod(m.value)}
                          disabled={disabled}
                          aria-pressed={active}
                          aria-disabled={disabled}
                          className={cn(
                            "flex items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                            disabled && "cursor-not-allowed opacity-50",
                            active
                              ? "border-primary bg-primary/5 ring-1 ring-primary"
                              : "border-border bg-card",
                            !active && !disabled && "hover:border-primary/40",
                          )}
                        >
                          <span
                            className={cn(
                              "grid size-9 shrink-0 place-items-center rounded-full",
                              active
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-primary",
                            )}
                          >
                            <m.icon className="size-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span
                              className={cn(
                                "block truncate text-sm font-semibold",
                                active ? "text-primary" : "text-foreground",
                              )}
                            >
                              {m.label}
                            </span>
                            <span className="block text-xs text-muted-foreground">
                              {hint}
                            </span>
                          </span>
                          {active && (
                            <CheckCircle2 className="size-4 shrink-0 text-primary" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {isMomo && (
                    <div className="mt-4">
                      <Field label="Mobile money number" required>
                        <Input
                          value={momoPhone}
                          onChange={(e) => setMomoPhone(e.target.value)}
                          inputMode="tel"
                          autoComplete="tel"
                          placeholder="e.g. 024 000 0000"
                        />
                      </Field>
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        Use the number registered to the wallet you&apos;ll pay from.
                      </p>
                    </div>
                  )}

                  <p className="mt-4 flex items-start gap-1.5 border-t border-border/70 pt-3 text-xs text-muted-foreground">
                    <Lock className="mt-0.5 size-3.5 shrink-0 text-accent" />
                    {walletsBlocked
                      ? "Card payment works today. Mobile money is being switched on by the bank — we'll show it here the moment it's live."
                      : isMomo
                        ? "Next you'll pick the wallet and approve with your PIN on the bank's secure page — JadeXpress never sees it."
                        : `Next you'll enter your card on the bank's 3D Secure page (${cardHint}).`}
                  </p>
                </div>
              </FieldGroup>
            </div>
          </Reveal>

          {/* Summary */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-lg border border-border bg-card p-5 shadow-soft">
              <h2 className="font-display text-lg font-semibold text-foreground">
                Order summary
              </h2>
              <ul className="mt-4 space-y-3">
                {items.map((i) => (
                  <li key={i.productId} className="flex gap-3">
                    <div className="size-14 shrink-0 overflow-hidden rounded-md border border-border bg-secondary">
                      <img
                        src={i.image}
                        alt={i.name}
                        crossOrigin="anonymous"
                        className="size-full object-cover"
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
                          {i.name}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Qty {i.quantity}
                        </p>
                      </div>
                      <span className="shrink-0 whitespace-nowrap text-sm font-medium text-foreground">
                        {formatGHS(i.price * i.quantity)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              <Separator className="my-4" />
              <Row label="Subtotal" value={formatGHS(subtotal)} />
              <Row
                label={quote ? `Delivery · ${quote.provider}` : "Delivery"}
                value={shipping === 0 ? "Free" : formatGHS(shipping)}
              />
              <Separator className="my-4" />
              <Row label="Total" value={formatGHS(total)} strong />
              <Button
                size="lg"
                className="mt-5 w-full shadow-gold"
                disabled={placing || processing}
                onClick={reviewOrder}
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Confirming payment…
                  </>
                ) : placing ? (
                  "Placing order…"
                ) : (
                  `Review & pay ${formatGHS(total)}`
                )}
              </Button>
              <p className="mt-1.5 text-center text-xs text-muted-foreground">
                {methodLabel} · you can still change everything before paying.
              </p>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Truck className="size-3.5 text-accent" />
                {shipping === 0
                  ? "You've unlocked free delivery"
                  : `Add ${formatGHS(SITE.freeShippingThreshold - subtotal)} for free delivery`}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Blocking progress — the gateway round-trip takes a few seconds and the
          page must never look dead between "Pay" and the bank's page. */}
      {(placing || processing || redirecting) && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-[100] grid place-items-center bg-background/85 p-6 backdrop-blur-sm"
        >
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-soft">
            <div className="flex items-start gap-3">
              <Loader2 className="mt-0.5 size-5 shrink-0 animate-spin text-primary" />
              <div>
                <p className="font-display text-base font-semibold text-foreground">
                  {redirecting
                    ? "Taking you to the bank…"
                    : processing
                      ? "Creating your payment link…"
                      : "Placing your order…"}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  This takes a few seconds.
                </p>
              </div>
            </div>

            <ul className="mt-5 space-y-2.5 text-sm">
              <ProgressStep
                label="Reserving your items"
                done={processing || redirecting}
                active={placing && !processing}
              />
              <ProgressStep
                label="Secure payment link"
                done={redirecting}
                active={processing && !redirecting}
              />
              <ProgressStep
                label="Stanbic Bank payment page"
                done={false}
                active={redirecting}
              />
            </ul>

            <p className="mt-5 border-t border-border/70 pt-3 text-xs text-muted-foreground">
              Please keep this tab open. Nothing is charged until you approve on
              the bank&apos;s page.
            </p>
            {redirecting && paymentUrl && (
              <a
                href={paymentUrl}
                className="mt-3 inline-block text-xs font-medium text-primary hover:underline"
              >
                Open the payment page manually
              </a>
            )}
          </div>
        </div>
      )}

      {/* Review gate — the last chance to catch a wrong phone number or
          address before stock is reserved and the bank page opens. */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">Check your details</DialogTitle>
            <DialogDescription className="text-xs">
              We&apos;ll open Stanbic Bank&apos;s secure page next. Confirm these are
              right so nothing goes to the wrong person or place.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Contact
                </p>
                <button
                  type="button"
                  onClick={editFromReview}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Edit
                </button>
              </div>
              <div className="mt-2 space-y-0.5 rounded-lg border border-border bg-secondary/30 p-3 text-sm">
                <p className="font-medium text-foreground">{form.recipientName}</p>
                <p className="text-muted-foreground">{form.phone}</p>
                <p className="break-all text-muted-foreground">{form.email}</p>
                {user && form.email.trim().toLowerCase() !== (user.email ?? "").toLowerCase() && (
                  <p className="pt-1.5 text-xs text-amber-700 dark:text-amber-400">
                    This is different from your account email ({user.email}). Order
                    updates will go to the address above.
                  </p>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Deliver to
                </p>
                <button
                  type="button"
                  onClick={editFromReview}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Edit
                </button>
              </div>
              <div className="mt-2 space-y-0.5 rounded-lg border border-border bg-secondary/30 p-3 text-sm">
                <p className="font-medium text-foreground">{form.street}</p>
                <p className="text-muted-foreground">
                  {[form.city, form.region, form.country].filter(Boolean).join(", ")}
                </p>
                {form.digitalAddress && (
                  <p className="text-xs text-muted-foreground">
                    GhanaPost {form.digitalAddress}
                  </p>
                )}
                {form.deliveryBranch && (
                  <p className="pt-1 text-xs text-muted-foreground">
                    Dispatched from {form.deliveryBranch}
                  </p>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Payment
                </p>
                <button
                  type="button"
                  onClick={editFromReview}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Edit
                </button>
              </div>
              <div className="mt-2 space-y-0.5 rounded-lg border border-border bg-secondary/30 p-3 text-sm">
                <p className="font-medium text-foreground">{methodLabel}</p>
                {isMomo && <p className="text-muted-foreground">{momoPhone}</p>}
                <p className="text-muted-foreground">
                  {items.reduce((n, i) => n + i.quantity, 0)} item
                  {items.reduce((n, i) => n + i.quantity, 0) === 1 ? "" : "s"} ·{" "}
                  {shipping === 0 ? "free delivery" : `delivery ${formatGHS(shipping)}`} ·{" "}
                  <span className="font-medium text-foreground">{formatGHS(total)}</span>
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-2 gap-2 sm:justify-between">
            <Button type="button" variant="outline" onClick={editFromReview}>
              Edit details
            </Button>
            <Button
              type="button"
              className="shadow-gold"
              onClick={() => {
                setReviewOpen(false);
                void placeOrder();
              }}
            >
              <Lock className="mr-2 size-4" />
              Pay {formatGHS(total)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FieldGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="font-display text-lg font-semibold text-foreground">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
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

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className={strong ? "font-medium text-foreground" : "text-sm text-muted-foreground"}>
        {label}
      </span>
      <span className={strong ? "font-display text-lg font-semibold text-foreground" : "text-sm font-medium text-foreground"}>
        {value}
      </span>
    </div>
  );
}

function ProgressStep({
  label,
  done,
  active,
}: {
  label: string;
  done: boolean;
  active?: boolean;
}) {
  return (
    <li className="flex items-center gap-2.5">
      {done ? (
        <CheckCircle2 className="size-4 shrink-0 text-primary" />
      ) : active ? (
        <Loader2 className="size-4 shrink-0 animate-spin text-accent" />
      ) : (
        <span className="size-4 shrink-0 rounded-full border border-border" />
      )}
      <span
        className={
          done || active ? "text-foreground" : "text-muted-foreground"
        }
      >
        {label}
      </span>
    </li>
  );
}
