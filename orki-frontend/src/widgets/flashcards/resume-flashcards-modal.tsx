"use client";

import type { FlashcardProgress } from "@/entities/flashcards/types";

// ─── Props ────────────────────────────────────────────────────────────────────

type ResumeFlashcardsModalProps = {
  /** The saved session to display in the modal body. */
  progress: FlashcardProgress;
  /** Called when user confirms they want to resume. */
  onResume: () => void;
  /** Called when user chooses to discard progress and start fresh. */
  onStartOver: () => void;
  /**
   * Pure UI dismiss — closes the modal without touching progress or localStorage.
   * Used by the X button and backdrop click.
   */
  onClose: () => void;
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Purely presentational modal.
 * Visibility is controlled entirely by the parent — this component has no
 * internal open/close state and will never mount unless the parent renders it.
 *
 * Trigger rule: parent must only render this after an explicit user action
 * (clicking "Resume Progress →" on a subject card). Never render it on
 * page load, mount, or route change.
 */
export function ResumeFlashcardsModal({
  progress,
  onResume,
  onStartOver,
  onClose,
}: ResumeFlashcardsModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 pb-8 sm:items-center sm:pb-4">
      {/* Backdrop — clicking outside = dismiss only, no progress change */}
      <div
        className="absolute inset-0 bg-black/25 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      <div className="glass-strong relative w-full max-w-sm rounded-3xl p-8 shadow-2xl">
        {/* Close button — dismisses modal only, progress is preserved */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-overlay-hover-mid text-muted transition hover:bg-overlay-hover-strong hover:text-foreground"
          aria-label="Close"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path
              d="M10 2 2 10M2 2l8 8"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Icon */}
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="text-primary"
          >
            <circle
              cx="12"
              cy="12"
              r="9.25"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <path d="M10 8.5l5.5 3.5-5.5 3.5V8.5Z" fill="currentColor" />
          </svg>
        </div>

        {/* Text */}
        <div className="mb-6 space-y-1.5 text-center">
          <h2 className="font-heading text-lg font-bold text-foreground">
            Resume Flashcards?
          </h2>
          <p className="text-sm text-muted">
            You were studying{" "}
            <span className="font-semibold text-foreground">
              {progress.subject}
            </span>{" "}
            &middot; Card {progress.currentIndex + 1}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onResume}
            className="w-full rounded-2xl bg-primary py-3 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98]"
          >
            Resume
          </button>
          <button
            type="button"
            onClick={onStartOver}
            className="w-full rounded-2xl bg-overlay-hover-mid py-3 text-sm font-medium text-muted transition hover:bg-overlay-hover-strong hover:text-foreground"
          >
            Start Over
          </button>
        </div>
      </div>
    </div>
  );
}
