"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { useAuth } from "@/hooks/useAuth";
import { useOnboarding } from "@/hooks/useOnboarding";
import { routes } from "@/shared/config/routes";
import { AppShell } from "@/widgets/app-shell/app-shell";

function AuthLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-border border-t-primary" />
    </div>
  );
}

export function ProtectedLayout({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { onboardingComplete, loading: onboardingLoading } = useOnboarding();
  const router = useRouter();

  const loading = authLoading || onboardingLoading;

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(routes.login);
      return;
    }
    if (onboardingComplete === false) {
      router.replace(routes.onboarding);
    }
  }, [user, loading, onboardingComplete, router]);

  if (loading) return <AuthLoadingScreen />;
  if (!user) return null;
  if (onboardingComplete === false) return null;

  return <AppShell>{children}</AppShell>;
}
