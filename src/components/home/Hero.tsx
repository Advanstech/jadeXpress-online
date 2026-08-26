"use client";
import { Link } from "@/components/Link";
import { motion } from "framer-motion";
import { ArrowRight, Leaf, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/Reveal";

const HERO_IMAGE =
  "https://cdn.enter.pro/resources/uid_100467878/jadexpress-hero_c6679609.png";

const stats = [
  { value: "4.9★", label: "Rated by shoppers" },
  { value: "GHS", label: "Pricing, settled locally" },
  { value: "GH + Global", label: "Accra & worldwide" },
];

export function Hero() {
  return (
    <section className="relative min-h-[90vh] overflow-hidden bg-primary">
      <img
        src={HERO_IMAGE}
        alt="JadeXpress vitamins, supplements and beauty products"
        crossOrigin="anonymous"
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/85 to-primary/45" />

      <div className="container relative z-10 flex min-h-[90vh] flex-col items-start justify-center py-28 text-primary-foreground">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/90 backdrop-blur">
            <Leaf className="size-4 text-accent" />
            The Vitamin Shop & Beauty Care
          </span>
        </Reveal>
        <Reveal delay={0.08}>
          <h1 className="mt-6 max-w-2xl font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
            Naturally vibrant,
            <br />
            beautifully you.
          </h1>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-primary-foreground/80 sm:text-lg">
            Premium vitamins, supplements and clean beauty — formulated for real
            life and delivered with care across Ghana and worldwide.
          </p>
        </Reveal>
        <Reveal delay={0.24}>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="shadow-gold">
              <Link to="/shop">
                Shop the collection
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Link to="/category/vitamins">Explore by category</Link>
            </Button>
          </div>
        </Reveal>
        <Reveal delay={0.32}>
          <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4">
            {stats.map((s) => (
              <div key={s.label} className="flex items-center gap-2">
                <Star className="size-4 fill-accent text-accent" />
                <span className="font-display text-lg font-semibold">
                  {s.value}
                </span>
                <span className="text-sm text-primary-foreground/70">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-primary-foreground/60 md:block"
      >
        <div className="flex h-9 w-5 items-start justify-center rounded-full border border-primary-foreground/30 p-1">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.6 }}
            className="h-1.5 w-1 rounded-full bg-accent"
          />
        </div>
      </motion.div>
    </section>
  );
}
