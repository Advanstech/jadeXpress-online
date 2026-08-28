"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface ProductInsights {
  who_for: string;
  best_time: string;
  pairs_with: string;
  tip: string;
}

export interface OrderExplanation {
  summary: string;
  next_steps: string[];
}

export interface QuizRecommendation {
  slug: string;
  reason: string;
}

export interface QuizResult {
  summary: string;
  recommendations: QuizRecommendation[];
}

export interface QuizAnswers {
  goal?: string;
  skin?: string;
  form?: string;
  budget?: string;
  avoid?: string[];
}

export function useProductInsights(productId: string | undefined) {
  return useQuery<ProductInsights>({
    queryKey: ["product-insights", productId],
    enabled: !!productId,
    queryFn: async () => {
      if (!productId) {
        return { who_for: "", best_time: "", pairs_with: "", tip: "" };
      }
      return api.get<ProductInsights>(`storefront/ai/product-insights/${productId}`);
    },
    staleTime: 1000 * 60 * 30, // 30 mins
  });
}

export async function explainOrder(
  orderNumber: string,
  email?: string,
): Promise<OrderExplanation> {
  return api.post<OrderExplanation>("storefront/ai/explain-order", { orderNumber, email });
}

export async function recommendByQuiz(answers: QuizAnswers): Promise<QuizResult> {
  return api.post<QuizResult>("storefront/ai/quiz-recommendations", answers);
}
