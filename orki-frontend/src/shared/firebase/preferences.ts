import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import type { DocumentSnapshot } from "@firebase/firestore";

import { db } from "./client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserPreferences = {
  daily_study_reminders: boolean;
  /** "HH:MM" in 24-hour format, e.g. "20:00" */
  preferred_study_time: string;
  streak_protection: boolean;
  streak_risk_notifications: boolean;
  show_mastery_progress: boolean;
  exam_countdown_alerts: boolean;
};

export const DEFAULT_PREFERENCES: UserPreferences = {
  daily_study_reminders: false,
  preferred_study_time: "20:00",
  streak_protection: false,
  streak_risk_notifications: false,
  show_mastery_progress: false,
  exam_countdown_alerts: false,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Firestore document ref: users/{uid}  (preferences stored as a map field) */
const userDocRef = (uid: string) => doc(db, "users", uid);

/**
 * Persist a partial preferences update to Firestore.
 * Merges into the existing document so no fields are accidentally cleared.
 */
export async function saveUserPreferences(
  uid: string,
  patch: Partial<UserPreferences>
): Promise<void> {
  await setDoc(
    userDocRef(uid),
    { preferences: { ...patch, updated_at: serverTimestamp() } },
    { merge: true }
  );
}

/**
 * Save the FCM push token for this user so the backend can send
 * targeted notifications.
 */
export async function saveFCMToken(uid: string, token: string): Promise<void> {
  await setDoc(userDocRef(uid), { fcm_token: token }, { merge: true });
}

/**
 * Subscribe to real-time preferences updates.
 * Fires immediately with the current value, then on every change.
 * Returns an unsubscribe function.
 */
export function subscribeToPreferences(
  uid: string,
  callback: (prefs: UserPreferences) => void
): () => void {
  return onSnapshot(userDocRef(uid), (snap: DocumentSnapshot) => {
    if (!snap.exists()) {
      callback(DEFAULT_PREFERENCES);
      return;
    }
    const data = snap.data();
    callback({ ...DEFAULT_PREFERENCES, ...(data?.preferences ?? {}) });
  });
}
