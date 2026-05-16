"use client";

import { useQuery } from "@tanstack/react-query";

import type { FirestoreQuestion } from "@/entities/exams/types";
import { getQuestionsBySubject } from "@/shared/firebase/firestore";

type UseExamQuestionsResult = {
  questions: FirestoreQuestion[];
  loading: boolean;
  error: string | null;
};

/**
 * Fetch exam questions from Firestore filtered by exam_type and subject.
 * Fetches up to `limit` questions (default 100).
 *
 * Results are cached by React Query — if the user navigates back to the same
 * exam they started, questions are served from cache instantly.
 */
export function useExamQuestions(
  examType: string | null,
  subject: string | null,
  limit = 100,
): UseExamQuestionsResult {
  const { data, isLoading, error } = useQuery<FirestoreQuestion[], Error>({
    queryKey: ["exam-questions", examType, subject, limit],
    queryFn: () => getQuestionsBySubject(examType!, subject!, limit),
    enabled: !!examType && !!subject,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    throwOnError: false,
  });

  return {
    questions: data ?? [],
    loading: isLoading,
    error: error ? (error.message || "Failed to load questions.") : null,
  };
}
