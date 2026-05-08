import type { SessionUser } from "@/shared/types/session";
import { http } from "@/shared/api/http";

export type SessionResponse = {
  user: SessionUser;
  onboarding_complete: boolean;
};

/**
 * Exchange a Firebase ID token for a backend server session.
 * The backend verifies the token with Firebase Admin SDK and sets an
 * HttpOnly session cookie.  No auth data is stored in the browser.
 */
export function loginWithBackend(idToken: string): Promise<SessionResponse> {
  return http<SessionResponse>("auth/login/", {
    method: "POST",
    body: { id_token: idToken },
  });
}

/** Flush the server session (cookie cleared by Set-Cookie header). */
export function logoutFromBackend(): Promise<void> {
  return http<void>("auth/logout/", { method: "POST" });
}

/**
 * Validate the current session and return the authenticated user.
 * Returns 401 (ApiError) if no valid session exists.
 */
export function getSession(): Promise<SessionResponse> {
  return http<SessionResponse>("auth/session/");
}

/**
 * Save the onboarding profile to the backend and mark onboarding complete.
 */
export function saveOnboarding(data: {
  first_name: string;
  last_name: string;
  age: number;
  exam_type: string;
}): Promise<{ detail: string; user: SessionUser }> {
  return http("users/onboarding/", {
    method: "POST",
    body: data,
  });
}
