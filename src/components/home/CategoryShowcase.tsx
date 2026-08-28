"use client";
import { Link } from "@/components/Link";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/types";
import { Reveal, StaggerGroup, staggerItem } from "@/components/motion/Reveal";
import { motion } from "framer-motion";

interface CategoryShowcaseProps {
  categories: Category[];
}

export function CategoryShowcase({ categories }: CategoryShowcaseProps) {
  return (
    <section className="bg-background py-20 md:py-28">
      <div className="container">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Shop by category</span>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Everything your routine needs
          </h2>
          <p className="mt-4 text-muted-foreground">
            Explore our curated wellness collections, each crafted with the highest standards — from
            daily vitamins and immune support to targeted therapeutics and clean beauty.
          </p>
        </Reveal>

        <StaggerGroup className="mt-12 grid gap-6 md:grid-cols-3">
          {categories.map((cat) => (
            <motion.div key={cat.id} variants={staggerItem}>
              <Link
                to={`/category/${cat.slug}`}
                className="group relative block overflow-hidden rounded-lg border border-border bg-card shadow-soft transition-all duration-300 hover:shadow-elegant"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      crossOrigin="anonymous"
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="size-full bg-secondary/50" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
                      Collection
                    </span>
                    <h3 className="mt-1 font-display text-2xl font-semibold text-primary-foreground">
                      {cat.name}
                    </h3>
                    <p className="mt-1 text-sm text-primary-foreground/80">
                      {cat.tagline}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4">
                  <span className="text-sm font-medium text-foreground">
                    Browse {cat.name.toLowerCase()}
                  </span>
                  <span className="grid size-8 place-items-center rounded-full bg-secondary text-primary transition-all group-hover:bg-primary group-hover:text-primary-foreground">
                    <ArrowRight className="size-4" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
