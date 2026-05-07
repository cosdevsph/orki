"use client";

import { useOnboardingContext } from "@/providers/onboarding-provider";

export function useOnboarding() {
  return useOnboardingContext();
}
