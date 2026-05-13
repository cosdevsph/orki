"use client";

import { useEffect, useState } from "react";

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
 */
export function useExamQuestions(
  examType: string | null,
  subject: string | null,
  limit = 100,
): UseExamQuestionsResult {
  const [questions, setQuestions] = useState<FirestoreQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!examType || !subject) return;
    let cancelled = false;

    setLoading(true);
    setError(null);

    getQuestionsBySubject(examType, subject, limit)
      .then((data) => {
        if (!cancelled) setQuestions(data);
      })
      .catch((err: unknown) => {
        console.error("[useExamQuestions] Firestore error:", err);
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Failed to load questions.",
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [examType, subject, limit]);

  return { questions, loading, error };
}
