"use client";

import { useState } from "react";

import type { ExamOption, ExamType } from "@/entities/onboarding/types";

const EXAM_OPTIONS: ExamOption[] = [
  {
    id: "LEPT",
    shortName: "LEPT",
    fullName: "Licensure Exam for Professional Teachers",
    description: "For aspiring licensed teachers",
  },
  {
    id: "CSE",
    shortName: "CSE",
    fullName: "Career Service Examination",
    description: "Civil service and government careers",
  },
  {
    id: "PmLE",
    shortName: "PmLE",
    fullName: "Psychometricians Licensure Examination",
    description: "For aspiring licensed psychometricians",
  },
  {
    id: "CLE",
    shortName: "CLE",
    fullName: "Criminologist Licensure Examination",
    description: "For aspiring licensed criminologists",
  },
];

function ExamIcon({ type }: { type: ExamType }) {
  switch (type) {
    case "LEPT":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
          aria-hidden="true"
        >
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      );
    case "CSE":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
          aria-hidden="true"
        >
          <path d="M3 21h18" />
          <path d="M5 21V7l7-4 7 4v14" />
          <path d="M9 21v-5h6v5" />
          <circle cx="9.5" cy="11" r="0.5" fill="currentColor" />
          <circle cx="14.5" cy="11" r="0.5" fill="currentColor" />
          <circle cx="12" cy="11" r="0.5" fill="currentColor" />
        </svg>
      );
    case "PmLE":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
          aria-hidden="true"
        >
          <circle cx="12" cy="7" r="4" />
          <path d="M5.5 20a7 7 0 0 1 13 0" />
          <line x1="12" y1="7" x2="12" y2="11" />
          <line x1="10" y1="9" x2="14" y2="9" />
        </svg>
      );
    case "CLE":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
          aria-hidden="true"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
  }
}

interface ExamSelectionCardProps {
  onSelect: (examType: ExamType) => void;
  isLoading: boolean;
  onBack: () => void;
}

export function ExamSelectionCard({ onSelect, isLoading, onBack }: ExamSelectionCardProps) {
  const [selected, setSelected] = useState<ExamType | null>(null);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <h2 className="font-heading text-[1.6rem] font-bold text-foreground tracking-tight leading-tight">
          What are you studying for?
        </h2>
        <p className="text-sm text-muted leading-relaxed">
          We&apos;ll craft your study plan around your target examination
        </p>
      </div>

      {/* Exam option cards */}
      <div className="grid grid-cols-2 gap-3">
        {EXAM_OPTIONS.map((exam) => {
          const isSelected = selected === exam.id;
          return (
            <button
              key={exam.id}
              type="button"
              onClick={() => setSelected(exam.id)}
              className={`relative flex items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "border-primary bg-primary/5 shadow-lg shadow-primary/15 -translate-y-0.5"
                  : "border-border/60 bg-white/60 hover:border-primary/40 hover:bg-white hover:shadow-md hover:-translate-y-0.5"
              }`}
            >
              {/* Icon bubble */}
              <span
                className={`shrink-0 flex items-center justify-center w-9 h-9 rounded-xl transition-colors duration-200 ${
                  isSelected ? "bg-primary text-white" : "bg-primary/10 text-primary"
                }`}
              >
                <ExamIcon type={exam.id} />
              </span>

              {/* Label */}
              <span className="flex flex-col gap-0.5 min-w-0 pt-0.5">
                <span
                  className={`text-sm font-semibold leading-tight transition-colors duration-200 ${
                    isSelected ? "text-primary" : "text-foreground"
                  }`}
                >
                  {exam.shortName}
                </span>
                <span className="text-xs text-muted leading-snug line-clamp-2">
                  {exam.fullName}
                </span>
              </span>

              {/* Selected checkmark badge */}
              {isSelected && (
                <span className="absolute top-2.5 right-2.5 flex items-center justify-center w-4.5 h-4.5 rounded-full bg-primary">
                  <svg
                    className="w-2.5 h-2.5 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer actions */}
      <div className="flex items-center gap-3">
        {/* Back button */}
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="flex items-center gap-1.5 rounded-2xl border border-border/70 bg-white px-5 py-3.5 text-sm font-medium text-secondary transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
        >
          <svg
            className="w-3.5 h-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Begin button — fades in when an exam is selected */}
        <div
          className={`flex-1 transition-all duration-300 ${
            selected ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
          }`}
        >
          <button
            type="button"
            onClick={() => selected && onSelect(selected)}
            disabled={!selected || isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/35 disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {isLoading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Saving…
              </>
            ) : (
              <>
                Begin Your Journey
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
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
