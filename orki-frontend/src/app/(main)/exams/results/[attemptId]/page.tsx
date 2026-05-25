"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { ProgressRing } from "@/components/ui/progress-ring";
import { useAuth } from "@/hooks/useAuth";
import { auth } from "@/shared/firebase/client";
import {
  getExamAttempt,
  getPreviousAttempt,
  getQuestionsBySubject,
  saveConvertedFlashcardDeck,
  updateSubjectMastery,
} from "@/shared/firebase/firestore";

// ─── Types ────────────────────────────────────────────────────────────────────

type CategoryStat = { name: string; score: number; correct: number; total: number };
type IncorrectItem = {
  id: string;
  question_text: string;
  choices: { A: string; B: string; C?: string; D?: string };
  correct_answer: string;
  user_answer: string;
  explanation: string;
  category: string;
};

type ResultData = {
  score: number;
  total_correct: number;
  total_questions: number;
  exam_title: string;
  completed_at: Date | null;
  categories: CategoryStat[];
  incorrect: IncorrectItem[];
};

const CATEGORY_COLORS = ["#10B981", "#2FA2E2", "#8B5CF6", "#F59E0B", "#EF4444", "#06B6D4"];

// ─── Loading / Error helpers ──────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-border border-t-primary" />
    </div>
  );
}

function ErrorScreen({ message, onBack }: { message: string; onBack: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <p className="text-sm text-muted">{message}</p>
      <button
        type="button"
        onClick={onBack}
        className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
      >
        Back to Dashboard
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ExamResultsPage() {
  const params = useParams();
  const attemptId = params.attemptId as string;
  const router = useRouter();
  const { user } = useAuth();

  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [convertingToFlashcards, setConvertingToFlashcards] = useState(false);
  const [flashcardsCreated, setFlashcardsCreated] = useState(false);
  const [flashcardsCount, setFlashcardsCount] = useState(0);
  const [convertError, setConvertError] = useState<string | null>(null);
  /** Attempt number + previous score for comparison display. Null until loaded. */
  const [attemptMeta, setAttemptMeta] = useState<{
    number: number;
    prevScore: number | null;
  } | null>(null);

  useEffect(() => {
    async function loadLocal() {
      try {
        const raw = localStorage.getItem("orki_last_result");
        if (raw) {
          const data = JSON.parse(raw) as {
            exam_type: string;
            subject: string;
            score: number;
            total_correct: number;
            total_questions: number;
            completed_at: string;
          };
          setResult({
            score: data.score,
            total_correct: data.total_correct,
            total_questions: data.total_questions,
            exam_title: `${data.subject} — ${data.exam_type}`,
            completed_at: data.completed_at ? new Date(data.completed_at) : null,
            categories: [],
            incorrect: [],
          });
        } else {
          setFetchError(
            "Results are not available. Sign in to save and view detailed results.",
          );
        }
      } catch {
        setFetchError("Could not load local results.");
      } finally {
        setLoading(false);
      }
    }

    // ── Local / unauthenticated fallback ──────────────────────────────────────
    if (attemptId === "local") {
      void loadLocal();
      return;
    }

    async function load() {
      try {
        const attempt = await getExamAttempt(attemptId);
        if (!attempt) {
          setFetchError("Exam results not found.");
          return;
        }

        const questions = await getQuestionsBySubject(attempt.exam_type, attempt.subject, 500);

        // Guard: answers can be missing from old/incomplete Firestore docs.
        // Fall back to source_id lookup in case doc IDs changed after a re-import.
        const answersMap: Record<string, string> = attempt.answers ?? {};

        // ─── Per-question breakdown ───────────────────────────────────────────
        const incorrectItems: IncorrectItem[] = [];
        const topicMap: Record<string, { correct: number; total: number }> = {};

        for (const q of questions) {
          const userAnswer = answersMap[q.id] ?? answersMap[q.source_id];
          if (!userAnswer) continue; // unanswered — skip from breakdown

          const topic = q.topic || "General";
          if (!topicMap[topic]) topicMap[topic] = { correct: 0, total: 0 };
          topicMap[topic].total++;

          if (userAnswer === q.correct_answer) {
            topicMap[topic].correct++;
          } else {
            incorrectItems.push({
              id: q.id,
              question_text: q.question,
              choices: q.choices,
              correct_answer: q.correct_answer,
              user_answer: userAnswer,
              explanation: q.explanation ?? "",
              category: topic,
            });
          }
        }

        const categories: CategoryStat[] = Object.entries(topicMap).map(([name, stat]) => ({
          name,
          score: stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0,
          correct: stat.correct,
          total: stat.total,
        }));

        setResult({
          score: attempt.score,
          total_correct: attempt.total_correct,
          total_questions: attempt.total_questions,
          exam_title: `${attempt.subject} — ${attempt.exam_type}`,
          completed_at: attempt.completed_at,
          categories,
          incorrect: incorrectItems,
        });

        // ─── Update subject analytics (flat /analytics/{uid}) ──────────────────
        const uid = user?.uid ?? auth.currentUser?.uid;
        if (uid) {
          try {
            await updateSubjectMastery(
              uid,
              attempt.exam_type,
              attempt.subject,
              attempt.score,
              attempt.time_spent_seconds ?? 0
            );
          } catch (analyticsErr) {
            // Log silently — don't fail page load if analytics update fails
            console.warn("[ExamResults] Analytics update failed:", analyticsErr);
          }
        }
        // ─── Attempt comparison metadata (non-critical) ─────────────────────────────
        if (typeof attempt.attempt_number === "number") {
          let prevScore: number | null = null;
          if (uid && attempt.attempt_number > 1) {
            try {
              const prev = await getPreviousAttempt(
                uid,
                attempt.exam_type,
                attempt.subject,
                attempt.attempt_number,
              );
              prevScore = prev?.score ?? null;
            } catch {
              // Non-critical — display attempt number without score comparison
            }
          }
          setAttemptMeta({ number: attempt.attempt_number, prevScore });
        }      } catch (err) {
        console.error("[ExamResults] Failed to load attempt:", err);
        setFetchError("Failed to load results. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [attemptId, user?.uid]);

  async function handleConvertToFlashcards() {
    if (!result || convertingToFlashcards || flashcardsCreated) return;
    if (result.incorrect.length === 0) {
      setConvertError("No incorrect answers to convert — great job!");
      return;
    }
    setConvertError(null);
    setConvertingToFlashcards(true);

    try {
      const uid = user?.uid ?? auth.currentUser?.uid ?? null;
      if (!uid) throw new Error("Not authenticated");

      const deckName = `${result.exam_title} (${
        result.completed_at
          ? result.completed_at.toLocaleDateString()
          : new Date().toLocaleDateString()
      })`;

      const cards = result.incorrect.map((q) => ({
        id: q.id,
        front: q.question_text,
        back: q.choices[q.correct_answer as "A" | "B" | "C" | "D"] ?? q.correct_answer,
        explanation: q.explanation,
        category: q.category,
        choices: q.choices,
        correct_answer: q.correct_answer,
      }));

      await saveConvertedFlashcardDeck(uid, deckName, attemptId, cards);
      setFlashcardsCount(cards.length);
      setFlashcardsCreated(true);
    } catch (err) {
      console.error("[ExamResults] Failed to convert flashcards:", err);
      setConvertError("Failed to create flashcards. Please try again.");
    } finally {
      setConvertingToFlashcards(false);
    }
  }

  if (loading) return <LoadingScreen />;
  if (fetchError || !result) {
    return <ErrorScreen message={fetchError ?? "Results unavailable."} onBack={() => router.push("/dashboard")} />;
  }

  const scoreLabel = result.score >= 80 ? "Solid work!" : result.score >= 60 ? "Good effort!" : "Keep pushing!";
  const scoreMessage = result.score >= 80
    ? "You've shown strong mastery in core concepts. Keep refining the areas below to reach your peak."
    : result.score >= 60
    ? "You're making progress! Focus on your weaker categories to improve your overall score."
    : "Don't give up! Review the incorrect answers and convert them to flashcards for better retention.";

  return (
    <div className="animate-page-in space-y-5 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-4xl font-bold tracking-tight text-foreground">
            Exam Results
          </h1>
          <p className="text-sm md:text-base text-muted mt-1">
            {result.exam_title}
            {result.completed_at ? ` • ${result.completed_at.toLocaleDateString()}` : " • Completed"}
          </p>
          {attemptMeta && (
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                Attempt #{attemptMeta.number}
              </span>
              {attemptMeta.prevScore !== null && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    result.score > attemptMeta.prevScore
                      ? "bg-emerald-500/10 text-emerald-600"
                      : result.score < attemptMeta.prevScore
                        ? "bg-red-500/10 text-red-500"
                        : "bg-muted/20 text-muted"
                  }`}
                >
                  {result.score > attemptMeta.prevScore ? "↑" : result.score < attemptMeta.prevScore ? "↓" : "→"}{" "}
                  {result.score > attemptMeta.prevScore ? "+" : ""}
                  {result.score - attemptMeta.prevScore}% vs last attempt
                </span>
              )}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-sm font-medium text-muted hover:text-foreground transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M8.75 11.083 4.667 7l4.083-4.083" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Dashboard
        </button>
      </div>

      {/* Score + Next Steps row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-5">
        {/* Overall Performance card */}
        <div className="md:col-span-3 glass rounded-2xl p-5 md:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5 md:gap-8">
          <div className="flex-1 space-y-3">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider">Overall Performance</p>
            <div className="flex items-end gap-2">
              <span className="font-heading text-5xl md:text-7xl font-bold text-foreground leading-none">{result.score}</span>
              <span className="text-2xl font-medium text-muted mb-2">/100</span>
            </div>
            <div className="flex items-center gap-4 text-sm font-semibold">
              <span className="text-emerald-600">{result.total_correct} correct</span>
              <span className="text-red-500">{result.total_questions - result.total_correct} wrong</span>
              <span className="text-muted">{result.total_questions} total</span>
            </div>
            {attemptMeta !== null && attemptMeta.prevScore !== null && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-muted">Previous attempt:</span>
                <span className="text-xs font-semibold text-muted">{attemptMeta.prevScore}%</span>
                <span
                  className={`text-xs font-bold ${
                    result.score > attemptMeta.prevScore
                      ? "text-emerald-600"
                      : result.score < attemptMeta.prevScore
                        ? "text-red-500"
                        : "text-muted"
                  }`}
                >
                  {result.score > attemptMeta.prevScore
                    ? `+${result.score - attemptMeta.prevScore}%`
                    : result.score < attemptMeta.prevScore
                      ? `${result.score - attemptMeta.prevScore}%`
                      : "No change"}
                </span>
              </div>
            )}
            <p className="text-sm text-muted leading-relaxed max-w-sm">{scoreLabel} {scoreMessage}</p>
          </div>
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="md:hidden">
              <ProgressRing value={result.score} size={80} strokeWidth={8} color="#10B981" label={`${result.score}%`} sublabel="" />
            </div>
            <div className="hidden md:block">
              <ProgressRing value={result.score} size={110} strokeWidth={10} color="#10B981" label={`${result.score}%`} sublabel="" />
            </div>
          </div>
        </div>

        {/* Next Steps card */}
        <div className="md:col-span-2 rounded-2xl p-4 md:p-6 flex flex-col gap-4" style={{ background: "linear-gradient(135deg, rgba(217,179,140,0.15) 0%, rgba(245,234,222,0.4) 100%)", border: "1px solid rgba(217,179,140,0.25)" }}>
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 22 22" fill="none" className="text-amber-700">
              <circle cx="11" cy="11" r="8.25" stroke="currentColor" strokeWidth="1.6" />
              <path d="M11 7.333v3.667l2.75 2.75" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700">Next Steps</span>
          </div>
          <h3 className="font-heading text-xl font-bold text-foreground leading-snug">
            Turn gaps into growth.
          </h3>
          <p className="text-sm text-muted leading-relaxed">
            You have {result.incorrect.length} incorrect answers. Reviewing them now increases retention by 40%.
          </p>

          <button
            type="button"
            onClick={() => router.push(`/exams/results/${attemptId}/review`)}
            className="flex items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-3 text-sm font-bold text-background transition-all hover:opacity-90"
          >
            <svg width="14" height="14" viewBox="0 0 22 22" fill="none">
              <rect x="3.667" y="2.75" width="14.667" height="16.5" rx="2.2" stroke="currentColor" strokeWidth="1.6" />
              <path d="M7.333 7.333h7.334M7.333 11h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            Review Incorrect Answers
          </button>

          <button
            type="button"
            onClick={() => void handleConvertToFlashcards()}
            disabled={convertingToFlashcards || flashcardsCreated}
            className="flex items-center justify-center gap-2 rounded-xl border border-border/70 bg-card-bg px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-surface disabled:opacity-60"
          >
            {convertingToFlashcards ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-muted/30 border-t-foreground" />
                Converting…
              </>
            ) : flashcardsCreated ? (
              <>
                <svg width="14" height="14" viewBox="0 0 22 22" fill="none">
                  <path d="M9 12l2 2 4-4" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Flashcards Created! ({flashcardsCount})
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 22 22" fill="none">
                  <rect x="2.75" y="6.417" width="16.5" height="11" rx="2.2" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M11 10.083v3.667M9.167 11.917h3.666" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                Convert to Flashcards
              </>
            )}
          </button>

          {flashcardsCreated && (
            <button
              type="button"
              onClick={() => router.push("/flashcards")}
              className="flex items-center justify-center gap-1.5 text-xs font-semibold text-primary transition hover:underline"
            >
              View in Flashcards →
            </button>
          )}
          {convertError && (
            <p className="text-xs text-red-500 text-center">{convertError}</p>
          )}
        </div>
      </div>

      {/* Performance by Category */}
      <div className="glass rounded-2xl p-4 md:p-6 space-y-4 md:space-y-5">
        <h2 className="font-heading text-base md:text-xl font-bold text-foreground">Performance by Category</h2>
        {result.categories.length === 0 ? (
          <p className="text-sm text-muted py-4 text-center">
            Category breakdown is not available for this attempt.
          </p>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {result.categories.map((cat, i) => {
            const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
            const feedback = cat.score >= 90 ? "Excellent grasp of core principles."
              : cat.score >= 80 ? "Strong deductive skills demonstrated."
              : cat.score >= 70 ? "Review statistical formulas in Module 3."
              : "Needs focused practice to improve.";
            return (
              <div key={cat.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 22 22" fill="none">
                      <circle cx="11" cy="11" r="6" stroke={color} strokeWidth="2" />
                    </svg>
                    <span className="text-sm font-bold text-foreground">{cat.name}</span>
                  </div>
                  <span className="text-sm font-bold" style={{ color }}>{cat.score}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-black/6">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${cat.score}%`, backgroundColor: color }} />
                </div>
                <p className="text-xs text-muted">{feedback}</p>
              </div>
            );
          })}
        </div>
        )}
      </div>

    </div>
  );
}
