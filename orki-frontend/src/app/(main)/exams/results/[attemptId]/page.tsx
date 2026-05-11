"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { ProgressRing } from "@/components/ui/progress-ring";

// ─── Mock Results Data ────────────────────────────────────────────────────────

const MOCK_RESULT = {
  score: 85,
  total_correct: 42,
  total_questions: 50,
  percentile: 85,
  exam_title: "Comprehensive Practice Exam #4",
  completed_at: new Date().toISOString(),
  categories: [
    { name: "General Information", score: 90, correct: 9, total: 10 },
    { name: "Applied Mathematics", score: 70, correct: 7, total: 10 },
    { name: "Logical Reasoning", score: 85, correct: 17, total: 20 },
    { name: "Reading Comprehension", score: 95, correct: 19, total: 20 },
  ],
  incorrect: [
    { id: 1, question_text: "What is the square root of 144?", option_a: "10", option_b: "12", option_c: "14", option_d: "16", correct_answer: "B", user_answer: "A", explanation: "The square root of 144 is 12 (12 × 12 = 144).", category: "Applied Mathematics" },
    { id: 2, question_text: "Which planet is closest to the Sun?", option_a: "Venus", option_b: "Mars", option_c: "Mercury", option_d: "Earth", correct_answer: "C", user_answer: "A", explanation: "Mercury is the closest planet to the Sun.", category: "General Information" },
    { id: 3, question_text: "If all roses are flowers and some flowers are red, which conclusion is valid?", option_a: "All roses are red", option_b: "Some roses may be red", option_c: "No roses are red", option_d: "All red things are roses", correct_answer: "B", user_answer: "A", explanation: "We can only conclude that some roses may be red, as 'some flowers are red' doesn't specify which flowers.", category: "Logical Reasoning" },
    { id: 4, question_text: "What is 15% of 240?", option_a: "34", option_b: "36", option_c: "38", option_d: "40", correct_answer: "B", user_answer: "D", explanation: "15% of 240 = 0.15 × 240 = 36.", category: "Applied Mathematics" },
    { id: 5, question_text: "Who wrote 'Noli Me Tangere'?", option_a: "Andres Bonifacio", option_b: "Jose Rizal", option_c: "Apolinario Mabini", option_d: "Emilio Aguinaldo", correct_answer: "B", user_answer: "C", explanation: "Jose Rizal wrote 'Noli Me Tangere', published in 1887.", category: "General Information" },
    { id: 6, question_text: "What is the LCM of 12 and 18?", option_a: "24", option_b: "36", option_c: "48", option_d: "72", correct_answer: "B", user_answer: "A", explanation: "LCM of 12 and 18 is 36.", category: "Applied Mathematics" },
    { id: 7, question_text: "In the analogy: book is to library as artifact is to ___", option_a: "Gallery", option_b: "Museum", option_c: "School", option_d: "Archive", correct_answer: "B", user_answer: "D", explanation: "A museum stores artifacts, just as a library stores books.", category: "Logical Reasoning" },
    { id: 8, question_text: "What is the derivative of x²?", option_a: "x", option_b: "2x", option_c: "x²", option_d: "2x²", correct_answer: "B", user_answer: "A", explanation: "Using the power rule, d/dx(x²) = 2x.", category: "Applied Mathematics" },
  ],
};

const CATEGORY_COLORS = ["#10B981", "#2FA2E2", "#8B5CF6", "#F59E0B", "#EF4444", "#06B6D4"];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ExamResultsPage() {
  const router = useRouter();
  const [showReview, setShowReview] = useState(false);
  const [convertingToFlashcards, setConvertingToFlashcards] = useState(false);
  const [flashcardsCreated, setFlashcardsCreated] = useState(false);

  const result = MOCK_RESULT;
  const scoreLabel = result.score >= 80 ? "Solid work!" : result.score >= 60 ? "Good effort!" : "Keep pushing!";
  const scoreMessage = result.score >= 80
    ? "You've shown strong mastery in core concepts. A little more focus on mathematical applications will push you into the top percentile."
    : result.score >= 60
    ? "You're making progress! Focus on your weaker categories to improve your overall score."
    : "Don't give up! Review the incorrect answers and convert them to flashcards for better retention.";

  function handleConvertToFlashcards() {
    setConvertingToFlashcards(true);
    // In production: bulkCreateFlashcards(...)
    setTimeout(() => {
      setConvertingToFlashcards(false);
      setFlashcardsCreated(true);
    }, 1500);
  }

  return (
    <div className="animate-page-in space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground">
            Exam Results
          </h1>
          <p className="text-base text-muted mt-1">
            {result.exam_title} • Completed Today
          </p>
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
      <div className="grid grid-cols-5 gap-5">
        {/* Overall Performance card */}
        <div className="col-span-3 glass rounded-2xl p-8 flex items-center gap-8">
          <div className="flex-1 space-y-3">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider">Overall Performance</p>
            <div className="flex items-end gap-2">
              <span className="font-heading text-7xl font-bold text-foreground leading-none">{result.score}</span>
              <span className="text-2xl font-medium text-muted mb-2">/100</span>
            </div>
            <p className="text-sm text-muted leading-relaxed max-w-sm">{scoreLabel} {scoreMessage}</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <ProgressRing
              value={result.percentile}
              size={110}
              strokeWidth={10}
              color="#10B981"
              label={`${result.percentile}%`}
              sublabel=""
            />
            <span className="text-xs font-semibold text-success">Top {100 - result.percentile}%</span>
          </div>
        </div>

        {/* Next Steps card */}
        <div className="col-span-2 rounded-2xl p-6 flex flex-col gap-4" style={{ background: "linear-gradient(135deg, rgba(217,179,140,0.15) 0%, rgba(245,234,222,0.4) 100%)", border: "1px solid rgba(217,179,140,0.25)" }}>
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
            onClick={() => setShowReview(true)}
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
            onClick={handleConvertToFlashcards}
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
                Flashcards Created!
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
        </div>
      </div>

      {/* Performance by Category */}
      <div className="glass rounded-2xl p-6 space-y-5">
        <h2 className="font-heading text-xl font-bold text-foreground">Performance by Category</h2>
        <div className="grid grid-cols-2 gap-6">
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
                <div className="h-2 overflow-hidden rounded-full bg-black/[0.06]">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${cat.score}%`, backgroundColor: color }} />
                </div>
                <p className="text-xs text-muted">{feedback}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Incorrect Answers Modal/Section */}
      {showReview && (
        <div className="glass rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold text-foreground">
              Review Incorrect Answers ({result.incorrect.length})
            </h2>
            <button
              type="button"
              onClick={() => setShowReview(false)}
              className="rounded-xl bg-black/[0.05] px-3 py-1.5 text-xs font-medium text-muted transition hover:bg-black/[0.08]"
            >
              ✕ Close
            </button>
          </div>

          <div className="space-y-4">
            {result.incorrect.map((q, i) => (
              <div key={q.id} className="rounded-2xl border border-border/40 bg-surface p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted">Question {i + 1} • {q.category}</span>
                  <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600">Incorrect</span>
                </div>
                <p className="text-sm font-semibold text-foreground leading-relaxed">{q.question_text}</p>
                
                <div className="grid grid-cols-2 gap-2">
                  {["A", "B", "C", "D"].map((letter) => {
                    const text = letter === "A" ? q.option_a : letter === "B" ? q.option_b : letter === "C" ? q.option_c : q.option_d;
                    if (!text) return null;
                    const isCorrect = letter === q.correct_answer;
                    const isUserAnswer = letter === q.user_answer;
                    
                    let styles = "border-border/30 bg-surface";
                    if (isCorrect) styles = "border-green-300 bg-green-50";
                    if (isUserAnswer && !isCorrect) styles = "border-red-300 bg-red-50";
                    
                    return (
                      <div key={letter} className={`flex items-center gap-2 rounded-xl border p-3 ${styles}`}>
                        <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                          isCorrect ? "bg-green-500 text-white" : isUserAnswer ? "bg-red-500 text-white" : "bg-black/[0.06] text-muted"
                        }`}>
                          {letter}
                        </span>
                        <span className="text-xs text-foreground">{text}</span>
                        {isCorrect && <svg width="12" height="12" viewBox="0 0 14 14" fill="none" className="ml-auto text-green-600"><path d="M4 7l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                        {isUserAnswer && !isCorrect && <svg width="12" height="12" viewBox="0 0 14 14" fill="none" className="ml-auto text-red-500"><path d="M4 4l6 6M10 4l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>}
                      </div>
                    );
                  })}
                </div>
                
                {q.explanation && (
                  <div className="rounded-xl bg-primary/5 border border-primary/10 p-3">
                    <p className="text-xs text-foreground"><span className="font-semibold text-primary">Explanation:</span> {q.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
