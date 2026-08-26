"use client";

import { Link } from "@/components/Link";
import { Reveal } from "@/components/motion/Reveal";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    q: "How do I place an order?",
    a: "Browse the shop, add products to your cart, then head to checkout. Enter your delivery details and complete payment by card or Mobile Money. You'll get an order number to track your delivery anytime.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "We accept cards and Mobile Money (MTN MoMo, Vodafone Cash and AirtelTigo) via Paystack, settled in Ghana Cedis (GHS). International cards are also welcome.",
  },
  {
    q: "How long does delivery take?",
    a: "Orders within Accra are typically delivered within 1–2 business days, and 2–4 business days elsewhere in Ghana. International orders take 5–10 business days depending on destination.",
  },
  {
    q: "Do you offer free delivery?",
    a: `Yes — orders within Ghana over GHS 500 ship free. Standard Ghana delivery is a flat GHS 35 below that threshold. International shipping is calculated at checkout.`,
  },
  {
    q: "Can I return a product?",
    a: "Absolutely. Unopened items in their original packaging can be returned within 14 days for a full refund. See our Shipping & Returns page for details.",
  },
  {
    q: "Are your products authentic?",
    a: "Every product is genuine, sealed and stored correctly. Supplements are third-party tested, and our cosmetics are never tested on animals.",
  },
  {
    q: "Do I need an account to order?",
    a: "No — you can check out as a guest. Creating an account, however, gives you faster checkout, saved addresses, a wishlist and full order history.",
  },
  {
    q: "How do I track my order?",
    a: "Use your order number and the email used at checkout on our Track Order page to see live status updates from placement to delivery.",
  },
];

export default function Faq() {
  return (
    <div className="bg-background">
      <section className="bg-primary text-primary-foreground">
        <div className="container py-16 md:py-20">
          <span className="eyebrow">Help</span>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Frequently asked questions
          </h1>
          <p className="mt-3 max-w-xl text-primary-foreground/80">
            Quick answers to the things shoppers ask most. Can't find what you
            need? We're a message away.
          </p>
        </div>
      </section>

      <section className="container py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((f, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="rounded-lg border border-border bg-card px-5 shadow-soft"
                >
                  <AccordionTrigger className="text-left font-display text-base font-semibold text-foreground hover:no-underline">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>

          <div className="mt-10 flex flex-col items-center gap-3 rounded-lg border border-border bg-secondary/40 p-8 text-center">
            <p className="font-display text-lg font-semibold text-foreground">
              Still have questions?
            </p>
            <Button asChild className="shadow-gold">
              <Link to="/contact">Contact our team</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
