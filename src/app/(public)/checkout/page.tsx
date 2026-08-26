"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "@/hooks/useNavigate";
import {
  CreditCard,
  Landmark,
  Loader2,
  Lock,
  ShoppingBag,
  Smartphone,
  Truck,
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
import { Reveal } from "@/components/motion/Reveal";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import { api } from "@/lib/api";
import { type ApiOrder } from "@/hooks/useOrders";
import { getCourierQuote, type CourierQuote } from "@/lib/couriers";
import { formatGHS } from "@/lib/format";
import { PAYMENT_MODE, SITE, GHANA_REGIONS } from "@/config/site";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type PaymentMethod =
  | "mtn_momo"
  | "vodafone_cash"
  | "airteltigo"
  | "card"
  | "gtbank";

const paymentMethods: { value: PaymentMethod; label: string; icon: typeof Smartphone }[] = [
  { value: "mtn_momo", label: "MTN MoMo", icon: Smartphone },
  { value: "vodafone_cash", label: "Vodafone Cash", icon: Smartphone },
  { value: "airteltigo", label: "AirtelTigo", icon: Smartphone },
  { value: "card", label: "Debit / Credit card", icon: CreditCard },
  { value: "gtbank", label: "GT Bank", icon: Landmark },
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
}

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { data: addresses } = useAddresses();
  const { insert: saveAddressRow } = useAddressMutations();

  const [form, setForm] = useState<FormState>({
    recipientName: "",
    phone: "",
    email: "",
    country: "Ghana",
    region: "Greater Accra",
    city: "",
    street: "",
    digitalAddress: "",
  });
  const [placing, setPlacing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [saveAddress, setSaveAddress] = useState(true);

  const [quote, setQuote] = useState<CourierQuote | null>(null);

  // Payment
  const [method, setMethod] = useState<PaymentMethod>("mtn_momo");
  const [momoPhone, setMomoPhone] = useState("");
  const [momoPin, setMomoPin] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [gtAccount, setGtAccount] = useState("");

  const defaultAddr = addresses?.find((a) => a.isDefault) ?? addresses?.[0];

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        email: f.email || user.email || "",
        recipientName: f.recipientName || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    if (defaultAddr) {
      setForm((f) => ({
        ...f,
        recipientName: f.recipientName || defaultAddr.recipientName,
        phone: f.phone || defaultAddr.phone,
        country: f.country || defaultAddr.country,
        region: f.region || defaultAddr.region,
        city: f.city || defaultAddr.city,
        street: f.street || defaultAddr.street,
        digitalAddress: f.digitalAddress || defaultAddr.digitalAddress || "",
      }));
    }
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
    if (method === "mtn_momo" || method === "vodafone_cash" || method === "airteltigo") {
      if (!momoPhone.trim() || momoPin.length !== 4) {
        toast.error("Enter the mobile money phone and 4-digit PIN.");
        return false;
      }
    }
    if (method === "card") {
      if (cardNumber.replace(/\s/g, "").length < 12 || !cardExpiry || cardCvv.length < 3) {
        toast.error("Please enter complete card details.");
        return false;
      }
    }
    if (method === "gtbank" && !gtAccount.trim()) {
      toast.error("Enter your GT Bank account or email.");
      return false;
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
        courier: quote
          ? {
              provider: quote.provider,
              service: quote.service,
              eta: quote.eta,
              trackingNumber: quote.trackingNumber,
            }
          : null,
      };

      // Sync the confirmed address back to the customer's profile.
      if (user && saveAddress) {
        const alreadySaved = (addresses ?? []).some(
          (a) =>
            a.street.trim().toLowerCase() === shippingAddress.street.toLowerCase() &&
            a.city.trim().toLowerCase() === shippingAddress.city.toLowerCase() &&
            a.region.trim().toLowerCase() === shippingAddress.region.toLowerCase(),
        );
        if (!alreadySaved) {
          try {
            await saveAddressRow({
              label: "Delivery",
              recipientName: shippingAddress.recipientName,
              phone: shippingAddress.phone,
              country: shippingAddress.country,
              region: shippingAddress.region,
              city: shippingAddress.city,
              street: shippingAddress.street,
              digitalAddress: shippingAddress.digitalAddress,
              isDefault: (addresses?.length ?? 0) === 0,
            });
          } catch {
            /* non-blocking — the order must still go through */
          }
        }
      }

      const paymentGateway =
        method === "card" || method === "gtbank" ? "paystack" : "momo";

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
      const { orderNumber } = order;

      sessionStorage.setItem(
        "jadexpress_last_order",
        JSON.stringify({ orderNumber, email: shippingAddress.email }),
      );

      // Simulate the payment gateway handshake.
      setProcessing(true);
      await new Promise((r) => setTimeout(r, 1800));
      clearCart();
      navigate(`/checkout/success/${orderNumber}`);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setPlacing(false);
      setProcessing(false);
    }
  };

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
            <div className="space-y-8">
              <FieldGroup title="Contact & delivery">
                {(addresses ?? []).length > 0 && (
                  <div className="mb-5 rounded-lg border border-border bg-secondary/30 p-4">
                    <Label className="mb-1.5 block text-sm font-medium">
                      Deliver to a saved address
                    </Label>
                    <Select onValueChange={pickAddress}>
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
                      Picking one fills the details below automatically.
                    </p>
                  </div>
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
                      Save this address to my account for faster checkout next
                      time.
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
                    Secured by Advansis Technologies (GT Bank)
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Mobile Money, debit and credit cards.
                    {PAYMENT_MODE === "mock-advansis" &&
                      " Demo gateway — no real charge is made."}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {paymentMethods.map((m) => (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => setMethod(m.value)}
                        className={cn(
                          "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-xs font-medium transition-colors",
                          method === m.value
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-secondary/40 text-foreground hover:border-primary/40",
                        )}
                      >
                        <m.icon className="size-4 shrink-0" />
                        {m.label}
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 space-y-3">
                    {(method === "mtn_momo" ||
                      method === "vodafone_cash" ||
                      method === "airteltigo") && (
                      <>
                        <Field label="Mobile money number" required>
                          <Input
                            value={momoPhone}
                            onChange={(e) => setMomoPhone(e.target.value)}
                            placeholder="e.g. 024 000 0000"
                          />
                        </Field>
                        <Field label="4-digit PIN (demo)" required>
                          <Input
                            type="password"
                            inputMode="numeric"
                            maxLength={4}
                            value={momoPin}
                            onChange={(e) =>
                              setMomoPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                            }
                            placeholder="••••"
                          />
                        </Field>
                      </>
                    )}
                    {method === "card" && (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Card number (demo)" required className="sm:col-span-2">
                          <Input
                            inputMode="numeric"
                            value={cardNumber}
                            onChange={(e) =>
                              setCardNumber(
                                e.target.value
                                  .replace(/\D/g, "")
                                  .slice(0, 16)
                                  .replace(/(\d{4})(?=\d)/g, "$1 "),
                              )
                            }
                            placeholder="4242 4242 4242 4242"
                          />
                        </Field>
                        <Field label="Expiry" required>
                          <Input
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="MM/YY"
                          />
                        </Field>
                        <Field label="CVV" required>
                          <Input
                            type="password"
                            inputMode="numeric"
                            maxLength={4}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                            placeholder="•••"
                          />
                        </Field>
                      </div>
                    )}
                    {method === "gtbank" && (
                      <Field label="GT Bank account / email (demo)" required>
                        <Input
                          value={gtAccount}
                          onChange={(e) => setGtAccount(e.target.value)}
                          placeholder="Account number or email"
                        />
                      </Field>
                    )}
                  </div>
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
                    <div className="flex flex-1 justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {i.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Qty {i.quantity}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-foreground">
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
                onClick={placeOrder}
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Confirming payment…
                  </>
                ) : placing ? (
                  "Placing order…"
                ) : (
                  `Pay ${formatGHS(total)} · ${paymentMethods.find((m) => m.value === method)?.label ?? "Secure"}`
                )}
              </Button>
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
