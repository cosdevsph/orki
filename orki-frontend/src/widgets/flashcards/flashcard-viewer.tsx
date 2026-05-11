"use client";

import { useState } from "react";

import type { Flashcard, SrsQuality } from "@/entities/flashcards/types";

type FlashcardViewerProps = {
  cards: Flashcard[];
  deckName: string;
  onClose: () => void;
  onReview?: (cardId: string, quality: SrsQuality) => void;
};

const SRS_RATINGS: { label: string; quality: SrsQuality; color: string; bg: string; interval: string }[] = [
  { label: "Again", quality: 0, color: "#EF4444", bg: "rgba(239,68,68,0.1)", interval: "< 1 min" },
  { label: "Hard", quality: 1, color: "#F59E0B", bg: "rgba(245,158,11,0.1)", interval: "~1 day" },
  { label: "Good", quality: 2, color: "#2FA2E2", bg: "rgba(47,162,226,0.1)", interval: "~6 days" },
  { label: "Easy", quality: 3, color: "#10B981", bg: "rgba(16,185,129,0.1)", interval: "~10 days" },
];

export function FlashcardViewer({ cards, deckName, onClose, onReview }: FlashcardViewerProps) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  const card = cards[index];
  const total = cards.length;
  const progress = ((index + 1) / total) * 100;

  function handleFlip() {
    setFlipped((f) => !f);
  }

  function handleRate(quality: SrsQuality) {
    // Call SRS review API
    if (onReview) {
      onReview(card.id, quality);
    }
    setReviewedCount((c) => c + 1);
    goNext();
  }

  function goNext() {
    if (index < total - 1) {
      setIndex((i) => i + 1);
      setFlipped(false);
    }
  }

  function goPrev() {
    if (index > 0) {
      setIndex((i) => i - 1);
      setFlipped(false);
    }
  }

  // Session complete
  if (index === total - 1 && reviewedCount === total) {
    return (
      <div className="flex flex-col items-center gap-6 py-12 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
          <svg width="32" height="32" viewBox="0 0 22 22" fill="none" className="text-success">
            <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="space-y-2">
          <h2 className="font-heading text-2xl font-bold text-foreground">Session Complete!</h2>
          <p className="text-sm text-muted">You reviewed all {total} cards in {deckName}.</p>
          <p className="text-xs text-muted">Cards will reappear based on your performance using spaced repetition.</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary/90"
        >
          Back to Decks
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Header */}
      <div className="flex w-full items-center justify-between">
        <div className="space-y-0.5">
          <h2 className="font-heading text-lg font-bold text-foreground">{deckName}</h2>
          <p className="text-xs text-muted">
            Card {index + 1} of {total} • {reviewedCount} reviewed
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl bg-overlay-hover-mid px-3 py-1.5 text-xs font-medium text-muted transition hover:bg-overlay-hover-strong hover:text-foreground"
        >
          ✕ Exit
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-track">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Flashcard */}
      <div className="flashcard-scene w-full max-w-2xl" style={{ height: 280 }}>
        <div
          className={`flashcard-inner w-full h-full cursor-pointer ${flipped ? "flipped" : ""}`}
          onClick={handleFlip}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === " " && handleFlip()}
          aria-label={flipped ? "Card back — click to flip" : "Card front — click to flip"}
        >
          {/* Front */}
          <div className="flashcard-face glass-strong absolute inset-0 flex flex-col items-center justify-center rounded-3xl p-10 text-center">
            <span className="mb-4 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {card.deck}
            </span>
            <p className="font-heading text-2xl font-bold leading-snug text-foreground">
              {card.front}
            </p>
            <p className="mt-6 text-xs text-muted">Click to reveal answer</p>
          </div>

          {/* Back */}
          <div
            className="flashcard-face flashcard-back glass-strong absolute inset-0 flex flex-col items-center justify-center rounded-3xl p-10 text-center"
            style={{
              background:
                `linear-gradient(135deg, color-mix(in srgb, var(--primary) 8%, transparent) 0%, var(--glass-strong-bg) 60%)`,
            }}
          >
            <span className="mb-4 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
              Answer
            </span>
            <p className="font-heading text-2xl font-bold leading-snug text-foreground">
              {card.back}
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={goPrev}
          disabled={index === 0}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-overlay-hover-mid text-muted transition hover:bg-overlay-hover-strong hover:text-foreground disabled:opacity-30"
          aria-label="Previous card"
        >
          <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
            <path d="M8.75 11.083 4.667 7l4.083-4.083" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <button
          type="button"
          onClick={handleFlip}
          className="rounded-2xl bg-primary/10 px-6 py-2.5 text-sm font-semibold text-primary transition-all duration-150 hover:bg-primary hover:text-white"
        >
          {flipped ? "Hide answer" : "Show answer"}
        </button>

        <button
          type="button"
          onClick={goNext}
          disabled={index === total - 1}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-overlay-hover-mid text-muted transition hover:bg-overlay-hover-strong hover:text-foreground disabled:opacity-30"
          aria-label="Next card"
        >
          <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
            <path d="M5.25 2.917 9.333 7 5.25 11.083" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* SRS Rating row — Active Recall grading */}
      {flipped && (
        <div className="flex flex-col items-center gap-3">
          <span className="text-xs text-muted font-medium">How well did you know this?</span>
          <div className="flex items-center gap-3">
            {SRS_RATINGS.map((r) => (
              <button
                key={r.label}
                type="button"
                onClick={() => handleRate(r.quality)}
                className="flex flex-col items-center gap-1 rounded-xl px-5 py-2.5 transition-all duration-150 hover:scale-105"
                style={{ backgroundColor: r.bg }}
              >
                <span className="text-sm font-bold" style={{ color: r.color }}>
                  {r.label}
                </span>
                <span className="text-[9px]" style={{ color: r.color, opacity: 0.7 }}>
                  {r.interval}
                </span>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-muted/60 mt-1">
            Spaced repetition: difficult cards appear more often, easy cards are pushed further out.
          </p>
        </div>
      )}
    </div>
  );
}
