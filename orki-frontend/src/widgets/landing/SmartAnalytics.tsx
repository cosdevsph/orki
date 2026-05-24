import Link from "next/link";

import { routes } from "@/shared/config/routes";
import { FeaturePageLayout } from "./feature-page-layout";

const highlights = [
  {
    title: "Performance Trends",
    description:
      "Week-over-week line charts showing your average score momentum. Catch a slump early and course-correct before it affects your readiness.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 17l4-6 4 3 4-7 4 3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3 21h18"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.4"
        />
      </svg>
    ),
  },
  {
    title: "Subject Mastery Map",
    description:
      "A visual breakdown of your mastery percentage per topic. See at a glance which subjects are board-ready and which still need work.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
        <rect
          x="3"
          y="14"
          width="7"
          height="7"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="2"
        />
        <rect
          x="14"
          y="14"
          width="7"
          height="7"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="2"
          opacity="0.35"
        />
      </svg>
    ),
  },
  {
    title: "Weak Area Alerts",
    description:
      "Automatic flags when a subject drops below your target pass rate. No more being blindsided — Orki tells you exactly where to study next.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2L2 20h20L12 2z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M12 9v5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="12" cy="17.5" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: "Smart Recommendations",
    description:
      "AI-generated study suggestions based on your latest performance gaps. Open the app and know exactly what to focus on today.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path
          d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-1.5 2-2.5 3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="12" cy="17" r="1" fill="currentColor" />
      </svg>
    ),
  },
];

const steps = [
  {
    number: "01",
    title: "Answer Questions",
    description:
      "Take mock exams and review flashcards as you normally would. Every response is recorded and fed into the analytics engine.",
  },
  {
    number: "02",
    title: "Analytics Update Automatically",
    description:
      "After each session, your mastery scores, performance trends, and weak-area flags refresh instantly. No configuration required.",
  },
  {
    number: "03",
    title: "Act on Your Insights",
    description:
      "Follow personalized recommendations to improve your weakest subjects efficiently and watch your overall scores climb steadily.",
  },
];

const subjectBars = [
  { label: "Anatomy", pct: 88, color: "bg-primary" },
  { label: "Pharmacology", pct: 62, color: "bg-primary" },
  { label: "Pathology", pct: 74, color: "bg-primary" },
  { label: "Physiology", pct: 45, color: "bg-amber-400" },
  { label: "Biochemistry", pct: 91, color: "bg-success" },
];

export function SmartAnalytics() {
  return (
    <FeaturePageLayout>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-background py-20 sm:py-28 transition-colors duration-300">
        <div className="absolute -top-32 -right-48 w-180 h-180 rounded-full bg-primary/6 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -left-32 w-80 h-80 rounded-full bg-success/4 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <Link
            href={`${routes.home}#features`}
            className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors duration-150 mb-10"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M10 3L5 8l5 5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            All Features
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: text */}
            <div className="flex flex-col gap-7 text-center lg:text-left items-center lg:items-start">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-4 py-1.5 text-sm font-medium text-primary">
                Smart Analytics
              </span>
              <div className="flex flex-col gap-4">
                <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-foreground">
                  Know Exactly{" "}
                  <span className="bg-linear-to-r from-(--heading-from) to-(--heading-to) bg-clip-text text-transparent">
                    Where to Focus
                  </span>
                </h1>
                <p className="text-lg text-secondary leading-relaxed max-w-lg">
                  Stop guessing which topics to study. Orki analyzes every answer you give and
                  shows you precisely where you&apos;re strong and where you&apos;re losing
                  points — so you study smarter, not longer.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <Link
                  href={routes.register}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 font-semibold text-white shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
                >
                  Get Started Free
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3 8h10M9 4l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
                <Link
                  href={routes.login}
                  className="inline-flex items-center justify-center rounded-2xl border border-border bg-card-bg px-8 py-4 font-medium text-foreground hover:bg-overlay-hover-mid transition-all duration-200"
                >
                  Sign In
                </Link>
              </div>
            </div>

            {/* Right: Analytics mockup */}
            <div className="w-full max-w-md mx-auto lg:max-w-none">
              <div className="rounded-3xl border border-border bg-card-bg shadow-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-surface">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="rounded-full bg-card-bg border border-border px-4 py-1 text-[11px] text-muted">
                      app.orki.study/analytics
                    </div>
                  </div>
                </div>
                <div className="p-5 bg-surface space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="font-heading font-bold text-foreground text-sm">
                      Subject Mastery
                    </p>
                    <span className="text-[11px] text-success font-semibold">↑ Overall 72%</span>
                  </div>
                  {/* Subject mastery bars */}
                  <div className="space-y-3">
                    {subjectBars.map(({ label, pct, color }) => (
                      <div key={label}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-medium text-foreground">{label}</span>
                          <span
                            className={`text-[11px] font-bold ${
                              pct < 60
                                ? "text-amber-500"
                                : pct >= 85
                                  ? "text-success"
                                  : "text-primary"
                            }`}
                          >
                            {pct}%
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-track">
                          <div
                            className={`h-2 rounded-full ${color} transition-all`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Weak area alert */}
                  <div className="flex items-center gap-3 rounded-xl bg-amber-500/8 border border-amber-500/20 p-3">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="shrink-0 text-amber-500"
                    >
                      <path
                        d="M8 1.5L1 13.5h14L8 1.5z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M8 6v4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
                    </svg>
                    <p className="text-[11px] text-amber-600 font-medium">
                      Physiology is below your 60% target — review recommended
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Highlights ── */}
      <section className="bg-section-alt py-16 lg:py-24 transition-colors duration-300">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-center gap-3 text-center mb-10 lg:mb-14">
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
              What the analytics show you
            </h2>
            <p className="text-secondary max-w-lg leading-relaxed">
              Four data views that transform raw study sessions into actionable guidance.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            {highlights.map((h) => (
              <div
                key={h.title}
                className="flex gap-5 rounded-3xl border border-border/60 bg-card-bg p-7 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  {h.icon}
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-foreground mb-1.5">
                    {h.title}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed">{h.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-background py-16 lg:py-24 transition-colors duration-300">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="flex flex-col items-center gap-3 text-center mb-10 lg:mb-14">
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
              How it works
            </h2>
            <p className="text-secondary max-w-md leading-relaxed">
              No setup, no manual tracking. Your analytics build themselves in the background.
            </p>
          </div>
          <div className="flex flex-col gap-6 sm:gap-8">
            {steps.map((step, i) => (
              <div key={step.number} className="flex gap-6 items-start">
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center font-heading font-bold text-white text-sm">
                    {step.number}
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-0.5 h-8 sm:h-10 bg-primary/20 mt-2" />
                  )}
                </div>
                <div className="pt-2 pb-2">
                  <h3 className="font-heading text-lg font-bold text-foreground mb-1.5">
                    {step.title}
                  </h3>
                  <p className="text-sm sm:text-base text-muted leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-section-alt py-16 lg:py-20 transition-colors duration-300">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 text-center flex flex-col items-center gap-6">
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
            Stop guessing. Start knowing.
          </h2>
          <p className="text-secondary leading-relaxed max-w-lg">
            Join thousands of students who use Orki analytics to target the exact subjects that will
            make the difference on exam day.
          </p>
          <Link
            href={routes.register}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 font-semibold text-white shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
          >
            Start for Free
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </section>
    </FeaturePageLayout>
  );
}
