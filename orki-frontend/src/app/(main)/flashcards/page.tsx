"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

import type { FirestoreFlashcard, FlashcardProgress } from "@/entities/flashcards/types";
import { FlashcardSubjectCard } from "@/widgets/flashcards/flashcard-subject-card";
import { FlashcardViewer } from "@/widgets/flashcards/flashcard-viewer";
import { ResumeFlashcardsModal } from "@/widgets/flashcards/resume-flashcards-modal";
import { getFlashcardsForSubject } from "@/shared/api/flashcards";
import { useAuth } from "@/hooks/useAuth";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { getSubjectsByExam } from "@/shared/utils/exam-type";
import { routes } from "@/shared/config/routes";

const CARDS_PER_SUBJECT = 30;

// ─── Progress persistence (localStorage) ─────────────────────────────────────
function progressKey(userId: number): string {
  return `orki_flashcard_progress_${userId}`;
}

function loadProgress(userId: number): FlashcardProgress | null {
  try {
    const raw = localStorage.getItem(progressKey(userId));
    if (!raw) return null;
    return JSON.parse(raw) as FlashcardProgress;
  } catch {
    return null;
  }
}

function persistProgress(userId: number, p: FlashcardProgress): void {
  try {
    localStorage.setItem(progressKey(userId), JSON.stringify(p));
  } catch {
    // Storage quota exceeded — silently ignore
  }
}

function clearPersistedProgress(userId: number): void {
  try {
    localStorage.removeItem(progressKey(userId));
  } catch {
    // ignore
  }
}

// ─── Modal: Exit confirmation ─────────────────────────────────────────────────

function ExitConfirmModal({
  onContinue,
  onExit,
}: {
  onContinue: () => void;
  onExit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pb-8 sm:items-center sm:pb-4">
      {/* Backdrop — clicking it continues studying */}
      <div
        className="absolute inset-0 bg-black/25 backdrop-blur-sm"
        onClick={onContinue}
        aria-hidden
      />

      <div className="glass-strong relative w-full max-w-sm rounded-3xl p-8 shadow-2xl">
        {/* Icon */}
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/30">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="text-amber-500"
          >
            <path
              d="M12 9v5M12 16.5h.007"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
              stroke="currentColor"
              strokeWidth="1.6"
            />
          </svg>
        </div>

        {/* Text */}
        <div className="mb-6 space-y-1.5 text-center">
          <h2 className="font-heading text-lg font-bold text-foreground">
            Leave Flashcards?
          </h2>
          <p className="text-sm text-muted">
            Your progress will be saved so you can resume later.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onContinue}
            className="w-full rounded-2xl bg-primary py-3 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98]"
          >
            Continue Studying
          </button>
          <button
            type="button"
            onClick={onExit}
            className="w-full rounded-2xl bg-overlay-hover-mid py-3 text-sm font-medium text-muted transition hover:bg-overlay-hover-strong hover:text-foreground"
          >
            Exit &amp; Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton + empty/error helpers ──────────────────────────────────────────

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
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { isSubscribed, subLoading } = useSubscriptionStatus(user?.id);

  // ── Session state (lifted here so page can always read position for saves) ─
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [activeCards, setActiveCards] = useState<FirestoreFlashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  // ── Async / UI state ──────────────────────────────────────────────────────
  const [loadingSubject, setLoadingSubject] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // ── Modal state ───────────────────────────────────────────────────────────
  const [savedProgress, setSavedProgress] = useState<FlashcardProgress | null>(
    null,
  );
  /** Controls ResumeFlashcardsModal visibility — ONLY set via user action. */
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  const pathname = usePathname();
  const examType = user?.exam_type ?? null;
  const subjects = useMemo(() => getSubjectsByExam(examType), [examType]);

  // ── Auto-save ref ─────────────────────────────────────────────────────────
  // Kept in a ref so the beforeunload handler always sees fresh values
  // without needing to be re-registered on every state change.
  const autoSaveRef = useRef<{
    userId: number;
    progress: FlashcardProgress;
  } | null>(null);

  useEffect(() => {
    if (user && activeSubject && examType) {
      autoSaveRef.current = {
        userId: user.id,
        progress: {
          examType,
          subject: activeSubject,
          currentIndex,
          lastUpdated: new Date().toISOString(),
        },
      };
    } else {
      autoSaveRef.current = null;
    }
  }, [user, activeSubject, examType, currentIndex]);

  // Register beforeunload once — ref keeps values fresh.
  useEffect(() => {
    function onBeforeUnload() {
      if (autoSaveRef.current) {
        const { userId, progress } = autoSaveRef.current;
        persistProgress(userId, progress);
      }
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  // Load any saved progress on mount and on every route visit.
  // Including `pathname` ensures the effect re-runs when the user navigates
  // away from and back to this page (Next.js may keep the component alive).
  useEffect(() => {
    if (authLoading || !user) return;
    const progress = loadProgress(user.id);
    if (progress && progress.examType === user.exam_type) {
      setSavedProgress(progress);
    } else {
      // Clear stale state if localStorage was wiped externally.
      setSavedProgress(null);
    }
  }, [authLoading, user, pathname]);

  // ── Internal helpers ──────────────────────────────────────────────────────

  function closeViewer() {
    setActiveSubject(null);
    setActiveCards([]);
    setCurrentIndex(0);
    setFlipped(false);
    setFetchError(null);
  }

  // ── Handlers ──────────────────────────────────────────────────────────────

  /** Open a subject, optionally resuming at a saved index. */
  const handleStudy = useCallback(
    async (subjectName: string, resumeIndex = 0) => {
      if (!examType || loadingSubject !== null) return;

      setLoadingSubject(subjectName);
      setFetchError(null);
      setCurrentIndex(0);
      setFlipped(false);

      try {
        const cards = await getFlashcardsForSubject(examType, subjectName);

        if (cards.length === 0) {
          setFetchError(
            `No flashcards found for ${subjectName} yet. Check back after more questions are added.`,
          );
          return;
        }

        // Clamp resume index to valid range in case card count changed.
        const safeIndex = Math.min(resumeIndex, cards.length - 1);
        setCurrentIndex(safeIndex);
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

  /** Show exit confirmation modal. */
  function handleExitRequest() {
    setShowExitModal(true);
  }

  /** Confirmed exit: persist progress (for button-label tracking) then close viewer. */
  function handleExitConfirm() {
    if (!user || !activeSubject || !examType) {
      setShowExitModal(false);
      closeViewer();
      return;
    }
    const progress: FlashcardProgress = {
      examType,
      subject: activeSubject,
      currentIndex,
      lastUpdated: new Date().toISOString(),
    };
    persistProgress(user.id, progress);
    // Update button label state but do NOT open ResumeModal — user must
    // explicitly click "Resume Progress →" to trigger it.
    setSavedProgress(progress);
    setShowExitModal(false);
    closeViewer();
  }

  /** Cancelled exit: stay in viewer. */
  function handleExitCancel() {
    setShowExitModal(false);
  }

  /** Re-fetch cards for a fresh shuffle, reset to card 0. */
  async function handleRestart() {
    if (!examType || !activeSubject) return;
    if (user) clearPersistedProgress(user.id);
    setSavedProgress(null);
    setCurrentIndex(0);
    setFlipped(false);
    try {
      const newCards = await getFlashcardsForSubject(examType, activeSubject);
      if (newCards.length > 0) setActiveCards(newCards);
    } catch {
      // Keep existing cards silently on fetch error.
    }
  }

  /** Start the session from the saved progress index. */
  function handleResumeFromSave() {
    if (!savedProgress) return;
    const { subject, currentIndex: savedIndex } = savedProgress;
    setSavedProgress(null);
    setIsResumeModalOpen(false);
    void handleStudy(subject, savedIndex);
  }

  /** Discard saved progress and start the subject fresh. */
  function handleDismissResume() {
    if (user) clearPersistedProgress(user.id);
    setSavedProgress(null);
    setIsResumeModalOpen(false);
  }

  // ── Auth loading ───────────────────────────────────────────────────────────

  if (authLoading) {
    return (
      <div className="animate-page-in space-y-8 px-4 pb-24 pt-6 sm:px-6">
        <div className="space-y-1.5">
          <div className="h-7 w-44 animate-pulse rounded-lg bg-overlay-hover-strong" />
          <div className="h-4 w-72 animate-pulse rounded bg-overlay-hover-mid" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SubjectCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // ── Subscription gate ───────────────────────────────────────────────────────

  if (!subLoading && !isSubscribed) {
    return (
      <div className="animate-page-in flex flex-col items-center justify-center py-24 text-center space-y-6">
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" className="text-muted/40">
          <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M8 11V7a4 4 0 1 1 8 0v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <div>
          <h2 className="font-heading text-2xl font-bold text-foreground">Flashcards Locked</h2>
          <p className="text-muted mt-1">
            Subscribe to unlock all flashcard decks and start your study journey.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push(routes.subscribe)}
          className="rounded-xl bg-primary text-white font-semibold px-6 py-3 transition hover:bg-primary/90"
        >
          Unlock Flashcards with Subscription
        </button>
      </div>
    );
  }

  // ── No exam type ───────────────────────────────────────────────────────────

  if (!examType) {
    return (
      <div className="animate-page-in px-4 pb-24 pt-6 sm:px-6">
        <EmptyState message="Complete your profile setup to unlock flashcards for your exam type." />
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────

  const inViewer = activeSubject !== null && activeCards.length > 0;

  return (
    <>
      {/* Resume modal — user-triggered only; never auto-shown on mount */}
      {isResumeModalOpen && savedProgress !== null && (
        <ResumeFlashcardsModal
          progress={savedProgress}
          onResume={handleResumeFromSave}
          onStartOver={handleDismissResume}
          onClose={() => setIsResumeModalOpen(false)}
        />
      )}

      {/* Exit confirmation modal */}
      {showExitModal && (
        <ExitConfirmModal
          onContinue={handleExitCancel}
          onExit={handleExitConfirm}
        />
      )}

      {/* Flashcard viewer */}
      {inViewer ? (
        <div className="animate-page-in px-4 pb-24 pt-6 sm:px-6">
          <div className="mx-auto max-w-2xl">
            <FlashcardViewer
              cards={activeCards}
              deckName={activeSubject}
              currentIndex={currentIndex}
              flipped={flipped}
              onFlip={() => setFlipped((f) => !f)}
              onNext={() => {
                if (currentIndex < activeCards.length - 1) {
                  setCurrentIndex((i) => i + 1);
                  setFlipped(false);
                }
              }}
              onPrev={() => {
                if (currentIndex > 0) {
                  setCurrentIndex((i) => i - 1);
                  setFlipped(false);
                }
              }}
              onRestart={handleRestart}
              onExit={handleExitRequest}
            />
          </div>
        </div>
      ) : (
        /* Subject grid */
        <div className="animate-page-in space-y-8 px-4 pb-24 pt-6 sm:px-6">
          <div className="space-y-1">
            <h1 className="font-heading text-2xl font-bold text-foreground">
              Flashcards
            </h1>
            <p className="text-sm text-muted">
              Study {examType} topics &middot; Up to {CARDS_PER_SUBJECT}{" "}
              randomised cards per subject
            </p>
          </div>

          {fetchError !== null && (
            <ErrorBanner
              message={fetchError}
              onDismiss={() => setFetchError(null)}
            />
          )}

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
                  hasProgress={savedProgress?.subject === subject.name}
                  onStudy={() => {
                    if (savedProgress?.subject === subject.name) {
                      // User explicitly clicked "Resume Progress →"
                      setIsResumeModalOpen(true);
                    } else {
                      void handleStudy(subject.name, 0);
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
