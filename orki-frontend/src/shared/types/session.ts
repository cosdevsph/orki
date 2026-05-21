/**
 * The server-side session user returned by the backend.
 * uid is the Firebase UID (string) — not a numeric database id.
 */
export type SessionUser = {
  uid: string;
  email: string;
  display_name: string;
  first_name: string;
  last_name: string;
  age: number | null;
  exam_type: string;
  professional_title: string;
  exam_date: string | null;
  onboarding_completed: boolean;
  is_active: boolean;
  /** Firestore-persisted avatar path, e.g. "/avatars/avatar-1.webp" */
  avatar?: string;
};
