import type { AnalyticsOverview, DailyStreakData, SubjectMasteryItem, TopicAccuracyItem } from "@/entities/analytics/types";
import type { DashboardSummary } from "@/entities/dashboard/types";
import type { ExamAttempt, ExamResult, MockExam, MockExamDetail } from "@/entities/exams/types";
import type { Flashcard, SubjectDeck } from "@/entities/flashcards/types";
import { http } from "@/shared/api/http";

// ─── Dashboard ────────────────────────────────────────────────────────────────
export function getDashboardSummary() {
  return http<DashboardSummary>("dashboard/");
}

// ─── Analytics ────────────────────────────────────────────────────────────────
export function getAnalyticsOverview() {
  return http<AnalyticsOverview>("analytics/");
}

export function getSubjectMasteries(examType?: string) {
  const params = examType ? `?exam_type=${examType}` : "";
  return http<SubjectMasteryItem[]>(`analytics/mastery/${params}`);
}

export function getWeakTopics(examType?: string) {
  const params = examType ? `?exam_type=${examType}` : "";
  return http<{ weakTopics: TopicAccuracyItem[]; count: number }>(`analytics/weak-topics/${params}`);
}

export function getDailyStreak() {
  return http<DailyStreakData>("analytics/streak/");
}

// ─── Flashcards ───────────────────────────────────────────────────────────────
export function getFlashcards(dueOnly?: boolean, deckId?: number) {
  const params = new URLSearchParams();
  if (dueOnly) params.set("due", "true");
  if (deckId) params.set("deck_id", String(deckId));
  const query = params.toString();
  return http<Flashcard[]>(`flashcards/${query ? `?${query}` : ""}`);
}

export function getSubjectDecks() {
  return http<SubjectDeck[]>("flashcards/subject-decks/");
}

export function reviewFlashcard(cardId: string, quality: number) {
  return http<Flashcard>(`flashcards/${cardId}/review/`, {
    method: "POST",
    body: { quality },
  });
}

export function bulkCreateFlashcards(deckName: string, cards: { front: string; back: string }[]) {
  return http<{ detail: string; deck_id: number; count: number }>("flashcards/bulk-create/", {
    method: "POST",
    body: { deck_name: deckName, cards },
  });
}

// ─── Mock Exams ───────────────────────────────────────────────────────────────
export function getMockExamCatalog(filters?: { category?: string; difficulty?: string; subject?: string }) {
  const params = new URLSearchParams();
  if (filters?.category) params.set("category", filters.category);
  if (filters?.difficulty) params.set("difficulty", filters.difficulty);
  if (filters?.subject) params.set("subject", filters.subject);
  const query = params.toString();
  return http<MockExam[]>(`exams/catalog/${query ? `?${query}` : ""}`);
}

export function getMockExamDetail(examId: number) {
  return http<MockExamDetail>(`exams/catalog/${examId}/`);
}

export function startExamAttempt(examId: number) {
  return http<ExamAttempt>(`exams/catalog/${examId}/start/`, { method: "POST" });
}

export function saveExamAnswer(attemptId: number, questionId: number, selectedAnswer: string, isMarked: boolean) {
  return http(`exams/attempts/${attemptId}/answer/`, {
    method: "POST",
    body: { question: questionId, selected_answer: selectedAnswer, is_marked: isMarked },
  });
}

export function submitExamAttempt(attemptId: number, timeSpentSeconds: number) {
  return http<ExamAttempt>(`exams/attempts/${attemptId}/submit/`, {
    method: "POST",
    body: { time_spent_seconds: timeSpentSeconds },
  });
}

export function getExamResults(attemptId: number) {
  return http<ExamResult>(`exams/attempts/${attemptId}/results/`);
}

// ─── Legacy (kept for compatibility) ──────────────────────────────────────────
export function getExams() {
  return http<import("@/entities/exams/types").Exam[]>("exams/");
}
