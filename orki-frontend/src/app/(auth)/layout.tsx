"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { useAuth } from "@/hooks/useAuth";
import { routes } from "@/shared/config/routes";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace(routes.dashboard);
    }
  }, [user, loading, router]);

  // Render nothing while resolving auth state to prevent flash
  if (loading) return null;
  // User is authenticated — redirect is in-flight, render nothing
  if (user) return null;

  return <>{children}</>;
}
