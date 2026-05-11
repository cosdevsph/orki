"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useNotification } from "@/providers/notification-provider";
import { saveOnboarding } from "@/shared/api/auth";
import { routes } from "@/shared/config/routes";
import type { ExamType, PersonalInfo } from "@/entities/onboarding/types";
import { PersonalInfoCard } from "@/widgets/onboarding/personal-info-card";
import { ExamSelectionCard } from "@/widgets/onboarding/exam-selection-card";

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-border border-t-primary" />
    </div>
  );
}

export function OnboardingShell() {
  const router = useRouter();
  const { user, loading: authLoading, setUser } = useAuth();
  const { onboardingComplete, loading: onboardingLoading, markComplete } = useOnboarding();
  const { notify } = useNotification();

  const [step, setStep] = useState<1 | 2>(1);
  const [visible, setVisible] = useState(true);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Auth + onboarding guard
  useEffect(() => {
    if (authLoading || onboardingLoading) return;
    if (!user) {
      router.replace(routes.login);
      return;
    }
    if (onboardingComplete === true) {
      router.replace(routes.dashboard);
    }
  }, [user, authLoading, onboardingComplete, onboardingLoading, router]);

  // Cross-fade transition between steps
  const transitionTo = (nextStep: 1 | 2) => {
    setVisible(false);
    setTimeout(() => {
      setStep(nextStep);
      setVisible(true);
    }, 260);
  };

  const handlePersonalInfoContinue = (data: PersonalInfo) => {
    setPersonalInfo(data);
    transitionTo(2);
  };

  const handleBack = () => transitionTo(1);

  const handleExamSelect = async (examType: ExamType, examDate: string | null) => {
    if (!user || !personalInfo) return;
    setIsSaving(true);
    try {
      const result = await saveOnboarding({
        first_name: personalInfo.firstName,
        last_name: personalInfo.lastName,
        age: personalInfo.age,
        exam_type: examType,
        exam_date: examDate,
      });
      // Sync full user (including exam_type + professional_title) into auth state
      setUser(result.user);
      markComplete();
      notify("Welcome to Orki — your study journey begins now.", "success");
      router.replace(routes.dashboard);
    } catch {
      notify("Something went wrong. Please try again.", "error");
      setIsSaving(false);
    }
  };

  if (authLoading || onboardingLoading) return <LoadingScreen />;
  if (!user || onboardingComplete === true) return null;

  return (
    <div className="ambient-bg min-h-screen flex flex-col">
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-10 pt-8">
        <div className="flex items-center gap-2.5">
          <Image
            src="/Logo/OrkiLogo.svg"
            alt="Orki"
            width={28}
            height={28}
            priority
            className="select-none"
          />
          <span className="font-heading font-bold text-lg text-foreground tracking-tight">
            Orki
          </span>
        </div>

        {/* Step pills */}
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-medium text-muted tabular-nums">
            {step === 1 ? "Step 1 of 2" : "Step 2 of 2"}
          </span>
          <div className="flex items-center gap-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${
                step === 1 ? "w-7 bg-primary" : "w-3 bg-primary/30"
              }`}
            />
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${
                step === 2 ? "w-7 bg-primary" : "w-3 bg-border"
              }`}
            />
          </div>
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-135 flex flex-col gap-6">
          {/* Mascot greeting — visible on step 1 only */}
          <div
            className={`flex items-center gap-4 transition-all duration-300 ${
              step === 1 && visible
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-2 pointer-events-none"
            }`}
          >
            <Image
              src="/mascott/OrkiLogoFront.webp"
              alt="Orki mascot"
              width={60}
              height={60}
              className="select-none animate-float-slow"
            />
            <div>
              <p className="font-heading text-xl font-bold text-foreground leading-tight">
                Welcome to Orki!
              </p>
              <p className="text-sm text-muted mt-0.5">
                Let&apos;s set up your profile in under a minute.
              </p>
            </div>
          </div>

          {/* ── Floating glass card ─────────────────────────────── */}
          <div
            className={`glass-strong rounded-3xl px-8 py-9 transition-all duration-260 ease-in-out ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            }`}
          >
            {step === 1 ? (
              <PersonalInfoCard onContinue={handlePersonalInfoContinue} />
            ) : (
              <ExamSelectionCard
                onSelect={handleExamSelect}
                isLoading={isSaving}
                onBack={handleBack}
              />
            )}
          </div>

          {/* Fine print */}
          <p className="text-center text-xs text-muted/60">
            Your information is stored securely and never shared.
          </p>
        </div>
      </main>
    </div>
  );
}
