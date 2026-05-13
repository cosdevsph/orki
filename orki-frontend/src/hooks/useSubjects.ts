"use client";

import { useEffect, useState } from "react";

import type { FirestoreSubject } from "@/entities/exams/types";
import { getSubjectsByExamType } from "@/shared/firebase/firestore";

type UseSubjectsResult = {
  subjects: FirestoreSubject[];
  loading: boolean;
  error: string | null;
};

/**
 * Fetch subjects from Firestore filtered by exam_type.
 * Returns an empty array while loading or on error.
 */
export function useSubjects(examType: string | null): UseSubjectsResult {
  const [subjects, setSubjects] = useState<FirestoreSubject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!examType) return;
    let cancelled = false;

    setLoading(true);
    setError(null);

    getSubjectsByExamType(examType)
      .then((data) => {
        if (!cancelled) setSubjects(data);
      })
      .catch((err: unknown) => {
        console.error("[useSubjects] Firestore error:", err);
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Failed to load subjects.",
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [examType]);

  return { subjects, loading, error };
}
