export type DashboardSummary = {
  activeStreakDays: number;
  dueFlashcards: number;
  upcomingExams: number;
  weeklyStudyHours: number;
  overallReadiness: number;
  recentActivity: RecentActivity[];
  subjectMasteries: import("@/entities/analytics/types").SubjectMasteryItem[];
};

export type RecentActivity = {
  type: "exam_completed" | "flashcard_reviewed" | "deck_completed";
  title: string;
  subtitle: string;
  timestamp: string;
  icon: "exam" | "flashcard" | "deck";
};
