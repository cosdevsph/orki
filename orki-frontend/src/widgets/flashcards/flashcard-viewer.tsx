"use client";

import { memo } from "react";

import type { FirestoreFlashcard } from "@/entities/flashcards/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type FlashcardViewerProps = {
  cards: FirestoreFlashcard[];
  deckName: string;
  /** Controlled index — owned by parent so it can auto-save position. */
  currentIndex: number;
  /** Controlled flip state — owned by parent. */
  flipped: boolean;
  onFlip: () => void;
  onNext: () => void;
  onPrev: () => void;
  /** Re-fetch cards from scratch and reset to card 0. */
  onRestart: () => void;
  /** Show exit-confirmation modal in parent. */
  onExit: () => void;
};

// ─── Component ────────────────────────────────────────────────────────────────

function FlashcardViewerInner({
  cards,
  deckName,
  currentIndex,
  flipped,
  onFlip,
  onNext,
  onPrev,
  onRestart,
  onExit,
}: FlashcardViewerProps) {
  const card = cards[currentIndex];
  const total = cards.length;
  const progress = ((currentIndex + 1) / total) * 100;

  if (!card) return null;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex w-full items-center justify-between gap-4">
        <div className="min-w-0 space-y-0.5">
          <h2 className="truncate font-heading text-lg font-bold text-foreground">
            {deckName}
          </h2>
          <p className="text-xs text-muted">
            Card {currentIndex + 1} of {total}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onRestart}
            className="rounded-xl bg-overlay-hover-mid px-3 py-1.5 text-xs font-medium text-muted transition hover:bg-overlay-hover-strong hover:text-foreground"
            aria-label="Restart from beginning"
          >
            ↺ Restart
          </button>
          <button
            type="button"
            onClick={onExit}
            className="rounded-xl bg-overlay-hover-mid px-3 py-1.5 text-xs font-medium text-muted transition hover:bg-overlay-hover-strong hover:text-foreground"
          >
            Exit
          </button>
        </div>
      </div>

      {/* ── Progress bar ───────────────────────────────────────────────── */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-track">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ── Flashcard flip scene ────────────────────────────────────────── */}
      <div className="flashcard-scene w-full" style={{ height: 260 }}>
        <div
          className={`flashcard-inner h-full w-full cursor-pointer ${flipped ? "flipped" : ""}`}
          onClick={onFlip}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === " " || e.key === "Enter") onFlip();
            if (e.key === "ArrowRight") onNext();
            if (e.key === "ArrowLeft") onPrev();
          }}
          aria-label={
            flipped ? "Card back — click to flip" : "Card front — click to flip"
          }
        >
          {/* Front — question only */}
          <div className="flashcard-face absolute inset-0 flex flex-col items-center justify-center rounded-3xl p-8">
            <p className="font-heading text-xl font-bold leading-snug text-center text-foreground">
              {card.front}
            </p>
            <p className="mt-6 text-center text-xs text-muted">
              Tap to reveal answer
            </p>
          </div>

          {/* Back — correct answer only */}
          <div
            className="flashcard-face flashcard-back absolute inset-0 flex flex-col items-center justify-center rounded-3xl p-8"
            style={{
              background: "color-mix(in srgb, var(--primary) 8%, var(--flashcard-face-bg))",
            }}
          >
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-primary/60">
              Answer
            </p>
            <p className="font-heading text-2xl font-bold leading-snug text-center text-foreground">
              {card.correctAnswerText}
            </p>
            <p className="mt-6 text-center text-xs text-muted">
              Tap to see question
            </p>
          </div>
        </div>
      </div>

      {/* ── Navigation ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onPrev}
          disabled={currentIndex === 0}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-overlay-hover-mid text-muted transition hover:bg-overlay-hover-strong hover:text-foreground disabled:opacity-30"
          aria-label="Previous card"
        >
          <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
            <path
              d="M8.75 11.083 4.667 7l4.083-4.083"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={currentIndex === total - 1}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-overlay-hover-mid text-muted transition hover:bg-overlay-hover-strong hover:text-foreground disabled:opacity-30"
          aria-label="Next card"
        >
          <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
            <path
              d="M5.25 2.917 9.333 7 5.25 11.083"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>


    </div>
  );
}

export const FlashcardViewer = memo(FlashcardViewerInner);
