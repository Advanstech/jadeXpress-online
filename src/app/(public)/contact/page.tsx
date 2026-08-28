"use client";
import { useState, useEffect } from "react";
import { CheckCircle2, Clock, Mail, MapPin, MessageCircle, Phone, Send, Sparkles } from "lucide-react";
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

export default function Contact() {
  const { user, profile } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (user && !name) {
      setName(profile?.full_name || "");
      setEmail(user.email || "");
      if (profile?.phone) setPhone(profile.phone);
    }
  }, [user, profile, name]);

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
    } catch (err: unknown) {
      toast.error((err as Error)?.message || "Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
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
            <div className="rounded-lg border border-border bg-card p-6 shadow-soft">
              {submitted ? (
                <div className="py-8 text-center space-y-4">
                  <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 animate-in zoom-in-50 duration-300">
                    <CheckCircle2 className="size-8" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-foreground">
                    Message Sent!
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Thank you for reaching out to JadeXpress. Our customer support team has received your message and will reply to <span className="font-medium text-foreground">{email}</span> shortly.
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
                    <h2 className="font-display text-xl font-semibold text-foreground">
                      Send us a message
                    </h2>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Sparkles className="size-3.5 text-accent" /> Prompt reply
                    </span>
                  </div>
                  <div className="mt-4 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label className="mb-1.5 block text-sm font-medium">Name *</Label>
                        <Input
                          placeholder="Your full name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label className="mb-1.5 block text-sm font-medium">Email *</Label>
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
                        <Label className="mb-1.5 block text-sm font-medium">Phone (optional)</Label>
                        <Input
                          placeholder="+233 XX XXX XXXX"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="mb-1.5 block text-sm font-medium">Subject</Label>
                        <Input
                          placeholder="Order inquiry, stock question, etc."
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="mb-1.5 block text-sm font-medium">Message *</Label>
                      <Textarea
                        rows={5}
                        placeholder="How can we help you today?"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full shadow-gold gap-2" disabled={sending}>
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
