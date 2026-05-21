"use client";

import { useCallback, useEffect, useState } from "react";

import { auth } from "@/shared/firebase/client";
import {
  DEFAULT_PREFERENCES,
  UserPreferences,
  saveUserPreferences,
  subscribeToPreferences,
} from "@/shared/firebase/preferences";

import { useAuth } from "./useAuth";

export function usePreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time Firestore subscription — scoped to the authenticated user
  useEffect(() => {
    const firebaseUser = auth.currentUser;
    if (!user?.uid || !firebaseUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsub = subscribeToPreferences(firebaseUser.uid, (prefs) => {
      setPreferences(prefs);
      setIsLoading(false);
    });

    return () => {
      unsub();
    };
  }, [user?.uid]);

  /**
   * Optimistically update a single preference key then persist to Firestore.
   * Reverts the optimistic update on failure.
   */
  const updatePreference = useCallback(
    async <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return;

      const previous = preferences[key];
      // Optimistic update
      setPreferences((prev) => ({ ...prev, [key]: value }));
      setError(null);

      try {
        await saveUserPreferences(firebaseUser.uid, { [key]: value });
      } catch (err) {
        // Revert on failure
        setPreferences((prev) => ({ ...prev, [key]: previous }));
        setError("Failed to save preference. Please try again.");
        console.error("[usePreferences] update failed:", err);
      }
    },
    [preferences]
  );

  return { preferences, isLoading, error, updatePreference };
}
