"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import type { MockExamQuestion } from "@/entities/exams/types";

// ─── Mock Data for demo (replace with API calls) ─────────────────────────────

const MOCK_QUESTIONS: MockExamQuestion[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  question_text: [
    "During cellular respiration, which of the following stages is primarily responsible for the generation of the largest amount of ATP, and where does this process physically occur within a eukaryotic cell?",
    "Which of the following best describes the concept of judicial review in the Philippine legal system?",
    "If the sequence 3, 9, 27, 81, ... continues, what is the 8th term?",
    "In educational psychology, which learning theory emphasizes that knowledge is constructed through social interaction?",
    "What is the primary function of the mitochondria in a cell?",
    "Which amendment to the Philippine Constitution guarantees the right to free speech?",
    "If a train travels 120 km in 2 hours, what is its average speed?",
    "Which of the following is a characteristic of effective classroom management?",
    "The process by which plants convert sunlight into chemical energy is called:",
    "In Filipino grammar, which part of speech modifies a noun?",
  ][i % 10],
  question_type: "multiple_choice" as const,
  category: ["General Information", "Applied Mathematics", "Logical Reasoning", "Reading Comprehension", "Science"][i % 5],
  option_a: ["Glycolysis; occurring in the cytoplasm", "The power of courts to declare laws unconstitutional", "6,561", "Social Constructivism", "Energy production (ATP synthesis)"][i % 5],
  option_b: ["Electron Transport Chain (Oxidative Phosphorylation); occurring across the inner mitochondrial membrane", "The power of the president to veto laws", "2,187", "Behaviorism", "Protein synthesis"][i % 5],
  option_c: ["Krebs Cycle (Citric Acid Cycle); occurring in the mitochondrial matrix", "The power of Congress to impeach officials", "19,683", "Cognitivism", "Cell division"][i % 5],
  option_d: ["Fermentation; occurring in the cytoplasm", "The power of the judiciary to interpret treaties", "59,049", "Connectivism", "Waste removal"][i % 5],
  order: i + 1,
}));

const EXAM_TITLE = "Biology 101: Cellular Metabolism";
const EXAM_DURATION = 120; // minutes

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ExamTakePage() {
  const params = useParams();
  const router = useRouter();
  const examId = Number(params.id);

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [marked, setMarked] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION * 60); // seconds
  const [submitted, setSubmitted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const formatTime = useCallback((secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }, []);

  const question = MOCK_QUESTIONS[currentQ];
  const total = MOCK_QUESTIONS.length;
  const progress = ((currentQ + 1) / total) * 100;

  function selectAnswer(letter: string) {
    setAnswers((prev) => ({ ...prev, [question.id]: letter }));
  }

  function toggleMark() {
    setMarked((prev) => {
      const next = new Set(prev);
      if (next.has(question.id)) next.delete(question.id);
      else next.add(question.id);
      return next;
    });
  }

  function handleSubmit() {
    if (timerRef.current) clearInterval(timerRef.current);
    setSubmitted(true);
    // In production: submitExamAttempt(attemptId, EXAM_DURATION * 60 - timeLeft)
    // Navigate to results
    router.push(`/exams/results/${examId}`);
  }

  const options = [
    { letter: "A", text: question.option_a },
    { letter: "B", text: question.option_b },
    { letter: "C", text: question.option_c },
    { letter: "D", text: question.option_d },
  ].filter((o) => o.text);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
      {/* Header bar */}
      <header className="sticky top-0 z-20 border-b border-border/30 bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <svg width="20" height="20" viewBox="0 0 22 22" fill="none" className="text-primary">
              <rect x="3.667" y="2.75" width="14.667" height="16.5" rx="2.2" stroke="currentColor" strokeWidth="1.6" />
              <path d="M7.333 7.333h7.334M7.333 11h7.334" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <div>
              <p className="text-sm font-bold text-foreground">{EXAM_TITLE}</p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">Midterm Examination</p>
            </div>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-2 rounded-full bg-surface px-4 py-2">
            <svg width="16" height="16" viewBox="0 0 22 22" fill="none" className="text-muted">
              <circle cx="11" cy="11" r="8.25" stroke="currentColor" strokeWidth="1.6" />
              <path d="M11 6.875V11l2.75 2.75" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className={`font-heading text-lg font-bold tabular-nums ${timeLeft < 300 ? "text-red-500" : "text-foreground"}`}>
              {formatTime(timeLeft)}
            </span>
          </div>

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-2 rounded-xl border border-border/60 bg-white px-5 py-2 text-sm font-semibold text-foreground transition-all hover:bg-foreground hover:text-background"
          >
            Submit Exam
            <svg width="14" height="14" viewBox="0 0 22 22" fill="none">
              <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        {/* Question meta */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-muted">
            Question {currentQ + 1} of {total}
          </span>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Multiple Choice
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/[0.06] mb-8">
          <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        {/* Unified Question Card */}
        <div className="glass-strong rounded-[2.5rem] p-8 md:p-10 mb-6 bg-white shadow-sm border border-border/60">
          <p className="font-heading text-[1.35rem] font-bold leading-relaxed text-foreground mb-8">
            {question.question_text}
          </p>

          <div className="space-y-3 mb-8">
            {options.map((opt) => {
              const isSelected = answers[question.id] === opt.letter;
              return (
                <button
                  key={opt.letter}
                  type="button"
                  onClick={() => selectAnswer(opt.letter)}
                  className={`w-full flex items-start gap-4 rounded-2xl border p-5 text-left transition-all duration-200 ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border/60 bg-slate-50/50 hover:border-primary/30 hover:bg-white"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                      isSelected
                        ? "bg-primary text-white"
                        : "bg-black/[0.05] text-muted"
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
                marked.has(question.id) ? "text-amber-600" : "text-muted hover:text-foreground"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 22 22" fill={marked.has(question.id) ? "currentColor" : "none"}>
                <path d="M5.5 3.667h11v14.666L11 14.667l-5.5 3.666V3.667Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              </svg>
              Mark for Review
            </button>
          </div>
        </div>
      </div>

      {/* Bottom navigation */}
      <footer className="sticky bottom-0 border-t border-border/30 bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          {/* Previous */}
          <button
            type="button"
            onClick={() => setCurrentQ((q) => Math.max(0, q - 1))}
            disabled={currentQ === 0}
            className="flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80 disabled:text-muted disabled:cursor-not-allowed"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M8.75 11.083 4.667 7l4.083-4.083" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Previous
          </button>

          {/* Question navigator */}
          <div className="flex flex-wrap items-center gap-1.5 max-w-xl justify-center">
            {MOCK_QUESTIONS.map((q, i) => {
              const isActive = i === currentQ;
              const isAnswered = !!answers[q.id];
              const isMarked = marked.has(q.id);

              let bg = "bg-black/[0.06] text-muted";
              if (isActive) bg = "bg-primary text-white ring-2 ring-primary/30";
              else if (isMarked) bg = "bg-amber-100 text-amber-700";
              else if (isAnswered) bg = "bg-primary/20 text-primary";

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentQ(i)}
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
            onClick={() => setCurrentQ((q) => Math.min(total - 1, q + 1))}
            disabled={currentQ === total - 1}
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
