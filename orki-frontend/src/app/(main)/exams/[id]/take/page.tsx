"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import type { FirestoreQuestion } from "@/entities/exams/types";
import { ExitConfirmationModal } from "@/components/ui/exit-confirmation-modal";
import { useExamStore } from "@/features/exam/store";
import { useAuth } from "@/hooks/useAuth";
import { useExamQuestions } from "@/hooks/useExamQuestions";
import { auth } from "@/shared/firebase/client";
import {
  createExamSession,
  deleteExamSession,
  getExamSession,
  saveAnalytics,
  saveExamAttempt,
  updateExamSession,
} from "@/shared/firebase/firestore";

// ─── Local-storage key helpers ──────────────────────────────────────────────────

/** Key that stores the Firestore session ID (or "local" for unauthenticated). */
function sessionStorageKey(examType: string, subject: string) {
  return `orki_session_${examType}_${subject}`;
}

/** Key that stores the full serialised session state for unauthenticated/offline sessions. */
function localSessionDataKey(examType: string, subject: string) {
  return `orki_session_data_${examType}_${subject}`;
}

// ─── Loading / Error screens ──────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: "var(--background)" }}>
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-border border-t-primary" />
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3" style={{ background: "var(--background)" }}>
      <svg width="40" height="40" viewBox="0 0 22 22" fill="none" className="text-muted/40">
        <circle cx="11" cy="11" r="8.25" stroke="currentColor" strokeWidth="1.6" />
        <path d="M11 7.333v4.584M11 13.75v.917" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <p className="text-sm text-muted">{message}</p>
    </div>
  );
}

// ─── Pause Overlay ────────────────────────────────────────────────────────────

function PauseOverlay({ onResume }: { onResume: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-6 bg-background/90 backdrop-blur-md">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <svg width="28" height="28" viewBox="0 0 22 22" fill="none" className="text-primary">
          <rect x="5.5" y="3.667" width="3.667" height="14.667" rx="1.2" fill="currentColor" />
          <rect x="12.833" y="3.667" width="3.667" height="14.667" rx="1.2" fill="currentColor" />
        </svg>
      </div>
      <div className="space-y-1 text-center">
        <h2 className="font-heading text-2xl font-bold text-foreground">Exam Paused</h2>
        <p className="text-sm text-muted">Your progress has been saved. Resume whenever you&apos;re ready.</p>
      </div>
      <button
        type="button"
        onClick={onResume}
        className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-bold text-white transition-all hover:bg-primary/90"
      >
        <svg width="14" height="14" viewBox="0 0 22 22" fill="none">
          <path d="M8.25 5.5 16.5 11l-8.25 5.5V5.5Z" fill="currentColor" />
        </svg>
        Resume Exam
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ExamTakePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  // Route params: /exams/[id]/take?subject=English&exam_type=LEPT
  const subject = searchParams.get("subject") ?? "";
  const examType = searchParams.get("exam_type") ?? user?.exam_type ?? "";

  const { questions, loading, error } = useExamQuestions(examType || null, subject || null);

  // ─── Zustand store ───────────────────────────────────────────────────────────
  const {
    sessionId,
    answers,
    currentIndex,
    elapsedTime,
    status,
    initSession,
    recordAnswer,
    setCurrentIndex,
    tick,
    pause,
    resume,
    complete,
    resetSession,
  } = useExamStore();

  // ─── Local UI state ──────────────────────────────────────────────────────────
  const [marked, setMarked] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  /** Gate to prevent double-initialisation of the Firestore session. */
  const [sessionReady, setSessionReady] = useState(false);

  // ─── Refs ────────────────────────────────────────────────────────────────────
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Derived values ──────────────────────────────────────────────────────────
  const total = questions.length;
  const question: FirestoreQuestion | undefined = questions[currentIndex];
  const progress = total > 0 ? ((currentIndex + 1) / total) * 100 : 0;
  const unanswered = total - Object.keys(answers).length;

  // ─── Timer: elapsed seconds, counts up ──────────────────────────────────────
  useEffect(() => {
    if (status !== "active") return;
    const interval = setInterval(() => tick(), 1000);
    return () => clearInterval(interval);
  }, [status, tick]);

  // ─── Periodic autosave every 30 s ────────────────────────────────────────────
  useEffect(() => {
    if (status !== "active" || !sessionId) return;
    const interval = setInterval(() => void flushSession(), 30_000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, sessionId]);

  // ─── Session init / restore when questions load ──────────────────────────────
  useEffect(() => {
    if (loading || questions.length === 0 || sessionReady || !examType || !subject) return;

    const storageKey = sessionStorageKey(examType, subject);
    const existingId = localStorage.getItem(storageKey);

    async function init() {
      if (existingId && existingId !== "local" && user?.uid) {
        // ── Authenticated: restore from Firestore ──────────────────────────────
        try {
          const session = await getExamSession(existingId);
          if (session && session.status !== "completed") {
            // Recompute tallies from saved answers to ensure consistency
            let restoredCorrect = 0;
            let restoredWrong = 0;
            for (const [qId, ans] of Object.entries(session.answers)) {
              const q = questions.find((q) => q.id === qId);
              if (q) {
                if (ans === q.correct_answer) restoredCorrect++;
                else restoredWrong++;
              }
            }
            initSession(session.id, examType, subject, {
              answers: session.answers,
              correct: restoredCorrect,
              wrong: restoredWrong,
              currentIndex: session.current_index,
              elapsedTime: session.elapsed_time,
            });
            setSessionReady(true);
            return;
          }
        } catch {
          // Fall through — create a fresh session
        }
      } else if (existingId === "local") {
        // ── Unauthenticated: restore from localStorage state ──────────────────
        try {
          const raw = localStorage.getItem(localSessionDataKey(examType, subject));
          const data = raw ? (JSON.parse(raw) as {
            answers: Record<string, "A" | "B" | "C" | "D">;
            correct: number;
            wrong: number;
            currentIndex: number;
            elapsedTime: number;
          }) : null;
          if (data && typeof data.answers === "object") {
            // Recompute tallies from saved answers
            let restoredCorrect = 0;
            let restoredWrong = 0;
            for (const [qId, ans] of Object.entries(data.answers)) {
              const q = questions.find((q) => q.id === qId);
              if (q) {
                if (ans === q.correct_answer) restoredCorrect++;
                else restoredWrong++;
              }
            }
            initSession("local", examType, subject, {
              answers: data.answers,
              correct: restoredCorrect,
              wrong: restoredWrong,
              currentIndex: data.currentIndex ?? 0,
              elapsedTime: data.elapsedTime ?? 0,
            });
            setSessionReady(true);
            return;
          }
        } catch {
          // Fall through — create a fresh session
        }
      }
      await createFreshSession();
    }

    void init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, questions.length, sessionReady, examType, subject, user?.uid]);

  // ─── Navigation guard (browser close / hard refresh) ─────────────────────────
  useEffect(() => {
    const guard = (e: BeforeUnloadEvent) => {
      if (status === "active" || status === "paused") {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [status]);

  // ─── Firestore helpers ────────────────────────────────────────────────────────

  async function createFreshSession() {
    let newId = "local";
    if (user?.uid) {
      try {
        newId = await createExamSession(user.uid, {
          exam_type: examType,
          subject,
          answers: {},
          correct: 0,
          wrong: 0,
          current_index: 0,
          elapsed_time: 0,
          status: "active",
        });
      } catch {
        // Offline — fall back to local session
      }
    }
    // Always mark the session key so the Exams page can show "Resume Exam".
    localStorage.setItem(sessionStorageKey(examType, subject), newId);
    initSession(newId, examType, subject);
    setSessionReady(true);
  }

  function flushSession(overrideStatus?: "active" | "paused" | "completed") {
    const s = useExamStore.getState();

    // For local (unauthenticated / offline) sessions — persist state to localStorage.
    if (!s.sessionId || s.sessionId === "local" || !user?.uid) {
      const targetStatus = overrideStatus ?? s.status;
      if (targetStatus !== "completed") {
        try {
          localStorage.setItem(localSessionDataKey(examType, subject), JSON.stringify({
            answers: s.answers,
            correct: s.correct,
            wrong: s.wrong,
            currentIndex: s.currentIndex,
            elapsedTime: s.elapsedTime,
          }));
        } catch { /* storage full — best effort */ }
      }
      return Promise.resolve();
    }

    // Authenticated: persist to Firestore.
    return updateExamSession(s.sessionId, {
      answers: s.answers,
      correct: s.correct,
      wrong: s.wrong,
      current_index: s.currentIndex,
      elapsed_time: s.elapsedTime,
      status: overrideStatus ?? (s.status === "idle" ? "active" : (s.status === "completed" ? "completed" : s.status)),
    }).catch(() => { /* best-effort */ });
  }

  function scheduleSave() {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => void flushSession(), 3_000);
  }

  // ─── Format elapsed timer ─────────────────────────────────────────────────────

  const formatElapsed = useCallback((secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }, []);

  // ─── Actions ──────────────────────────────────────────────────────────────────

  function selectAnswer(letter: "A" | "B" | "C" | "D") {
    if (!question) return;
    const prevAnswer = answers[question.id];
    const prevWasCorrect = prevAnswer !== undefined ? prevAnswer === question.correct_answer : undefined;
    recordAnswer(question.id, letter, letter === question.correct_answer, prevWasCorrect);
    scheduleSave();
  }

  function toggleMark() {
    if (!question) return;
    setMarked((prev) => {
      const next = new Set(prev);
      if (next.has(question.id)) next.delete(question.id);
      else next.add(question.id);
      return next;
    });
  }

  async function handlePause() {
    pause();
    await flushSession("paused");
  }

  function handleResume() {
    resume();
  }

  async function handleRestart() {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    if (sessionId && sessionId !== "local" && user?.uid) {
      await deleteExamSession(sessionId).catch(() => {});
    }
    localStorage.removeItem(sessionStorageKey(examType, subject));
    localStorage.removeItem(localSessionDataKey(examType, subject));
    resetSession();
    setMarked(new Set());
    setSessionReady(false);
    // sessionReady → false will re-trigger the init effect → createFreshSession
  }

  async function saveAndLeave() {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    await flushSession("paused");
    pause();
    router.push("/exams");
  }

  async function handleSubmit() {
    if (submitting) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    setSubmitting(true);
    complete();

    const totalCorrect = questions.filter((q) => answers[q.id] === q.correct_answer).length;
    const totalWrong = total - totalCorrect - unanswered;
    const score = total > 0 ? Math.round((totalCorrect / total) * 100) : 0;

    // Resolve UID from context first, then fall back to the Firebase Auth
    // current user directly.  The context user can be null when the Django
    // backend session call fails mid-exam while Firebase Auth is still valid.
    const uid = user?.uid ?? auth.currentUser?.uid ?? null;

    if (uid) {
      try {
        const attemptId = await saveExamAttempt(uid, {
          exam_type: examType,
          subject,
          score,
          total_correct: totalCorrect,
          total_questions: total,
          time_spent_seconds: elapsedTime,
          answers,
        });

        await saveAnalytics(uid, {
          exam_type: examType,
          subject,
          score,
          correct: totalCorrect,
          wrong: totalWrong,
          total,
          percentage: score,
          time_taken: elapsedTime,
        }).catch(() => {});

        if (sessionId && sessionId !== "local") {
          await deleteExamSession(sessionId).catch(() => {});
        }
        localStorage.removeItem(sessionStorageKey(examType, subject));
        localStorage.removeItem(localSessionDataKey(examType, subject));

        router.push(`/exams/results/${attemptId}`);
        return;
      } catch {
        // Firestore save failed — fall through to unauthenticated path
      }
    }

    // Unauthenticated or Firestore unavailable — store results locally so the
    // user can still review them, then redirect to the local results screen.
    try {
      localStorage.setItem(
        "orki_last_result",
        JSON.stringify({
          exam_type: examType,
          subject,
          score,
          total_correct: totalCorrect,
          total_questions: total,
          time_spent_seconds: elapsedTime,
          answers,
          completed_at: new Date().toISOString(),
        }),
      );
    } catch { /* storage full — best effort */ }

    localStorage.removeItem(sessionStorageKey(examType, subject));
    localStorage.removeItem(localSessionDataKey(examType, subject));
    router.push("/exams/results/local");
  }

  // ─── Options ──────────────────────────────────────────────────────────────────

  const options: { letter: "A" | "B" | "C" | "D"; text: string }[] = question
    ? (
        [
          { letter: "A" as const, text: question.choices.A },
          { letter: "B" as const, text: question.choices.B },
          { letter: "C" as const, text: question.choices.C },
          { letter: "D" as const, text: question.choices.D },
        ] as { letter: "A" | "B" | "C" | "D"; text: string }[]
      ).filter((o) => o.text)
    : [];

  // ─── Guards ───────────────────────────────────────────────────────────────────

  if (loading || !sessionReady) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} />;
  if (questions.length === 0) return <ErrorScreen message="No questions found for this subject." />;

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
      {/* Pause overlay — hides question content while paused */}
      {status === "paused" && <PauseOverlay onResume={handleResume} />}

      {/* Exit confirmation modal */}
      {showExitModal && (
        <ExitConfirmationModal
          onConfirm={() => { setShowExitModal(false); void saveAndLeave(); }}
          onCancel={() => setShowExitModal(false)}
        />
      )}

      {/* Header bar */}
      <header className="sticky top-0 z-20 border-b border-border/30 bg-nav-bg backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3">

          {/* Left: exam info */}
          <div className="flex items-start gap-3">
            <svg width="20" height="20" viewBox="0 0 22 22" fill="none" className="mt-0.5 shrink-0 text-primary">
              <rect x="3.667" y="2.75" width="14.667" height="16.5" rx="2.2" stroke="currentColor" strokeWidth="1.6" />
              <path d="M7.333 7.333h7.334M7.333 11h7.334" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <div>
              <p className="text-sm font-bold text-foreground">{subject} Exam</p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">{examType}</p>
            </div>
          </div>

          {/* Center: elapsed timer + pause/resume */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-full bg-surface px-4 py-2">
              <svg width="15" height="15" viewBox="0 0 22 22" fill="none" className="text-muted">
                <circle cx="11" cy="11" r="8.25" stroke="currentColor" strokeWidth="1.6" />
                <path d="M11 6.875V11l2.75 2.75" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-heading text-lg font-bold tabular-nums text-foreground">
                {formatElapsed(elapsedTime)}
              </span>
            </div>

            {status === "active" ? (
              <button
                type="button"
                onClick={() => void handlePause()}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-surface transition-all hover:bg-black/8"
                title="Pause exam"
              >
                <svg width="14" height="14" viewBox="0 0 22 22" fill="none" className="text-foreground">
                  <rect x="5.5" y="3.667" width="3.667" height="14.667" rx="1.2" fill="currentColor" />
                  <rect x="12.833" y="3.667" width="3.667" height="14.667" rx="1.2" fill="currentColor" />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleResume}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 transition-all hover:bg-primary/20"
                title="Resume exam"
              >
                <svg width="14" height="14" viewBox="0 0 22 22" fill="none" className="text-primary">
                  <path d="M8.25 5.5 16.5 11l-8.25 5.5V5.5Z" fill="currentColor" />
                </svg>
              </button>
            )}
          </div>

          {/* Right: restart + exit + submit */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void handleRestart()}
              className="flex items-center gap-1.5 rounded-xl border border-border/60 bg-card-bg px-3 py-2 text-xs font-semibold text-muted transition-all hover:text-foreground hover:border-border"
              title="Restart exam"
            >
              <svg width="13" height="13" viewBox="0 0 22 22" fill="none">
                <path d="M3.667 11A7.333 7.333 0 1 1 11 18.333" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M3.667 15.583V11h4.583" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Restart
            </button>

            <button
              type="button"
              onClick={() => setShowExitModal(true)}
              className="flex items-center gap-1.5 rounded-xl border border-border/60 bg-card-bg px-3 py-2 text-xs font-semibold text-muted transition-all hover:text-foreground hover:border-border"
              title="Exit exam"
            >
              <svg width="13" height="13" viewBox="0 0 22 22" fill="none">
                <path d="M8.25 3.667H4.583A1.833 1.833 0 0 0 2.75 5.5v11a1.833 1.833 0 0 0 1.833 1.833H8.25" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M14.667 15.583 19.25 11l-4.583-4.583M19.25 11H8.25" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Exit
            </button>

            {unanswered === 0 && (
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={submitting}
                className="flex items-center gap-2 rounded-xl border border-border/60 bg-card-bg px-5 py-2 text-sm font-semibold text-foreground transition-all hover:bg-foreground hover:text-background disabled:opacity-50"
              >
                {submitting ? (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-muted/30 border-t-foreground" />
                ) : (
                  <svg width="14" height="14" viewBox="0 0 22 22" fill="none">
                    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                Submit
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        {/* Question meta */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-muted">
            Question {currentIndex + 1} of {total}
          </span>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {question?.topic ?? "Multiple Choice"}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-track mb-8">
          <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        {/* Question Card */}
        <div className="glass-strong rounded-[2.5rem] p-8 md:p-10 mb-6 bg-card-bg shadow-sm border border-border/60">
          <p className="font-heading text-[1.35rem] font-bold leading-relaxed text-foreground mb-8">
            {question?.question}
          </p>

          <div className="space-y-3 mb-8">
            {options.map((opt) => {
              const isSelected = question && answers[question.id] === opt.letter;
              return (
                <button
                  key={opt.letter}
                  type="button"
                  onClick={() => selectAnswer(opt.letter)}
                  className={`w-full flex items-start gap-4 rounded-2xl border p-5 text-left transition-all duration-200 ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border/60 bg-surface hover:border-primary/30 hover:bg-card-bg"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                      isSelected ? "bg-primary text-white" : "bg-track text-muted"
                    }`}
                  >
                    {opt.letter}
                  </span>
                  <span className={`text-sm leading-relaxed pt-1 ${isSelected ? "text-foreground font-semibold" : "text-secondary"}`}>
                    {opt.text}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={toggleMark}
              className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
                question && marked.has(question.id) ? "text-amber-600" : "text-muted hover:text-foreground"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 22 22" fill={question && marked.has(question.id) ? "currentColor" : "none"}>
                <path d="M5.5 3.667h11v14.666L11 14.667l-5.5 3.666V3.667Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              </svg>
              Mark for Review
            </button>
          </div>
        </div>
      </div>

      {/* Bottom navigation */}
      <footer className="sticky bottom-0 border-t border-border/30 bg-nav-bg backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          {/* Previous */}
          <button
            type="button"
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80 disabled:text-muted disabled:cursor-not-allowed"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M8.75 11.083 4.667 7l4.083-4.083" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Previous
          </button>

          {/* Question navigator */}
          <div className="flex flex-wrap items-center gap-1.5 max-w-xl justify-center">
            {questions.map((q, i) => {
              const isActive = i === currentIndex;
              const isAnswered = !!answers[q.id];
              const isMarked = marked.has(q.id);

              let bg = "bg-track text-muted";
              if (isActive) bg = "bg-primary text-white ring-2 ring-primary/30";
              else if (isMarked) bg = "bg-amber-100 text-amber-700";
              else if (isAnswered) bg = "bg-primary/20 text-primary";

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentIndex(i)}
                  className={`h-7 w-7 rounded-md text-[10px] font-bold transition-all ${bg}`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          {/* Next */}
          <button
            type="button"
            onClick={() => setCurrentIndex(Math.min(total - 1, currentIndex + 1))}
            disabled={currentIndex === total - 1}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary/90 disabled:opacity-50"
          >
            Next
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5.25 2.917 9.333 7 5.25 11.083" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </footer>
    </div>
  );
}

