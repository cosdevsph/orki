"use client";

import { useState, useMemo, useCallback } from "react";

import type { FirestoreFlashcard } from "@/entities/flashcards/types";
import { FlashcardSubjectCard } from "@/widgets/flashcards/flashcard-subject-card";
import { FlashcardViewer } from "@/widgets/flashcards/flashcard-viewer";
import { getFlashcardsForSubject } from "@/shared/api/flashcards";
import { useAuth } from "@/hooks/useAuth";
import { getSubjectsByExam } from "@/shared/utils/exam-type";

const CARDS_PER_SUBJECT = 30;

// ─── Sub-components ───────────────────────────────────────────────────────────

function SubjectCardSkeleton() {
  return (
    <div className="glass animate-pulse rounded-2xl p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div className="h-12 w-12 rounded-2xl bg-overlay-hover-strong" />
        <div className="h-5 w-16 rounded-full bg-overlay-hover-strong" />
      </div>
      <div className="space-y-1.5">
        <div className="h-4 w-3/4 rounded bg-overlay-hover-strong" />
        <div className="h-3 w-1/2 rounded bg-overlay-hover-mid" />
      </div>
      <div className="h-1 w-full rounded-full bg-overlay-hover-mid" />
      <div className="h-9 w-full rounded-xl bg-overlay-hover-mid" />
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          className="text-primary"
        >
          <rect
            x="2.75"
            y="3.667"
            width="18.5"
            height="16.667"
            rx="2.75"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M7.5 8.5h9M7.5 12h6"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="space-y-1">
        <p className="font-heading font-semibold text-foreground">
          No Flashcards Available
        </p>
        <p className="max-w-xs text-sm text-muted">{message}</p>
      </div>
    </div>
  );
}

function ErrorBanner({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/30">
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        className="mt-0.5 shrink-0 text-red-500"
      >
        <path
          d="M8 5.333v3.334M8 10.667h.007"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M6.543 2.286 1.714 10.57A1.667 1.667 0 0 0 3.17 13h9.66a1.667 1.667 0 0 0 1.456-2.43L9.457 2.286a1.667 1.667 0 0 0-2.914 0Z"
          stroke="currentColor"
          strokeWidth="1.4"
        />
      </svg>
      <p className="text-sm text-red-700 dark:text-red-400">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="ml-auto shrink-0 text-red-400 transition hover:text-red-600"
        aria-label="Dismiss error"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M10.5 3.5 3.5 10.5M3.5 3.5l7 7"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FlashcardsPage() {
  const { user, loading: authLoading } = useAuth();

  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [activeCards, setActiveCards] = useState<FirestoreFlashcard[]>([]);
  const [loadingSubject, setLoadingSubject] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const examType = user?.exam_type ?? null;

  // Derive subject list from exam type — memoised so it only recalculates when
  // exam_type changes, not on every render.
  const subjects = useMemo(() => getSubjectsByExam(examType), [examType]);

  // Fetch cards for a given subject, then open the viewer.
  const handleStudy = useCallback(
    async (subjectName: string) => {
      // Guard: don't start a second fetch while one is in flight.
      if (!examType || loadingSubject !== null) return;

      setLoadingSubject(subjectName);
      setFetchError(null);

      try {
        const cards = await getFlashcardsForSubject(examType, subjectName);

        if (cards.length === 0) {
          setFetchError(
            `No flashcards found for ${subjectName} yet. Check back after more questions are added.`,
          );
          return;
        }

        setActiveCards(cards);
        setActiveSubject(subjectName);
      } catch (err) {
        console.error("[FlashcardsPage] Firestore fetch error:", err);
        setFetchError(
          err instanceof Error
            ? err.message
            : "Failed to load flashcards. Please check your connection and try again.",
        );
      } finally {
        setLoadingSubject(null);
      }
    },
    [examType, loadingSubject],
  );

  function handleClose() {
    setActiveSubject(null);
    setActiveCards([]);
    setFetchError(null);
  }

  // ── Auth loading ─────────────────────────────────────────────────────────

  if (authLoading) {
    return (
      <div className="animate-page-in space-y-8 px-4 pb-24 pt-6 sm:px-6">
        {/* Header skeleton */}
        <div className="space-y-1.5">
          <div className="h-7 w-44 animate-pulse rounded-lg bg-overlay-hover-strong" />
          <div className="h-4 w-72 animate-pulse rounded bg-overlay-hover-mid" />
        </div>
        {/* Grid skeleton */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SubjectCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // ── No exam type configured ───────────────────────────────────────────────

  if (!examType) {
    return (
      <div className="animate-page-in px-4 pb-24 pt-6 sm:px-6">
        <EmptyState message="Complete your profile setup to unlock flashcards for your exam type." />
      </div>
    );
  }

  // ── Flashcard viewer ─────────────────────────────────────────────────────

  if (activeSubject !== null && activeCards.length > 0) {
    return (
      <div className="animate-page-in px-4 pb-24 pt-6 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <FlashcardViewer
            cards={activeCards}
            deckName={activeSubject}
            onClose={handleClose}
          />
        </div>
      </div>
    );
  }

  // ── Subject grid ─────────────────────────────────────────────────────────

  return (
    <div className="animate-page-in space-y-8 px-4 pb-24 pt-6 sm:px-6">
      {/* Page header */}
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Flashcards
        </h1>
        <p className="text-sm text-muted">
          Study {examType} topics &middot; Up to {CARDS_PER_SUBJECT} randomised
          cards per subject
        </p>
      </div>

      {/* Error banner */}
      {fetchError !== null && (
        <ErrorBanner
          message={fetchError}
          onDismiss={() => setFetchError(null)}
        />
      )}

      {/* Subject cards */}
      {subjects.length === 0 ? (
        <EmptyState
          message={`No subjects are configured for ${examType} yet.`}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <FlashcardSubjectCard
              key={subject.name}
              name={subject.name}
              color={subject.color}
              cardCount={CARDS_PER_SUBJECT}
              loading={loadingSubject === subject.name}
              onStudy={() => handleStudy(subject.name)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
