"use client";

import Image from "next/image";

import { useAuth } from "@/hooks/useAuth";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getTodayLabel(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function WelcomeHeader() {
  const { user } = useAuth();
  const firstName = user?.displayName?.split(" ")[0] ?? "there";

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted">{getTodayLabel()}</p>
        <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground">
          {getGreeting()}, {firstName}
        </h1>
        <p className="text-base text-secondary">
          You have a great study session ahead of you today.
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
