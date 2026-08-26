"use client";
import { Quote } from "lucide-react";
import { Reveal, StaggerGroup, staggerItem } from "@/components/motion/Reveal";
import { InitialsAvatar } from "@/components/InitialsAvatar";
import { StarRating } from "@/components/product/StarRating";
import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Ama Owusu",
    role: "Verified buyer, Accra",
    rating: 5,
    quote:
      "Ordering was effortless and my vitamins arrived the next day. The Vitamin C has become a daily ritual — my skin has never looked better.",
  },
  {
    name: "Kwame Mensah",
    role: "Verified buyer, Kumasi",
    rating: 5,
    quote:
      "Finally a Ghanaian shop I can trust online. Clean products, fair prices in cedis, and the WhatsApp support was so helpful.",
  },
  {
    name: "Akua Nyamekye",
    role: "Verified buyer, Tema",
    rating: 5,
    quote:
      "The whipped shea body butter is the real deal — proper Ghanaian shea, beautifully packaged. I have already restocked twice.",
  },
];

export function Testimonials() {
  return (
    <section className="bg-background py-20 md:py-28">
      <div className="container">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Loved by shoppers</span>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Care you can feel
          </h2>
        </Reveal>

        <StaggerGroup className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <motion.figure
              key={t.name}
              variants={staggerItem}
              className="flex flex-col gap-5 rounded-lg border border-border bg-card p-6 shadow-soft"
            >
              <Quote className="size-8 text-accent" />
              <StarRating rating={t.rating} showCount={false} />
              <blockquote className="flex-1 text-sm leading-relaxed text-foreground/90">
                "{t.quote}"
              </blockquote>
              <figcaption className="flex items-center gap-3 border-t border-border pt-4">
                <InitialsAvatar name={t.name} className="size-10 text-sm" />
                <div>
                  <p className="font-display text-sm font-semibold text-foreground">
                    {t.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
