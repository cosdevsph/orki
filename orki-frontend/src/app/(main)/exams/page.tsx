"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";

import type { MockExam } from "@/entities/exams/types";
import { useExamType } from "@/hooks/useExamType";
import { getMockExamCatalog } from "@/shared/api/study";

const DIFFICULTY_COLORS = {
  beginner: { bg: "rgba(16,185,129,0.1)", text: "#059669" },
  intermediate: { bg: "rgba(245,158,11,0.1)", text: "#D97706" },
  advanced: { bg: "rgba(239,68,68,0.1)", text: "#DC2626" },
};

export default function ExamsPage() {
  const router = useRouter();
  const { categoryTabs, examFullName } = useExamType();
  const [catalog, setCatalog] = useState<MockExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");

  useEffect(() => {
    getMockExamCatalog()
      .then(setCatalog)
      .catch(() => setCatalog([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return catalog.filter((exam) => {
      if (activeCategory && exam.category !== activeCategory) return false;
      if (subjectFilter && !exam.subject.toLowerCase().includes(subjectFilter.toLowerCase())) return false;
      if (difficultyFilter && exam.difficulty !== difficultyFilter) return false;
      return true;
    });
  }, [catalog, activeCategory, subjectFilter, difficultyFilter]);

  const subjects = useMemo(
    () => [...new Set(catalog.map((e) => e.subject))],
    [catalog],
  );

  return (
    <div className="animate-page-in space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground">
          Exam Library
        </h1>
        <p className="text-base text-muted max-w-lg">
          {examFullName
            ? `Curated practice modules for ${examFullName}. Select a category below to begin a focused session.`
            : "Curated practice modules tailored for your certification. Select a category below to begin a focused session."}
        </p>
      </div>

      {/* Filters row */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Category tabs */}
        <div className="flex items-center gap-2">
          {categoryTabs.map((cat) => (
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
              className="appearance-none rounded-xl border border-border/60 bg-input-bg px-4 py-2 pr-8 text-sm text-foreground outline-none transition focus:border-primary"
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
              className="appearance-none rounded-xl border border-border/60 bg-input-bg px-4 py-2 pr-8 text-sm text-foreground outline-none transition focus:border-primary"
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
      {loading ? (
        <div className="grid grid-cols-3 gap-5">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="glass animate-pulse flex flex-col gap-4 rounded-2xl p-5">
              <div className="h-3 w-24 rounded bg-surface" />
              <div className="h-5 w-full rounded bg-surface" />
              <div className="h-3 w-5/6 rounded bg-surface" />
              <div className="h-3 w-4/6 rounded bg-surface" />
              <div className="h-10 w-full rounded-xl bg-surface mt-2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-5">
          {filtered.map((exam) => {
            const diff = DIFFICULTY_COLORS[exam.difficulty] ?? DIFFICULTY_COLORS.intermediate;
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
                  <span
                    className="ml-auto rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                    style={{ backgroundColor: diff.bg, color: diff.text }}
                  >
                    {exam.difficulty_display}
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
      )}

      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <svg width="40" height="40" viewBox="0 0 22 22" fill="none" className="text-muted/40">
            <rect x="3.667" y="2.75" width="14.667" height="16.5" rx="2.2" stroke="currentColor" strokeWidth="1.6" />
            <path d="M7.333 7.333h7.334M7.333 11h7.334M7.333 14.667h4.584" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <p className="text-sm text-muted">
            {catalog.length === 0
              ? "No exams available. Run the dataset loader on the server to populate the exam catalog."
              : "No exams match your filters."}
          </p>
        </div>
      )}
    </div>
  );
}
