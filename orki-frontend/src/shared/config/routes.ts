export const routes = {
  home: "/",
  login: "/login",
  register: "/register",
  onboarding: "/onboarding",
  dashboard: "/dashboard",
  analytics: "/analytics",
  exams: "/exams",
  examTake: (id: number) => `/exams/${id}/take` as const,
  examResults: (attemptId: number) => `/exams/results/${attemptId}` as const,
  flashcards: "/flashcards",
  profile: "/profile",
  paymentHistory: "/profile/payment-history",
  subscribe: "/subscribe",
  featureDashboardTracking: "/features/dashboard-tracking",
  featureSmartAnalytics: "/features/smart-analytics",
  featureMockExams: "/features/mock-exams",
  featureSmartFlashcards: "/features/smart-flashcards",
  featureStudyProgress: "/features/study-progress",
  // Company
  about: "/about",
  contact: "/contact",
  // Legal
  terms: "/terms",
  privacy: "/privacy",
  refundPolicy: "/refund-policy",
  subscriptionPolicy: "/subscription-policy",
  // Support
  helpCenter: "/help-center",
  faq: "/faq",
  reportProblem: "/report-problem",
  // Exam categories
  examCategoryPmle: "/exam-categories/pmle",
  examCategoryLet: "/exam-categories/let",
  examCategoryCle: "/exam-categories/cle",
  examCategoryCivilService: "/exam-categories/civil-service",
} as const;

export type AppRoute = (typeof routes)[keyof typeof routes];
