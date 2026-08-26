"use client";

import { useQuery } from "@tanstack/react-query";

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

/** Placeholder until the storefront AI endpoint is public. */
export function useProductInsights(productId: string | undefined) {
  return useQuery<ProductInsights>({
    queryKey: ["product-insights", productId],
    enabled: !!productId,
    queryFn: async () => ({
      who_for: "",
      best_time: "",
      pairs_with: "",
      tip: "",
    }),
    staleTime: 1000 * 60 * 30,
  });
}

/** Placeholder until the AI order explanation endpoint is public. */
export async function explainOrder(
  _orderNumber: string,
  _email: string,
): Promise<OrderExplanation> {
  return { summary: "", next_steps: [] };
}

/** Placeholder until the quiz recommendation endpoint is public. */
export async function recommendByQuiz(_answers: QuizAnswers): Promise<QuizResult> {
  return { summary: "", recommendations: [] };
}
