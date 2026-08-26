"use client";
import { useState } from "react";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Reveal } from "@/components/motion/Reveal";
import { ContactMap } from "@/components/ContactMap";
import { SITE } from "@/config/site";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error("Please complete the form.");
      return;
    }
    setSending(true);
    toast.info("Contact form is not connected to the API yet.");
    setSending(false);
  };

  const channels = [
    { icon: Phone, label: "Call us", value: SITE.phone, href: `tel:${SITE.phone}` },
    { icon: MessageCircle, label: "WhatsApp", value: SITE.whatsapp, href: `https://wa.me/${SITE.whatsapp.replace(/[^0-9]/g, "")}` },
    { icon: Mail, label: "Email", value: SITE.email, href: `mailto:${SITE.email}` },
    { icon: MapPin, label: "Visit", value: `${SITE.addressLine}, ${SITE.region}` },
  ];

  return (
    <div className="bg-background">
      <section className="bg-primary text-primary-foreground">
        <div className="container py-16 md:py-20">
          <span className="eyebrow">Contact</span>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            We'd love to help
          </h1>
          <p className="mt-3 max-w-xl text-primary-foreground/80">
            Questions about a product, an order or a return? Our team is here for
            you, every day.
          </p>
        </div>
      </section>

      <section className="container py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
          <Reveal>
            <div className="grid gap-4 sm:grid-cols-2">
              {channels.map((c) => (
                <a
                  key={c.label}
                  href={c.href}
                  className="flex items-start gap-3 rounded-lg border border-border bg-card p-5 shadow-soft transition-colors hover:border-primary/40"
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-secondary text-primary">
                    <c.icon className="size-5" />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      {c.label}
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-foreground">
                      {c.value}
                    </p>
                  </div>
                </a>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
              <Clock className="size-4 text-accent" />
              Mon–Sat, 8am–8pm GMT.
            </div>

            <div className="mt-6">
              <h2 className="font-display text-lg font-semibold text-foreground">
                Find us
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {SITE.addressLine}, {SITE.region}
              </p>
              <div className="mt-3">
                <ContactMap />
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <form
              onSubmit={submit}
              className="rounded-lg border border-border bg-card p-6 shadow-soft"
            >
              <h2 className="font-display text-xl font-semibold text-foreground">
                Send us a message
              </h2>
              <div className="mt-4 space-y-4">
                <div>
                  <Label className="mb-1.5 block text-sm font-medium">Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <Label className="mb-1.5 block text-sm font-medium">Email</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <Label className="mb-1.5 block text-sm font-medium">Message</Label>
                  <Textarea
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full shadow-gold" disabled={sending}>
                  {sending ? "Sending…" : "Send message"}
                </Button>
              </div>
            </form>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
