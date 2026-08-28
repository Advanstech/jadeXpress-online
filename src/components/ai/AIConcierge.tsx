"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, RotateCcw, Send, Sparkles, X, MessageSquare, ExternalLink } from "lucide-react";
import { Link } from "@/components/Link";
import { useConcierge } from "@/hooks/useConcierge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "What's good for dry skin?",
  "Compare the Vitamin C serum and the hydra cream",
  "How long does delivery to Accra take?",
  "Suggest a daily vitamin routine for energy",
  "How do I track my order?",
  "What payment methods do you accept?",
];

function renderTextWithFormatting(text: string): ReactNode {
  const boldRegex = /\*\*([^*]+)\*\*/g;
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    parts.push(
      <strong key={`b-${match.index}`} className="font-semibold text-foreground">
        {match[1]}
      </strong>,
    );
    lastIndex = boldRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
}

function renderFormattedMessage(text: string): ReactNode {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(renderTextWithFormatting(text.substring(lastIndex, match.index)));
    }
    const label = match[1];
    const href = match[2];
    parts.push(
      <Link
        key={`l-${match.index}`}
        to={href}
        className="font-semibold text-primary underline underline-offset-2 hover:opacity-80 transition-opacity"
      >
        {label}
      </Link>,
    );
    lastIndex = linkRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(renderTextWithFormatting(text.substring(lastIndex)));
  }

  return parts;
}

export function AIConcierge() {
  const { messages, isLoading, error, sendMessage, reset } = useConcierge();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, isLoading, open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || isLoading) return;
    void sendMessage(draft);
    setDraft("");
  };

  const quickAsk = (q: string) => {
    setDraft("");
    void sendMessage(q);
  };

  return (
    <>
      {/* Launcher */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close AI concierge" : "Open AI concierge"}
        className="fixed bottom-5 right-5 z-50 grid size-14 place-items-center rounded-full bg-gradient-to-br from-primary to-primary/85 text-primary-foreground shadow-gold ring-4 ring-background/50 transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-elegant"
      >
        {open ? <X className="size-6" /> : <Sparkles className="size-6" />}
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-24 right-4 z-50 flex h-[min(76vh,620px)] w-[calc(100vw-2rem)] max-w-md flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-elegant sm:right-5"
          >
            {/* Header */}
            <div className="flex items-center gap-3 bg-primary px-4.5 py-3.5 text-primary-foreground">
              <span className="relative grid size-9 place-items-center rounded-full bg-primary-foreground/10">
                <Bot className="size-5" />
                <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-400 ring-2 ring-primary" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-display text-sm font-semibold leading-tight">
                    JadeXpress Concierge
                  </p>
                  <span className="rounded-full bg-accent/25 px-2 py-0.2 text-[9.5px] font-bold text-accent-foreground">
                    Gemini AI
                  </span>
                </div>
                <p className="text-[11.5px] text-primary-foreground/75">
                  Products, wellness guidance &amp; delivery help
                </p>
              </div>
              <button
                onClick={reset}
                aria-label="Start a new conversation"
                title="Reset conversation"
                className="grid size-8 place-items-center rounded-full text-primary-foreground/75 transition-colors hover:bg-primary-foreground/15 hover:text-primary-foreground"
              >
                <RotateCcw className="size-4" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 space-y-3.5 overflow-y-auto px-4 py-4 scroll-smooth"
            >
              {messages.length === 0 && !error ? (
                <div className="flex h-full flex-col justify-between gap-4 py-1">
                  <div className="space-y-2">
                    <p className="text-sm leading-relaxed text-foreground font-medium">
                      Akwaaba! I'm JadeXpress's AI wellness advisor.
                    </p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Ask me about authentic vitamins, dermatologist skincare routines, order tracking, or delivery across Ghana.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                      Suggested Questions:
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {SUGGESTIONS.map((s) => (
                        <button
                          key={s}
                          onClick={() => quickAsk(s)}
                          className="rounded-xl border border-border/80 bg-secondary/50 px-3 py-2 text-left text-xs text-foreground transition-all duration-150 hover:border-primary/40 hover:bg-secondary active:scale-[0.99]"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pharmacist WhatsApp Escalation Pill */}
                  <a
                    href="https://wa.me/233204047814?text=Hello%20JadeXpress%2C%20I%20need%20assistance%20with%20a%20product"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-800 dark:text-emerald-300 transition-colors hover:bg-emerald-500/15"
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare className="size-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Chat with Pharmacist on WhatsApp</span>
                    </div>
                    <ExternalLink className="size-3.5 opacity-70" />
                  </a>
                </div>
              ) : (
                messages.map((m, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex",
                      m.role === "user" ? "justify-end" : "justify-start",
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[88%] rounded-2xl px-4 py-3 text-xs leading-relaxed whitespace-pre-wrap shadow-2xs sm:text-sm",
                        m.role === "user"
                          ? "rounded-br-xs bg-primary text-primary-foreground shadow-soft"
                          : "rounded-bl-xs border border-border/80 bg-secondary/70 text-foreground",
                      )}
                    >
                      {renderFormattedMessage(m.content)}
                      {m.isStreaming && (
                        <span className="ml-1 inline-block h-3.5 w-1.5 animate-pulse bg-primary align-middle" />
                      )}
                    </div>
                  </div>
                ))
              )}
              {error && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {error}
                </p>
              )}
              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-xs border border-border/80 bg-secondary/70 px-4 py-3 text-xs text-muted-foreground">
                    <Sparkles className="size-3.5 text-accent animate-spin" />
                    <span>Gemini AI is analyzing your question…</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={submit}
              className="flex items-center gap-2 border-t border-border bg-background/80 p-3 backdrop-blur-xs"
            >
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ask about vitamins, skincare, delivery…"
                className="bg-card text-xs sm:text-sm"
              />
              <Button
                type="submit"
                size="icon"
                className="size-10 shrink-0 shadow-gold"
                disabled={isLoading || !draft.trim()}
                aria-label="Send message"
              >
                <Send className="size-4" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
