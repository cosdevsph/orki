/**
 * The server-side session user returned by the backend.
 * This replaces the Firebase `User` type across the frontend.
 */
export type SessionUser = {
  id: number;
  email: string;
  display_name: string;
  first_name: string;
  last_name: string;
  age: number | null;
  exam_type: string;
  onboarding_completed: boolean;
};
