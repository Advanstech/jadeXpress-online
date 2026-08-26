"use client";
import { Link } from "@/components/Link";
import {
  ArrowRight,
  Leaf,
  MonitorSmartphone,
  ShieldCheck,
  Sprout,
  Store,
  Truck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/Reveal";
import { FounderSpotlight } from "@/components/about/FounderSpotlight";

const values = [
  {
    icon: Sprout,
    title: "Nature first",
    text: "Botanically-inspired formulas and unrefined Ghanaian shea, chosen for real results.",
  },
  {
    icon: ShieldCheck,
    title: "Uncompromising quality",
    text: "Genuine, sealed supplements and clean-beauty standards — never tested on animals.",
  },
  {
    icon: Users,
    title: "People over profit",
    text: "Fair pricing in cedis, honest advice, and a team that genuinely cares.",
  },
  {
    icon: Leaf,
    title: "Care for the planet",
    text: "Thoughtful packaging and mindful sourcing, every step of the way.",
  },
];

const services = [
  {
    icon: Store,
    title: "Retail & delivery",
    text: "Vitamins, supplements and beauty care — in person and delivered across Ghana and worldwide.",
  },
  {
    icon: MonitorSmartphone,
    title: "JadeXpress POS",
    text: "Our own point-of-sale platform powers the shops and keeps the business running smoothly.",
  },
  {
    icon: Truck,
    title: "Reliable fulfilment",
    text: "Partnered couriers — Speedaf Express at home, DHL Express worldwide — so orders arrive on time.",
  },
];

export default function About() {
  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="bg-primary text-primary-foreground">
        <div className="container py-16 md:py-24">
          <Reveal className="max-w-2xl">
            <span className="eyebrow">Our story</span>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
              JadeXpress Enterprise — wellness with heart
            </h1>
            <p className="mt-4 text-primary-foreground/80">
              Founded in Accra, JadeXpress is The Vitamin Shop &amp; Beauty Care
              — a retail and delivery business, backed by our own point-of-sale
              platform, bringing trusted vitamins, supplements and cosmetics to
              homes across Ghana and worldwide.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="shadow-gold">
                <Link to="/shop">
                  Shop the collection
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <Link to="/contact">Talk to us</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* The enterprise */}
      <section className="bg-background py-20 md:py-24">
        <div className="container grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <span className="eyebrow">From shop to doorstep</span>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              More than a shop — a growing enterprise
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              JadeXpress began as a neighbourhood vitamin counter and beauty
              care shop in Accra. Today the enterprise pairs that same
              personal care with modern systems — our own point-of-sale
              platform, online ordering and trusted courier partners — so the
              wellness you rely on is always within reach.
            </p>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Every order is handled with care, priced fairly in cedis, and
              delivered by couriers we trust: Speedaf Express across Ghana and
              DHL Express around the world.
            </p>
          </Reveal>

          <div className="grid gap-4">
            {services.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.08}>
                <div className="flex gap-4 rounded-lg border border-border bg-card p-5 shadow-soft transition-colors hover:border-primary/40">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                    <s.icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-foreground">
                      {s.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Founder */}
      <FounderSpotlight />

      {/* Values */}
      <section className="bg-background py-20 md:py-28">
        <div className="container">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">What we stand for</span>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Our values
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.08}>
                <div className="h-full rounded-lg border border-border bg-card p-6 shadow-soft">
                  <span className="grid size-11 place-items-center rounded-xl bg-secondary text-primary">
                    <v.icon className="size-5" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                    {v.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">{v.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16 text-center text-primary-foreground">
        <div className="container">
          <Reveal>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Ready to feel your best?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-primary-foreground/80">
              Explore vitamins, supplements and clean beauty — delivered with
              care.
            </p>
            <Button asChild className="mt-6 shadow-gold">
              <Link to="/shop">Start shopping</Link>
            </Button>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
