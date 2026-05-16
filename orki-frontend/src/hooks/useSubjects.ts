"use client";

import { useQuery } from "@tanstack/react-query";

import type { FirestoreSubject } from "@/entities/exams/types";
import { getSubjectsByExamType } from "@/shared/firebase/firestore";

type UseSubjectsResult = {
  subjects: FirestoreSubject[];
  loading: boolean;
  error: string | null;
};

/**
 * Fetch subjects from Firestore filtered by exam_type.
 * Results are cached by React Query — navigating away from and back to the
 * Exams page will reuse the cached list instead of hitting Firestore again.
 */
export function useSubjects(examType: string | null): UseSubjectsResult {
  const { data, isLoading, error } = useQuery<FirestoreSubject[], Error>({
    queryKey: ["subjects", examType],
    queryFn: () => getSubjectsByExamType(examType!),
    enabled: !!examType,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    throwOnError: false,
  });

  return {
    subjects: data ?? [],
    loading: isLoading,
    error: error ? (error.message || "Failed to load subjects.") : null,
  };
}
