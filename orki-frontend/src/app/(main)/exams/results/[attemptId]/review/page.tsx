"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { getExamAttempt, getQuestionsBySubject } from "@/shared/firebase/firestore";

// ─── Types ────────────────────────────────────────────────────────────────────

type IncorrectItem = {
  id: string;
  question_text: string;
  choices: { A: string; B: string; C?: string; D?: string };
  correct_answer: string;
  user_answer: string;
  explanation: string;
  category: string;
};

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
        Back to Results
      </button>
    </div>
  );
}

// ─── Answer choice row ────────────────────────────────────────────────────────

function ChoiceRow({
  letter,
  text,
  isCorrect,
  isUserAnswer,
}: {
  letter: string;
  text: string;
  isCorrect: boolean;
  isUserAnswer: boolean;
}) {
  let containerStyle = "border-border/30 bg-surface";
  if (isCorrect) containerStyle = "border-green-300 bg-green-50 dark:bg-green-950/20";
  if (isUserAnswer && !isCorrect) containerStyle = "border-red-300 bg-red-50 dark:bg-red-950/20";

  let badgeStyle = "bg-black/6 text-muted";
  if (isCorrect) badgeStyle = "bg-green-500 text-white";
  if (isUserAnswer && !isCorrect) badgeStyle = "bg-red-500 text-white";

  return (
    <div className={`flex items-start gap-3 rounded-xl border p-3 ${containerStyle}`}>
      <span
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${badgeStyle}`}
      >
        {letter}
      </span>
      <span className="text-sm text-foreground leading-relaxed">{text}</span>
      {isCorrect && (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="ml-auto mt-0.5 shrink-0 text-green-600">
          <path d="M3.5 7 5.833 9.333 10.5 4.667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {isUserAnswer && !isCorrect && (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="ml-auto mt-0.5 shrink-0 text-red-500">
          <path d="M3.5 3.5 10.5 10.5M10.5 3.5 3.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )}
    </div>
  );
}

// ─── Question card ────────────────────────────────────────────────────────────

function QuestionCard({ item, index }: { item: IncorrectItem; index: number }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Question header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start justify-between gap-3 p-4 md:p-5 text-left transition hover:bg-black/2"
      >
        <div className="flex items-start gap-3 min-w-0">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-[10px] font-bold text-red-600">
            {index + 1}
          </span>
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-semibold text-foreground leading-relaxed">
              {item.question_text}
            </p>
            <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-[10px] font-semibold text-muted">
              {item.category}
            </span>
          </div>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 14 14"
          fill="none"
          className={`shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Expandable answer detail */}
      {open && (
        <div className="border-t border-border/30 p-4 md:p-5 space-y-3 md:space-y-4">
          {/* Answer summary pills */}
          <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-red-600 dark:bg-red-950/30">
              <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                <path d="M3.5 3.5 10.5 10.5M10.5 3.5 3.5 10.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              Your answer: {item.user_answer}
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-green-700 dark:bg-green-950/30">
              <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                <path d="M2.5 7 5.5 10 11.5 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Correct: {item.correct_answer}
            </span>
          </div>

          {/* All choices */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {(["A", "B", "C", "D"] as const).map((letter) => {
              const text = item.choices[letter];
              if (!text) return null;
              return (
                <ChoiceRow
                  key={letter}
                  letter={letter}
                  text={text}
                  isCorrect={letter === item.correct_answer}
                  isUserAnswer={letter === item.user_answer}
                />
              );
            })}
          </div>

          {/* Explanation */}
          {item.explanation && (
            <div className="rounded-xl bg-primary/5 border border-primary/10 p-4">
              <p className="text-xs leading-relaxed text-foreground">
                <span className="font-semibold text-primary">Explanation: </span>
                {item.explanation}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReviewIncorrectPage() {
  const params = useParams();
  const attemptId = params.attemptId as string;
  const router = useRouter();

  const [items, setItems] = useState<IncorrectItem[]>([]);
  const [examTitle, setExamTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const attempt = await getExamAttempt(attemptId);
        if (!attempt) {
          setFetchError("Exam attempt not found.");
          return;
        }

        setExamTitle(`${attempt.subject} — ${attempt.exam_type}`);
        const questions = await getQuestionsBySubject(attempt.exam_type, attempt.subject, 500);

        // Guard: answers can be missing from old/incomplete Firestore docs.
        // Fall back to source_id lookup in case doc IDs changed after a re-import.
        const answersMap: Record<string, string> = attempt.answers ?? {};

        const incorrect: IncorrectItem[] = [];
        for (const q of questions) {
          const userAnswer = answersMap[q.id] ?? answersMap[q.source_id];
          if (!userAnswer || userAnswer === q.correct_answer) continue;
          incorrect.push({
            id: q.id,
            question_text: q.question,
            choices: q.choices,
            correct_answer: q.correct_answer,
            user_answer: userAnswer,
            explanation: q.explanation ?? "",
            category: q.topic || "General",
          });
        }
        setItems(incorrect);
      } catch (err) {
        console.error("[ReviewPage] Failed to load review data:", err);
        setFetchError("Failed to load review data. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [attemptId]);

  // ─── Derived ─────────────────────────────────────────────────────────────────

  const categories = useMemo(
    () => Array.from(new Set(items.map((i) => i.category))).sort(),
    [items],
  );

  const filtered = useMemo(() => {
    let list = items;
    if (activeCategory) list = list.filter((i) => i.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((i) => i.question_text.toLowerCase().includes(q));
    }
    return list;
  }, [items, activeCategory, search]);

  // ─── Guards ───────────────────────────────────────────────────────────────────

  if (loading) return <LoadingScreen />;
  if (fetchError) {
    return (
      <ErrorScreen
        message={fetchError}
        onBack={() => router.push(`/exams/results/${attemptId}`)}
      />
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="animate-page-in space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => router.push(`/exams/results/${attemptId}`)}
            className="mb-3 flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M8.75 11.083 4.667 7l4.083-4.083" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Results
          </button>
          <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Incorrect Answers
          </h1>
          <p className="mt-1 text-sm text-muted">
            {examTitle} &nbsp;·&nbsp;{" "}
            <span className="font-semibold text-red-500">{items.length} incorrect</span>
          </p>
        </div>

        {/* Stats pills */}
        <div className="hidden shrink-0 items-center gap-3 sm:flex">
          <div className="glass rounded-xl px-4 py-2 text-center">
            <p className="text-xl font-bold text-red-500">{items.length}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Incorrect</p>
          </div>
          <div className="glass rounded-xl px-4 py-2 text-center">
            <p className="text-xl font-bold text-foreground">{categories.length}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Categories</p>
          </div>
        </div>
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          >
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M10 10.5l2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions…"
            className="glass w-full rounded-xl py-2.5 pl-9 pr-4 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Category filter */}
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                activeCategory === null
                  ? "bg-primary text-white"
                  : "bg-surface text-muted hover:text-foreground"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  activeCategory === cat
                    ? "bg-primary text-white"
                    : "bg-surface text-muted hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results count */}
      {(search || activeCategory) && (
        <p className="text-xs text-muted">
          Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {items.length} items
        </p>
      )}

      {/* Question list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <svg width="40" height="40" viewBox="0 0 22 22" fill="none" className="text-muted/40">
            <circle cx="11" cy="11" r="8.25" stroke="currentColor" strokeWidth="1.6" />
            <path d="M11 7.333v4.584M11 13.75v.917" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <p className="text-sm font-medium text-muted">
            {items.length === 0 ? "No incorrect answers — great job!" : "No questions match your search."}
          </p>
          {(search || activeCategory) && (
            <button
              type="button"
              onClick={() => { setSearch(""); setActiveCategory(null); }}
              className="text-sm font-semibold text-primary hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item, i) => (
            <QuestionCard key={item.id} item={item} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
