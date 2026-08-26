"use client";

import { useCallback, useRef, useState } from "react";

export interface ConciergeMessage {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export function useConcierge() {
  const [messages, setMessages] = useState<ConciergeMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionIdRef = useRef<string>(crypto.randomUUID());

  const sendMessage = useCallback(
    async (content: string) => {
      const text = content.trim();
      if (!text || isLoading) return;
      setMessages((prev) => [
        ...prev,
        { role: "user", content: text },
        { role: "assistant", content: "The concierge is currently unavailable." },
      ]);
      setIsLoading(true);
      setError(null);
      setTimeout(() => setIsLoading(false), 500);
    },
    [isLoading],
  );

  const reset = useCallback(() => {
    sessionIdRef.current = crypto.randomUUID();
    setMessages([]);
    setError(null);
    setIsLoading(false);
  }, []);

  return { messages, isLoading, error, sendMessage, reset };
}
