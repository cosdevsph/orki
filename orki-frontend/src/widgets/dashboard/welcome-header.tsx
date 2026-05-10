"use client";

import Image from "next/image";

import { useAuth } from "@/hooks/useAuth";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function WelcomeHeader() {
  const { user } = useAuth();
  const firstName = user?.first_name || user?.display_name || "there";

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground">
          Welcome back, {firstName}!
        </h1>
        <p className="text-base text-secondary">
          Your focus session awaits. You are on a 5-day streak.
        </p>
      </div>

      <div className="relative opacity-90">
        <Image
          src="/mascott/OrkiLogoFront.webp"
          alt="Orki mascot"
          width={96}
          height={96}
          className="animate-float-slow drop-shadow-md"
          priority
        />
      </div>
    </div>
  );
}
