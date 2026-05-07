"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { useAuthContext } from "@/providers/auth-provider";
import { isOnboardingComplete } from "@/shared/firebase/onboarding";

interface OnboardingContextValue {
  /** null = not yet determined (loading or unauthenticated) */
  onboardingComplete: boolean | null;
  loading: boolean;
  markComplete: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue>({
  onboardingComplete: null,
  loading: true,
  markComplete: () => {},
});

export function useOnboardingContext(): OnboardingContextValue {
  return useContext(OnboardingContext);
}

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuthContext();
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setOnboardingComplete(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    isOnboardingComplete(user.uid)
      .then((complete) => setOnboardingComplete(complete))
      .catch(() => setOnboardingComplete(false))
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  const markComplete = useCallback(() => setOnboardingComplete(true), []);

  return (
    <OnboardingContext.Provider value={{ onboardingComplete, loading, markComplete }}>
      {children}
    </OnboardingContext.Provider>
  );
}
