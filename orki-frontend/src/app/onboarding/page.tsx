import type { Metadata } from "next";

import { OnboardingShell } from "@/widgets/onboarding/onboarding-shell";

export const metadata: Metadata = {
  title: "Setup — Orki",
  description: "Complete your profile to get started.",
};

export default function OnboardingPage() {
  return <OnboardingShell />;
}
