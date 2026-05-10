"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { MockExam } from "@/entities/exams/types";

// ─── Mock Catalog Data ────────────────────────────────────────────────────────

const MOCK_CATALOG: MockExam[] = [
  {
    id: 1, title: "Analytical & Logical Reasoning Mastery", description: "Comprehensive practice covering syllogisms, sequence completion, and abstract reasoning patterns.",
    category: "CSE_PROF", category_display: "CSE Professional", subject: "Logical Reasoning", difficulty: "advanced", difficulty_display: "Advanced",
    question_count: 50, duration_minutes: 60, last_score: null,
  },
  {
    id: 2, title: "Mathematics & Quantitative Methods", description: "Focus on foundational mathematics, algebra, geometry, and statistical analysis.",
    category: "LET_GENED", category_display: "LET General Education", subject: "Mathematics", difficulty: "intermediate", difficulty_display: "Intermediate",
    question_count: 75, duration_minutes: 90, last_score: null,
  },
  {
    id: 3, title: "Clerical Operations & Spelling", description: "Targeted drills on filing systems, alphabetizing, basic office procedures, and spelling accuracy.",
    category: "CSE_SUBPROF", category_display: "CSE Sub-Professional", subject: "Clerical", difficulty: "beginner", difficulty_display: "Beginner",
    question_count: 40, duration_minutes: 45, last_score: null,
  },
  {
    id: 4, title: "Principles of Teaching & Learning", description: "Deep dive into pedagogical theories, curriculum development, and assessment strategies.",
    category: "LET_PROFEDU", category_display: "LET Professional Education", subject: "Education", difficulty: "advanced", difficulty_display: "Advanced",
    question_count: 100, duration_minutes: 120, last_score: null,
  },
  {
    id: 5, title: "English Vocabulary & Grammar", description: "Extensive test on reading comprehension, vocabulary, and grammar proficiency.",
    category: "CSE_PROF", category_display: "CSE Professional", subject: "English", difficulty: "intermediate", difficulty_display: "Intermediate",
    question_count: 60, duration_minutes: 75, last_score: null,
  },
  {
    id: 6, title: "Science & Environmental Studies", description: "Biological, physical sciences, and environmental concepts aligned with LET coverage.",
    category: "LET_GENED", category_display: "LET General Education", subject: "Science", difficulty: "intermediate", difficulty_display: "Intermediate",
    question_count: 50, duration_minutes: 60, last_score: 88,
  },
  {
    id: 7, title: "Philippine Constitution & Government", description: "Comprehensive coverage of constitutional law, government structure, and civic responsibilities.",
    category: "CSE_PROF", category_display: "CSE Professional", subject: "Government", difficulty: "intermediate", difficulty_display: "Intermediate",
    question_count: 45, duration_minutes: 55, last_score: null,
  },
  {
    id: 8, title: "General Information & Current Events", description: "Knowledge on Philippine history, current affairs, and general culture.",
    category: "CSE_SUBPROF", category_display: "CSE Sub-Professional", subject: "General Info", difficulty: "beginner", difficulty_display: "Beginner",
    question_count: 40, duration_minutes: 45, last_score: 72,
  },
  {
    id: 9, title: "Filipino Language & Communication", description: "Comprehensive Filipino language proficiency, grammar, and reading comprehension.",
    category: "LET_GENED", category_display: "LET General Education", subject: "Filipino", difficulty: "intermediate", difficulty_display: "Intermediate",
    question_count: 50, duration_minutes: 60, last_score: null,
  },
];

const CATEGORIES = [
  { key: "", label: "All Exams" },
  { key: "CSE_PROF", label: "CSE Professional" },
  { key: "CSE_SUBPROF", label: "CSE Sub-Professional" },
  { key: "LET_GENED", label: "LET Gen Ed" },
  { key: "LET_PROFEDU", label: "LET Prof Ed" },
];

const DIFFICULTY_COLORS = {
  beginner: { bg: "rgba(16,185,129,0.1)", text: "#059669" },
  intermediate: { bg: "rgba(245,158,11,0.1)", text: "#D97706" },
  advanced: { bg: "rgba(239,68,68,0.1)", text: "#DC2626" },
};

export default function ExamsPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");

  const filtered = MOCK_CATALOG.filter((exam) => {
    if (activeCategory && exam.category !== activeCategory) return false;
    if (subjectFilter && !exam.subject.toLowerCase().includes(subjectFilter.toLowerCase())) return false;
    if (difficultyFilter && exam.difficulty !== difficultyFilter) return false;
    return true;
  });

  const subjects = [...new Set(MOCK_CATALOG.map((e) => e.subject))];

  return (
    <div className="animate-page-in space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground">
          Exam Library
        </h1>
        <p className="text-base text-muted max-w-lg">
          Curated practice modules tailored for your certification. Select a category below to begin a focused session.
        </p>
      </div>

      {/* Filters row */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Category tabs */}
        <div className="flex items-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setActiveCategory(cat.key)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                activeCategory === cat.key
                  ? "bg-foreground text-background shadow-md"
                  : "bg-surface text-muted hover:bg-overlay-hover-mid hover:text-foreground border border-border/50"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="appearance-none rounded-xl border border-border/60 bg-white/80 px-4 py-2 pr-8 text-sm text-foreground outline-none transition focus:border-primary"
            >
              <option value="">Subject</option>
              {subjects.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" viewBox="0 0 14 14" fill="none">
              <path d="M3.5 5.25 7 8.75l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="relative">
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="appearance-none rounded-xl border border-border/60 bg-white/80 px-4 py-2 pr-8 text-sm text-foreground outline-none transition focus:border-primary"
            >
              <option value="">Difficulty</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" viewBox="0 0 14 14" fill="none">
              <path d="M3.5 5.25 7 8.75l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* Exam cards grid */}
      <div className="grid grid-cols-3 gap-5">
        {filtered.map((exam) => {
          const diff = DIFFICULTY_COLORS[exam.difficulty];
          return (
            <div
              key={exam.id}
              className="glass card-hover group flex flex-col gap-4 rounded-2xl p-5 transition-all"
            >
              {/* Category badge */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted">
                  {exam.category_display}
                </span>
                {exam.last_score !== null && (
                  <div className="flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 22 22" fill="none">
                      <path d="M9 12l2 2 4-4" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="11" cy="11" r="8.5" stroke="#10B981" strokeWidth="1.6" />
                    </svg>
                    <span className="text-xs font-bold text-success">{exam.last_score}% Score</span>
                  </div>
                )}
              </div>

              {/* Title */}
              <h3 className="font-heading text-base font-bold leading-snug text-foreground">
                {exam.title}
              </h3>

              {/* Description */}
              <p className="text-xs text-muted leading-relaxed line-clamp-2">
                {exam.description}
              </p>

              {/* Meta */}
              <div className="flex items-center gap-4 text-xs text-muted">
                <span className="flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                    <rect x="1.75" y="3.5" width="10.5" height="7.583" rx="1.4" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M4.667 6.417h4.666M4.667 8.75h2.916" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                  {exam.question_count} Qs
                </span>
                <span className="flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M7 4.083V7l1.833 1.833" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                  {exam.duration_minutes} mins
                </span>
              </div>

              {/* CTA */}
              <button
                type="button"
                onClick={() => router.push(`/exams/${exam.id}/take`)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary transition-all duration-150 hover:bg-primary hover:text-white"
              >
                Start Exam
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                  <path d="M5.25 2.917 9.333 7 5.25 11.083" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <svg width="40" height="40" viewBox="0 0 22 22" fill="none" className="text-muted/40">
            <rect x="3.667" y="2.75" width="14.667" height="16.5" rx="2.2" stroke="currentColor" strokeWidth="1.6" />
            <path d="M7.333 7.333h7.334M7.333 11h7.334M7.333 14.667h4.584" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <p className="text-sm text-muted">No exams match your filters.</p>
        </div>
      )}
    </div>
  );
}
