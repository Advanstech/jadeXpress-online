"use client";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { useBrands } from "@/hooks/useBrands";
import { PARTNER_BRANDS } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * Editorial "partner brands" marquee shown directly beneath the hero.
 * It pulls distinct brands from the live catalogue and merges them with the
 * curated list in site config. Scrolls infinitely, pauses on hover, and fades
 * out at the edges.
 */
export function BrandMarquee() {
  const { data: dbBrands } = useBrands();

  const brands = useMemo(() => {
    const merged = [...(dbBrands ?? []), ...PARTNER_BRANDS];
    const unique = [...new Set(merged.map((b) => b.trim()).filter(Boolean))];
    // Keep the strip balanced — at least 8 wordmarks.
    while (unique.length < 8) unique.push(PARTNER_BRANDS[unique.length % PARTNER_BRANDS.length]);
    return unique;
  }, [dbBrands]);

  // Deterministic, subtle style variation so the strip feels like real logos.
  const Row = () => (
    <div className="flex shrink-0 items-center gap-10 pr-10 sm:gap-16 sm:pr-16">
      {brands.map((b, i) => (
        <span
          key={`${b}-${i}`}
          className="group flex items-center gap-3 whitespace-nowrap"
        >
          <span
            className={cn(
              "grid size-7 place-items-center rounded-full border transition-colors duration-300",
              i % 3 === 0
                ? "border-accent/40 bg-accent/10 text-accent"
                : "border-primary/20 bg-primary/5 text-primary",
              "group-hover:border-accent group-hover:bg-accent group-hover:text-accent-foreground",
            )}
          >
            <Sparkles className="size-3.5" />
          </span>
          <span
            className={cn(
              "font-display text-xl font-semibold uppercase tracking-[0.14em] text-foreground/70 transition-colors duration-300 group-hover:text-foreground sm:text-2xl",
              i % 2 === 0 && "font-normal tracking-[0.22em]",
            )}
          >
            {b}
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <section className="relative overflow-hidden border-y border-border bg-card">
      {/* soft gold glow behind the strip */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 h-40 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,hsl(var(--accent)/0.10),transparent_70%)]"
      />

      <div className="container py-14 md:py-20">
        <Reveal>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="eyebrow">Trusted &amp; true</span>
              <h2 className="mt-3 max-w-md font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                The brands behind the shelf
              </h2>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Curated for Ghana, sourced from trusted wellness houses — every
              product sealed, genuine and delivered with care.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="group relative mt-10 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
            <div className="flex w-max animate-marquee items-center [animation-play-state:running] group-hover:[animation-play-state:paused]">
              <Row />
              <Row />
            </div>
          </div>

          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="gold-rule mx-auto mt-10"
          />
          <p className="mt-4 text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
            New partners added every season
          </p>
        </Reveal>
      </div>
    </section>
  );
}
