"use client";

import { useState } from "react";

import type { FirestoreFlashcard } from "@/entities/flashcards/types";

type FlashcardViewerProps = {
  cards: FirestoreFlashcard[];
  deckName: string;
  onClose: () => void;
};

const DIFFICULTY_STYLES: Record<
  string,
  { label: string; bg: string; color: string }
> = {
  Easy: { label: "Easy", bg: "rgba(16,185,129,0.12)", color: "#10B981" },
  Medium: { label: "Medium", bg: "rgba(245,158,11,0.12)", color: "#F59E0B" },
  Hard: { label: "Hard", bg: "rgba(239,68,68,0.12)", color: "#EF4444" },
};

const CHOICE_KEYS = ["A", "B", "C", "D"] as const;

export function FlashcardViewer({ cards, deckName, onClose }: FlashcardViewerProps) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const card = cards[index];
  const total = cards.length;
  const progress = ((index + 1) / total) * 100;

  const diffStyle =
    DIFFICULTY_STYLES[card.difficulty] ?? {
      label: card.difficulty,
      bg: "rgba(47,162,226,0.12)",
      color: "#2FA2E2",
    };

  function handleFlip() {
    setFlipped((f) => !f);
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

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Header */}
      <div className="flex w-full items-center justify-between">
        <div className="space-y-0.5">
          <h2 className="font-heading text-lg font-bold text-foreground">
            {deckName}
          </h2>
          <p className="text-xs text-muted">
            Card {index + 1} of {total}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl bg-overlay-hover-mid px-3 py-1.5 text-xs font-medium text-muted transition hover:bg-overlay-hover-strong hover:text-foreground"
        >
          Exit
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-track">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Flashcard flip scene */}
      <div className="flashcard-scene w-full" style={{ height: 340 }}>
        <div
          className={`flashcard-inner w-full h-full cursor-pointer ${flipped ? "flipped" : ""}`}
          onClick={handleFlip}
          role="button"
          tabIndex={0}
          onKeyDown={(e) =>
            (e.key === " " || e.key === "Enter") && handleFlip()
          }
          aria-label={
            flipped ? "Card back — click to flip" : "Card front — click to flip"
          }
        >
          {/* Front */}
          <div className="flashcard-face glass-strong absolute inset-0 flex flex-col rounded-3xl p-8">
            <div className="mb-5 flex items-center gap-2 flex-wrap">
              <span className="rounded-full bg-primary/10 px-3 py-0.5 text-[11px] font-semibold text-primary">
                {card.topic}
              </span>
              <span
                className="rounded-full px-3 py-0.5 text-[11px] font-semibold"
                style={{ backgroundColor: diffStyle.bg, color: diffStyle.color }}
              >
                {diffStyle.label}
              </span>
            </div>

            <p className="font-heading text-lg font-bold leading-snug text-foreground flex-1">
              {card.front}
            </p>

            <div className="mt-5 grid grid-cols-1 gap-2">
              {CHOICE_KEYS.map((key) => {
                const text = card.choices[key];
                if (!text) return null;
                return (
                  <div
                    key={key}
                    className="flex items-start gap-3 rounded-xl bg-overlay-hover-mid px-4 py-2.5"
                  >
                    <span className="mt-px shrink-0 text-xs font-bold text-muted">
                      {key}.
                    </span>
                    <span className="text-sm text-foreground">{text}</span>
                  </div>
                );
              })}
            </div>

            <p className="mt-4 text-center text-xs text-muted">
              Tap to reveal answer
            </p>
          </div>

          {/* Back */}
          <div
            className="flashcard-face flashcard-back glass-strong absolute inset-0 flex flex-col rounded-3xl p-8"
            style={{
              background:
                "linear-gradient(135deg, color-mix(in srgb, var(--primary) 6%, transparent) 0%, var(--glass-strong-bg) 60%)",
            }}
          >
            <div className="mb-5 flex items-center gap-2">
              <span className="rounded-full bg-success/10 px-3 py-0.5 text-[11px] font-semibold text-success">
                Correct Answer
              </span>
              <span className="rounded-full bg-primary/10 px-3 py-0.5 text-[11px] font-bold text-primary">
                {card.correctAnswerKey}
              </span>
            </div>

            <p className="font-heading text-xl font-bold leading-snug text-foreground">
              {card.correctAnswerText}
            </p>

            <div className="my-5 h-px w-full bg-track" />

            <div className="flex-1 overflow-auto">
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted">
                Explanation
              </p>
              <p className="text-sm leading-relaxed text-foreground/80">
                {card.explanation}
              </p>
            </div>

            <p className="mt-4 text-center text-xs text-muted">
              Tap to see question
            </p>
          </div>
        </div>
      </div>

      {/* Navigation controls */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={goPrev}
          disabled={index === 0}
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

      {/* Keyboard hint */}
      <p className="text-[11px] text-muted/50">
        Press{" "}
        <kbd className="rounded bg-overlay-hover-mid px-1.5 py-0.5 font-mono text-[10px]">
          Space
        </kbd>{" "}
        or{" "}
        <kbd className="rounded bg-overlay-hover-mid px-1.5 py-0.5 font-mono text-[10px]">
          Enter
        </kbd>{" "}
        to flip
      </p>
    </div>
  );
}
