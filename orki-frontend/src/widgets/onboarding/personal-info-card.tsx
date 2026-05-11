"use client";

import { useState } from "react";

import type { PersonalInfo } from "@/entities/onboarding/types";

interface PersonalInfoCardProps {
  onContinue: (data: PersonalInfo) => void;
}

function isValidAge(value: string): boolean {
  const n = Number(value);
  return value.trim() !== "" && Number.isInteger(n) && n >= 1 && n <= 120;
}

export function PersonalInfoCard({ onContinue }: PersonalInfoCardProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [touchedAge, setTouchedAge] = useState(false);

  const isValid =
    firstName.trim().length > 0 && lastName.trim().length > 0 && isValidAge(age);

  const ageError = touchedAge && age.length > 0 && !isValidAge(age);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onContinue({ firstName: firstName.trim(), lastName: lastName.trim(), age: Number(age) });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <h2 className="font-heading text-[1.6rem] font-bold text-foreground tracking-tight leading-tight">
          Tell us about yourself
        </h2>
        <p className="text-sm text-muted leading-relaxed">
          A few quick details to personalise your Orki experience
        </p>
      </div>

      {/* Name row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="ob-first-name"
            className="text-[11px] font-semibold text-secondary uppercase tracking-widest"
          >
            First Name
          </label>
          <input
            id="ob-first-name"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Maria"
            autoComplete="given-name"
            required
            className="w-full rounded-2xl border border-input-border bg-input-bg px-4 py-3.5 text-sm text-foreground placeholder:text-muted/40 outline-none transition-all duration-200 focus:border-primary/50 focus:bg-card-bg focus:ring-[3px] focus:ring-primary/10"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="ob-last-name"
            className="text-[11px] font-semibold text-secondary uppercase tracking-widest"
          >
            Last Name
          </label>
          <input
            id="ob-last-name"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Santos"
            autoComplete="family-name"
            required
            className="w-full rounded-2xl border border-input-border bg-input-bg px-4 py-3.5 text-sm text-foreground placeholder:text-muted/40 outline-none transition-all duration-200 focus:border-primary/50 focus:bg-card-bg focus:ring-[3px] focus:ring-primary/10"
          />
        </div>
      </div>

      {/* Age */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="ob-age"
          className="text-[11px] font-semibold text-secondary uppercase tracking-widest"
        >
          Age
        </label>
        <input
          id="ob-age"
          type="number"
          inputMode="numeric"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          onBlur={() => setTouchedAge(true)}
          placeholder="22"
          min="1"
          max="120"
          required
          className={`w-full rounded-2xl border bg-input-bg px-4 py-3.5 text-sm text-foreground placeholder:text-muted/40 outline-none transition-all duration-200 focus:bg-card-bg focus:ring-[3px] ${
            ageError
              ? "border-red-300 focus:border-red-400 focus:ring-red-100"
              : "border-input-border focus:border-primary/50 focus:ring-primary/10"
          }`}
        />
        {ageError && (
          <p className="text-xs text-red-500">Please enter a valid age between 1 and 120</p>
        )}
      </div>

      {/* Continue button — fades in when all fields valid */}
      <div
        className={`transition-all duration-300 ${
          isValid ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
        }`}
      >
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/35"
        >
          Continue
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </form>
  );
}
