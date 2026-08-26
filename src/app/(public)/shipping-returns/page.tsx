"use client";
import { Package, RotateCcw, Truck, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { SITE } from "@/config/site";

const shipping = [
  `Ghana — Accra: 1–2 business days.`,
  `Ghana — other regions: 2–4 business days.`,
  `International: 5–10 business days (subject to customs).`,
  `Free delivery within Ghana on orders over GHS ${SITE.freeShippingThreshold}.`,
  `Standard Ghana delivery is a flat GHS ${SITE.shippingFeeGhana} below the free-shipping threshold.`,
  `International shipping is a flat GHS ${SITE.shippingFeeInternational}.`,
];

const returns = [
  "Unopened items in original packaging may be returned within 14 days of delivery.",
  "To start a return, contact us with your order number and reason.",
  "Refunds are issued to the original payment method within 5–7 business days of us receiving the returned item.",
  "Faulty or incorrect items are replaced at our cost — just reach out.",
];

export default function ShippingReturns() {
  return (
    <div className="bg-background">
      <section className="bg-primary text-primary-foreground">
        <div className="container py-16 md:py-20">
          <span className="eyebrow">Help</span>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Shipping & returns
          </h1>
          <p className="mt-3 max-w-xl text-primary-foreground/80">
            Everything you need to know about delivery times, fees and our
            hassle-free returns.
          </p>
        </div>
      </section>

      <section className="container py-12 md:py-16">
        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
          <Reveal>
            <Card icon={Truck} title="Shipping">
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {shipping.map((s) => (
                  <li key={s} className="flex gap-2">
                    <span className="text-accent">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </Card>
          </Reveal>
          <Reveal delay={0.08}>
            <Card icon={RotateCcw} title="Returns & refunds">
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {returns.map((s) => (
                  <li key={s} className="flex gap-2">
                    <span className="text-accent">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </Card>
          </Reveal>
          <Reveal delay={0.16}>
            <Card icon={Package} title="Packaging">
              <p className="mt-3 text-sm text-muted-foreground">
                Each order is carefully checked and sealed. Supplements and
                cosmetics are packed to protect them in transit, with discreet,
                recyclable packaging wherever possible.
              </p>
            </Card>
          </Reveal>
          <Reveal delay={0.24}>
            <Card icon={ShieldCheck} title="Our promise">
              <p className="mt-3 text-sm text-muted-foreground">
                If anything arrives damaged or isn't as expected, let us know
                within 48 hours and we'll make it right — that's the JadeXpress
                promise.
              </p>
            </Card>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

function Card({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="h-full rounded-lg border border-border bg-card p-6 shadow-soft">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-secondary text-primary">
          <Icon className="size-5" />
        </span>
        <h2 className="font-display text-lg font-semibold text-foreground">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}
