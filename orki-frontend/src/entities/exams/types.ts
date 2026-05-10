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
