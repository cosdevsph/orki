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
} as const;

export type AppRoute = (typeof routes)[keyof typeof routes];
