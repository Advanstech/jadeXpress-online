"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Reveal } from "@/components/motion/Reveal";
import { ContactMap } from "@/components/ContactMap";
import { SITE } from "@/config/site";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface MessageSample {
  id: string;
  label: string;
  emoji: string;
  subject: string;
  template: string;
}

const MESSAGE_SAMPLES: MessageSample[] = [
  {
    id: "delivery",
    label: "Order & Delivery Status",
    emoji: "📦",
    subject: "Order Tracking & Delivery Status Inquiry",
    template:
      "Hi JadeXpress team,\n\nI would like to check on the delivery status of my order #[OrderNumber]. Could you please confirm the current location and estimated delivery time to [e.g. East Legon, Accra / Kumasi]?\n\nThank you!",
  },
  {
    id: "vitamin",
    label: "Vitamin & Supplement Guidance",
    emoji: "💊",
    subject: "Product Advice & Daily Routine Recommendation",
    template:
      "Hello JadeXpress Pharmacist,\n\nI am looking for guidance on the best vitamins/supplements to support [e.g. daily energy / immune health / sleep & recovery]. Could you recommend the right combination and dosage for my needs?\n\nThank you!",
  },
  {
    id: "skincare",
    label: "Skincare Recommendation",
    emoji: "✨",
    subject: "Skincare Routine & Formulation Recommendation",
    template:
      "Hi there,\n\nI am looking for product recommendations for [e.g. dry skin / dark spots & hyperpigmentation / barrier repair]. Could you suggest the best cleansers, serums, and sunscreens from your catalog?\n\nThanks!",
  },
  {
    id: "availability",
    label: "Stock & Brand Sourcing",
    emoji: "🔍",
    subject: "Product Availability & Special Request",
    template:
      "Hello,\n\nI am inquiring whether you have [Product Name / Brand] currently in stock in Accra. If not, can I place a special pre-order for your upcoming shipment?\n\nBest regards,",
  },
  {
    id: "returns",
    label: "Exchange & Order Issue",
    emoji: "🔄",
    subject: "Order Issue & Replacement Request",
    template:
      "Hello JadeXpress Support,\n\nI recently received my order #[OrderNumber], but [e.g. received wrong item / seal was compromised / package was damaged]. Please let me know how to proceed with a replacement or refund.\n\nThank you,",
  },
  {
    id: "wholesale",
    label: "Bulk & Corporate Supply",
    emoji: "💼",
    subject: "Bulk Order & Wholesale Pricing Inquiry",
    template:
      "Hi JadeXpress Sales Team,\n\nI am interested in placing a bulk order of vitamins and wellness products for our company/clinic. Please share your wholesale price catalog and dispatch terms.\n\nBest regards,",
  },
];

export default function Contact() {
  const { user, profile } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showSamples, setShowSamples] = useState(true);
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (user && !name) {
      setName(profile?.full_name || "");
      setEmail(user.email || "");
      if (profile?.phone) setPhone(profile.phone);
    }
  }, [user, profile, name]);

  const handleSelectSample = (sample: MessageSample) => {
    setSelectedTemplate(sample.id);
    setSubject(sample.subject);
    setMessage(sample.template);
    toast.info(`Loaded sample: "${sample.label}"`);
  };

  const handleCustomConcern = () => {
    setSelectedTemplate("custom");
    if (MESSAGE_SAMPLES.some((s) => s.template === message)) {
      setMessage("");
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in your name, email, and message.");
      return;
    }
    setSending(true);
    try {
      await api.post("storefront/contact", {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        subject: subject.trim() || "General Inquiry",
        message: message.trim(),
      });
      setSubmitted(true);
      toast.success("Thank you! Your message has been received.");
      setMessage("");
      setSubject("");
      setSelectedTemplate(null);
    } catch (err: unknown) {
      toast.error(
        (err as Error)?.message || "Failed to send message. Please try again.",
      );
    } finally {
      setSending(false);
    }
  };

  const channels = [
    {
      icon: Phone,
      label: "Call us",
      value: SITE.phone,
      href: `tel:${SITE.phone}`,
    },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: SITE.whatsapp,
      href: `https://wa.me/${SITE.whatsapp.replace(/[^0-9]/g, "")}`,
    },
    {
      icon: Mail,
      label: "Email",
      value: SITE.email,
      href: `mailto:${SITE.email}`,
    },
    {
      icon: MapPin,
      label: "Visit",
      value: `${SITE.addressLine}, ${SITE.region}`,
    },
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
            Questions about a product, an order or a return? Our team is here
            for you, every day.
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
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              {submitted ? (
                <div className="space-y-4 py-8 text-center">
                  <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-600 animate-in zoom-in-50 duration-300 dark:bg-emerald-950/50 dark:text-emerald-400">
                    <CheckCircle2 className="size-8" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-foreground">
                    Message Sent!
                  </h3>
                  <p className="mx-auto max-w-md text-sm text-muted-foreground">
                    Thank you for reaching out to JadeXpress. Our customer
                    support team has received your message and will reply to{" "}
                    <span className="font-medium text-foreground">{email}</span>{" "}
                    shortly.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setSubmitted(false)}
                    className="mt-2"
                  >
                    Send another message
                  </Button>
                </div>
              ) : (
                <form onSubmit={submit}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-display text-xl font-semibold text-foreground">
                        Send us a message
                      </h2>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Select a purpose sample below or write your own concern.
                      </p>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                      <Sparkles className="size-3.5 text-accent" /> Prompt reply
                    </span>
                  </div>

                  <div className="mt-4 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label className="mb-1.5 block text-sm font-medium">
                          Name *
                        </Label>
                        <Input
                          placeholder="Your full name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label className="mb-1.5 block text-sm font-medium">
                          Email *
                        </Label>
                        <Input
                          type="email"
                          placeholder="your.email@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label className="mb-1.5 block text-sm font-medium">
                          Phone (optional)
                        </Label>
                        <Input
                          placeholder="+233 XX XXX XXXX"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="mb-1.5 block text-sm font-medium">
                          Subject
                        </Label>
                        <Input
                          placeholder="Order inquiry, stock question, etc."
                          value={subject}
                          onChange={(e) => {
                            setSubject(e.target.value);
                            setSelectedTemplate("custom");
                          }}
                        />
                      </div>
                    </div>

                    {/* Interactive Message Samples & Purpose Selector */}
                    <div className="space-y-2.5 rounded-xl border border-border/80 bg-secondary/35 p-3.5">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                          <Sparkles className="size-3.5 text-accent" />
                          Select purpose / message sample:
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowSamples((v) => !v)}
                          className="text-[11px] font-medium text-primary hover:underline"
                        >
                          {showSamples ? "Hide samples" : "Show samples"}
                        </button>
                      </div>

                      {showSamples && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {MESSAGE_SAMPLES.map((sample) => {
                            const isSelected = selectedTemplate === sample.id;
                            return (
                              <button
                                key={sample.id}
                                type="button"
                                onClick={() => handleSelectSample(sample)}
                                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-150 active:scale-95 ${
                                  isSelected
                                    ? "bg-primary text-primary-foreground shadow-xs ring-2 ring-primary/20"
                                    : "border border-border/80 bg-background text-foreground hover:border-primary/40 hover:bg-secondary"
                                }`}
                              >
                                <span>{sample.emoji}</span>
                                <span>{sample.label}</span>
                              </button>
                            );
                          })}

                          <button
                            type="button"
                            onClick={handleCustomConcern}
                            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-150 active:scale-95 ${
                              selectedTemplate === "custom"
                                ? "bg-accent font-semibold text-accent-foreground"
                                : "border border-border/80 bg-background text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <span>✍️</span>
                            <span>Custom Concern</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="mb-1.5 flex items-center justify-between">
                        <Label className="block text-sm font-medium">
                          Message *
                        </Label>
                        {selectedTemplate && selectedTemplate !== "custom" && (
                          <span className="text-[11px] text-muted-foreground">
                            💡 You can edit and customize the details below
                          </span>
                        )}
                      </div>
                      <Textarea
                        rows={6}
                        placeholder="How can we help you today? Select a purpose sample above or type your own concern freely..."
                        value={message}
                        onFocus={() => setShowSamples(true)}
                        onChange={(e) => {
                          setMessage(e.target.value);
                          setSelectedTemplate("custom");
                        }}
                        required
                        className="text-xs leading-relaxed sm:text-sm"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full gap-2 shadow-gold"
                      disabled={sending}
                    >
                      <Send className="size-4" />
                      {sending ? "Sending message…" : "Send message"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
