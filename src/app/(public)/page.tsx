"use client";
import { Link } from "@/components/Link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Hero } from "@/components/home/Hero";
import { BrandMarquee } from "@/components/home/BrandMarquee";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { BrandStory } from "@/components/home/BrandStory";
import { TrustBadges } from "@/components/home/TrustBadges";
import { Testimonials } from "@/components/home/Testimonials";
import { Newsletter } from "@/components/home/Newsletter";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/Reveal";
import { useCategories } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data: categories, isLoading } = useCategories();

  return (
    <>
      <Hero />
      <BrandMarquee />
      <TrustBadges />
      {isLoading || !categories ? (
        <section className="bg-background py-20 md:py-28">
          <div className="container grid gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] w-full rounded-lg" />
            ))}
          </div>
        </section>
      ) : (
        <CategoryShowcase categories={categories} />
      )}
      <FeaturedProducts />
      <BrandStory />

      {/* Wellness quiz CTA */}
      <section className="bg-primary py-14 text-primary-foreground">
        <div className="container">
          <Reveal className="flex flex-col items-center gap-5 text-center md:flex-row md:justify-between md:text-left">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em]">
                <Sparkles className="size-3.5 text-accent" />
                AI wellness quiz
              </span>
              <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                Not sure where to start?
              </h2>
              <p className="mt-2 max-w-lg text-primary-foreground/80">
                Answer a few quick questions and our AI will recommend
                products tailored to your goals — straight from the catalogue.
              </p>
            </div>
            <Button asChild size="lg" className="shrink-0 shadow-gold">
              <Link to="/quiz">
                Take the 1-minute quiz
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </Reveal>
        </div>
      </section>

      <Testimonials />
      <Newsletter />
    </>
  );
}
