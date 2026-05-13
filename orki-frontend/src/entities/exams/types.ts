// ─── Firestore Types ──────────────────────────────────────────────────────────

/**
 * A document from the `subjects` Firestore collection.
 * Written by import_to_firestore.py with fields: exam_type, name, slug.
 */
export type FirestoreSubject = {
  /** Firestore document ID, formatted as "{EXAM_TYPE}_{slug}" e.g. "LEPT_english" */
  id: string;
  exam_type: string;
  /** Human-readable subject name, e.g. "English", "Verbal Ability" */
  name: string;
  /** URL-safe slug, e.g. "english", "verbal-ability" */
  slug: string;
};

/**
 * A document from the `questions` Firestore collection.
 * Written by import_to_firestore.py.
 */
export type FirestoreQuestion = {
  /** Firestore document ID == source_id, e.g. "ENG-001" */
  id: string;
  exam_type: string;
  subject: string;
  topic: string;
  difficulty: string;
  question: string;
  choices: { A: string; B: string; C?: string; D?: string };
  correct_answer: "A" | "B" | "C" | "D";
  explanation: string;
  tags: string[];
  source_id: string;
  source_file: string;
};

/** Shape written to `exam_attempts` on exam submission. */
export type FirestoreExamAttemptInput = {
  exam_type: string;
  subject: string;
  score: number;
  total_correct: number;
  total_questions: number;
  time_spent_seconds: number;
  answers: Record<string, "A" | "B" | "C" | "D">;
};

// ─── Exam Session (Persistence) ───────────────────────────────────────────────

export type ExamSessionStatus = "active" | "paused" | "completed";

/** Document shape in `exam_sessions/{sessionId}`. */
export type FirestoreExamSession = {
  id: string;
  user_id: string;
  exam_type: string;
  subject: string;
  answers: Record<string, "A" | "B" | "C" | "D">;
  correct: number;
  wrong: number;
  current_index: number;
  elapsed_time: number;
  status: ExamSessionStatus;
};

/** Input shape for creating/updating an exam session. */
export type FirestoreExamSessionInput = Omit<FirestoreExamSession, "id">;

// ─── Analytics ────────────────────────────────────────────────────────────────

/** Input shape written to `analytics/{autoId}` on exam completion. */
export type FirestoreAnalyticsInput = {
  exam_type: string;
  subject: string;
  score: number;
  correct: number;
  wrong: number;
  total: number;
  percentage: number;
  time_taken: number;
};

// ─── Legacy / Django REST Types ───────────────────────────────────────────────

export type ExamStatus = "scheduled" | "in_progress" | "completed";

export type Exam = {
  id: string;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  status: ExamStatus;
};

export type MockExam = {
  id: number;
  title: string;
  description: string;
  category: string;
  category_display: string;
  subject: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  difficulty_display: string;
  question_count: number;
  duration_minutes: number;
  last_score: number | null;
};

export type MockExamQuestion = {
  id: number;
  question_text: string;
  question_type: "multiple_choice" | "true_false";
  category: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  order: number;
};

export type MockExamQuestionWithAnswer = MockExamQuestion & {
  correct_answer: string;
  explanation: string;
  user_answer: string;
  is_correct: boolean;
  is_marked: boolean;
};

export type MockExamDetail = {
  id: number;
  title: string;
  description: string;
  category: string;
  category_display: string;
  subject: string;
  difficulty: string;
  question_count: number;
  duration_minutes: number;
  questions: MockExamQuestion[];
};

export type ExamAttempt = {
  id: number;
  mock_exam: number;
  mock_exam_title: string;
  status: "in_progress" | "completed" | "abandoned";
  score: number | null;
  total_correct: number;
  total_questions: number;
  time_spent_seconds: number;
  started_at: string;
  completed_at: string | null;
};

export type ExamResult = {
  attempt: ExamAttempt & { mock_exam_category: string };
  questions: MockExamQuestionWithAnswer[];
  categories: CategoryPerformance[];
  percentile: number;
  incorrect_count: number;
};

export type CategoryPerformance = {
  name: string;
  score: number;
  correct: number;
  total: number;
};
