export const routes = {
  home: "/",
  login: "/login",
  register: "/register",
  onboarding: "/onboarding",
  dashboard: "/dashboard",
  analytics: "/analytics",
  exams: "/exams",
  flashcards: "/flashcards",
  profile: "/profile",
} as const;

export type AppRoute = (typeof routes)[keyof typeof routes];
