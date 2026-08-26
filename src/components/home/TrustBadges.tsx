"use client";
import { Headset, Lock, RotateCcw, Truck } from "lucide-react";
import { Reveal, StaggerGroup, staggerItem } from "@/components/motion/Reveal";
import { motion } from "framer-motion";
import { SITE } from "@/config/site";

const badges = [
  {
    icon: Truck,
    title: "Nationwide delivery",
    text: `Free in Ghana over GHS ${SITE.freeShippingThreshold}. Worldwide shipping too.`,
  },
  {
    icon: Lock,
    title: "Secure checkout",
    text: "Pay with card or Mobile Money via Paystack, protected end to end.",
  },
  {
    icon: RotateCcw,
    title: "Easy returns",
    text: "Changed your mind? Return unopened items within 14 days.",
  },
  {
    icon: Headset,
    title: "Friendly support",
    text: "Real people who care — reach us by phone, WhatsApp or email.",
  },
];

export function TrustBadges() {
  return (
    <section className="border-y border-border bg-secondary/60 py-14">
      <div className="container">
        <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {badges.map((b) => (
            <motion.div
              key={b.title}
              variants={staggerItem}
              className="flex items-start gap-4"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-background text-primary shadow-soft">
                <b.icon className="size-5" />
              </span>
              <div>
                <h3 className="font-display text-base font-semibold text-foreground">
                  {b.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{b.text}</p>
              </div>
            </motion.div>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
