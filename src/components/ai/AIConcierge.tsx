"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, RotateCcw, Send, Sparkles, X } from "lucide-react";
import { useConcierge } from "@/hooks/useConcierge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "What's good for dry skin?",
  "Compare the Vitamin C serum and the hydra cream",
  "How long does delivery to Accra take?",
  "Suggest a daily vitamin routine for energy",
];

export function AIConcierge() {
  const { messages, isLoading, error, sendMessage, reset } = useConcierge();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open]);

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
        className="fixed bottom-5 right-5 z-50 grid size-14 place-items-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-gold ring-4 ring-background/40 transition-transform hover:scale-105 active:scale-95"
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
            className="fixed bottom-24 right-4 z-50 flex h-[min(70vh,560px)] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-elegant sm:right-5"
          >
            {/* Header */}
            <div className="flex items-center gap-3 bg-primary px-4 py-3.5 text-primary-foreground">
              <span className="grid size-9 place-items-center rounded-full bg-primary-foreground/10">
                <Bot className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-semibold leading-tight">
                  JadeXpress Concierge
                </p>
                <p className="text-xs text-primary-foreground/70">
                  Products, orders &amp; delivery help
                </p>
              </div>
              <button
                onClick={reset}
                aria-label="Start a new conversation"
                className="grid size-8 place-items-center rounded-full text-primary-foreground/70 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <RotateCcw className="size-4" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
            >
              {messages.length === 0 && !error ? (
                <div className="flex h-full flex-col justify-center gap-3">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Hi — I'm JadeXpress's AI concierge. Ask me about our
                    products, get recommendations, or check on an order.
                  </p>
                  <div className="flex flex-col gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => quickAsk(s)}
                        className="rounded-full border border-border bg-secondary/60 px-3 py-2 text-left text-xs text-foreground transition-colors hover:border-accent/60 hover:bg-secondary"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
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
                        "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                        m.role === "user"
                          ? "rounded-br-md bg-primary text-primary-foreground"
                          : "rounded-bl-md border border-border bg-secondary text-foreground",
                      )}
                    >
                      {m.content}
                      {m.isStreaming && (
                        <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-current align-middle" />
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
                  <div className="rounded-2xl rounded-bl-md border border-border bg-secondary px-3.5 py-2.5 text-sm text-muted-foreground">
                    Thinking…
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={submit}
              className="flex items-center gap-2 border-t border-border bg-background/60 p-3"
            >
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ask about products, orders…"
                className="bg-card"
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
