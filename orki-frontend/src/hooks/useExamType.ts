"use client";

import { useAuth } from "@/hooks/useAuth";
import {
  getProfessionalTitle,
  getExamFullName,
  getSubjectsByExam,
  getFlashcardDecksByExam,
  getCategoryTabsByExam,
} from "@/shared/utils/exam-type";

/**
 * Convenience hook that reads the authenticated user's exam_type
 * and exposes all derived personalisation data for the current session.
 */
export function useExamType() {
  const { user } = useAuth();
  const examType = user?.exam_type ?? null;

  return {
    examType,
    professionalTitle: getProfessionalTitle(examType),
    examFullName: getExamFullName(examType),
    subjects: getSubjectsByExam(examType),
    flashcardDecks: getFlashcardDecksByExam(examType),
    categoryTabs: getCategoryTabsByExam(examType),
  };
}
