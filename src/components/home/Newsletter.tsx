"use client";

import { useState, type FormEvent } from "react";
import { Link } from "@/components/Link";
import { Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Reveal } from "@/components/motion/Reveal";
import { toast } from "sonner";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setDone(true);
    toast.success("You're on the list! Watch your inbox for wellness tips.");
    setEmail("");
  };

  return (
    <section className="bg-primary py-16 md:py-20">
      <div className="container">
        <Reveal className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center text-primary-foreground">
          <span className="grid size-12 place-items-center rounded-xl bg-primary-foreground/10 text-accent">
            <Mail className="size-6" />
          </span>
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Wellness, to your inbox
            </h2>
            <p className="mt-3 text-primary-foreground/80">
              Join the JadeXpress list for expert tips, new arrivals and
              subscriber-only offers — no spam, ever.
            </p>
          </div>

          {done ? (
            <p className="rounded-full bg-primary-foreground/10 px-5 py-2 text-sm font-medium text-primary-foreground">
              You're subscribed — thank you!
            </p>
          ) : (
            <form
              onSubmit={submit}
              className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
            >
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/50 focus-visible:ring-accent"
              />
              <Button type="submit" className="shrink-0 shadow-gold">
                Subscribe
                <Send className="ml-2 size-4" />
              </Button>
            </form>
          )}

          <p className="text-xs text-primary-foreground/60">
            By subscribing you agree to our{" "}
            <Link to="/faq" className="underline hover:text-primary-foreground">
              terms
            </Link>
            .
          </p>
        </Reveal>
      </div>
    </section>
  );
}
