"use client";

import Image from "next/image";

import { useAuth } from "@/hooks/useAuth";
import { useExamType } from "@/hooks/useExamType";

export function WelcomeHeader() {
  const { user } = useAuth();
  const { professionalTitle } = useExamType();
  const firstName = user?.first_name || user?.display_name || "there";

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted tracking-wide uppercase">
          Hello there,
        </p>
        <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-none">
          Future{" "}
          <span
            style={{
              background: "linear-gradient(135deg, var(--primary) 0%, #8B5CF6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {professionalTitle}
          </span>
          !
        </h1>
        <p className="text-sm md:text-base text-secondary">
          Welcome back, {firstName}. Your focus session awaits.
        </p>
      </div>

      <div className="relative opacity-90">
        <Image
          src="/mascott/OrkiLogoFront.webp"
          alt="Orki mascot"
          width={96}
          height={96}
          className="animate-float-slow drop-shadow-md w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24"
          priority
        />
      </div>
    </div>
  );
}
