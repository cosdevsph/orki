export type AnalyticsPoint = {
  label: string;
  score: number;
};

export type SubjectMasteryItem = {
  subject: string;
  exam_type: string;
  mastery_percentage: number;
  total_questions_attempted: number;
  total_questions_correct: number;
  weak_topics: string[];
  strong_topics: string[];
  last_updated: string;
};

export type DailyStreakData = {
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  updated_at: string | null;
};

export type TopicAccuracyItem = {
  subject: string;
  topic: string;
  correct_count: number;
  total_count: number;
  accuracy_percentage: number;
  is_weak: boolean;
  is_strong: boolean;
  last_updated: string;
};

export type AnalyticsOverview = {
  averageScore: number;
  masteryLevel: "low" | "medium" | "high";
  trend: AnalyticsPoint[];
  subjectMasteries: SubjectMasteryItem[];
  streak: DailyStreakData;
};
