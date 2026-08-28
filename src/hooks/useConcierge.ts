"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

export interface ConciergeMessage {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

const STORAGE_KEY = "jadexpress_concierge_history_v1";

function getStoredMessages(): ConciergeMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredMessages(messages: ConciergeMessage[]) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    // Ignore quota issues
  }
}

export function useConcierge() {
  const [messages, setMessages] = useState<ConciergeMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionIdRef = useRef<string>("");

  useEffect(() => {
    const initial = getStoredMessages();
    if (initial.length > 0) {
      setMessages(initial);
    }
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      const text = content.trim();
      if (!text || isLoading) return;

      const userMsg: ConciergeMessage = { role: "user", content: text };
      const nextMessages = [...messages, userMsg];
      setMessages(nextMessages);
      saveStoredMessages(nextMessages);

      setIsLoading(true);
      setError(null);

      try {
        const historyPayload = nextMessages
          .slice(-6)
          .map((m) => ({ role: m.role, content: m.content }));

        const res = await api.post<{ reply: string; source?: string }>("ai/concierge", {
          message: text,
          history: historyPayload,
        });

        const replyText =
          res?.reply ||
          "I'm here to assist you with our authentic wellness supplements and skincare essentials. How can I help?";

        // Progressive stream typing effect for a responsive conversational feel
        const assistantMsgIndex = nextMessages.length;
        let currentIdx = 0;
        const step = Math.max(1, Math.floor(replyText.length / 30));

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "", isStreaming: true },
        ]);

        const streamInterval = setInterval(() => {
          currentIdx += step;
          if (currentIdx >= replyText.length) {
            clearInterval(streamInterval);
            const finalMessages: ConciergeMessage[] = [
              ...nextMessages,
              { role: "assistant", content: replyText, isStreaming: false },
            ];
            setMessages(finalMessages);
            saveStoredMessages(finalMessages);
            setIsLoading(false);
          } else {
            const partial = replyText.slice(0, currentIdx);
            setMessages((prev) => {
              const updated = [...prev];
              if (updated[assistantMsgIndex]) {
                updated[assistantMsgIndex] = {
                  role: "assistant",
                  content: partial,
                  isStreaming: true,
                };
              }
              return updated;
            });
          }
        }, 15);
      } catch (err: any) {
        console.warn("[Concierge API Error]", err?.message);
        const fallbackAnswer =
          "We offer 100% authentic vitamins, skincare, and supplements with 2–6hr express delivery in Accra and next-day shipping across Ghana. You can also chat directly with our licensed pharmacist on WhatsApp at +233 20 404 7814.";

        const finalMessages: ConciergeMessage[] = [
          ...nextMessages,
          { role: "assistant", content: fallbackAnswer, isStreaming: false },
        ];
        setMessages(finalMessages);
        saveStoredMessages(finalMessages);
        setIsLoading(false);
      }
    },
    [isLoading, messages],
  );

  const reset = useCallback(() => {
    sessionIdRef.current = crypto.randomUUID();
    setMessages([]);
    setError(null);
    setIsLoading(false);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return { messages, isLoading, error, sendMessage, reset };
}
