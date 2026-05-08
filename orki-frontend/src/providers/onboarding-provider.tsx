"use client";

import { createContext, useCallback, useContext } from "react";

import { useAuthContext } from "@/providers/auth-provider";

interface OnboardingContextValue {
  /** null = auth is still loading or user is unauthenticated */
  onboardingComplete: boolean | null;
  loading: boolean;
  /** Optimistically marks onboarding complete in local auth state. */
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
  const { user, loading: authLoading, setUser } = useAuthContext();

  const onboardingComplete = authLoading
    ? null
    : user
      ? user.onboarding_completed
      : null;

  const markComplete = useCallback(() => {
    if (user) {
      setUser({ ...user, onboarding_completed: true });
    }
  }, [user, setUser]);

  return (
    <OnboardingContext.Provider
      value={{ onboardingComplete, loading: authLoading, markComplete }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

