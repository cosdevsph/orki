import Link from "next/link";

import { routes } from "@/shared/config/routes";
import { FeaturePageLayout } from "./feature-page-layout";

const highlights = [
  {
    title: "Daily Progress Ring",
    description:
      "A circular indicator that resets each morning. Every question you answer fills the ring — simple, motivating, and impossible to ignore.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" opacity="0.25" />
        <path
          d="M12 3a9 9 0 0 1 7.794 4.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="12" cy="12" r="3" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: "Study Schedule",
    description:
      "Plan your week with a visual calendar. Assign specific subjects to days and Orki will remind you whenever you fall behind.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="2" />
        <path
          d="M3 9h18M8 2v3M16 2v3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M7 13h2M11 13h2M15 13h2M7 17h2M11 17h2"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Recent Activity Feed",
    description:
      "A live log of every exam, flashcard session, and milestone. Know exactly what you studied, when you did it, and how you scored.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"
          stroke="currentColor"
          strokeWidth="2"
        />
        <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="2" />
        <path
          d="M9 12h6M9 16h4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Subject Breakdown",
    description:
      "Horizontal bars showing time spent and score across each subject. Spot imbalances before they become blind spots on exam day.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 6h16M4 10h12M4 14h8M4 18h5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

const steps = [
  {
    number: "01",
    title: "Set Your Daily Goal",
    description:
      "Choose how many questions or hours you want to study each day. Your progress ring starts empty every morning, waiting to be filled.",
  },
  {
    number: "02",
    title: "Study as Normal",
    description:
      "Every exam, flashcard session, and review is logged automatically as you go. No manual entry, no friction — just focus on learning.",
  },
  {
    number: "03",
    title: "Check Your Dashboard",
    description:
      "Open the dashboard at any point to see your ring fill, activity feed update, and subject bars shift in real time.",
  },
];

export function DashboardTracking() {
  return (
    <FeaturePageLayout>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-background py-20 sm:py-28 transition-colors duration-300">
        <div className="absolute -top-32 -right-48 w-180 h-180 rounded-full bg-primary/6 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -left-32 w-80 h-80 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

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
                Dashboard Tracking
              </span>
              <div className="flex flex-col gap-4">
                <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-foreground">
                  Your Study{" "}
                  <span className="bg-linear-to-r from-(--heading-from) to-(--heading-to) bg-clip-text text-transparent">
                    Command Center
                  </span>
                </h1>
                <p className="text-lg text-secondary leading-relaxed max-w-lg">
                  See everything about your learning journey in one glance. The Orki dashboard
                  centralizes daily progress, your schedule, and performance history so you&apos;re
                  always prepared, never surprised.
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

            {/* Right: Dashboard mockup */}
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
                      app.orki.study/dashboard
                    </div>
                  </div>
                </div>
                <div className="p-5 bg-surface space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="font-heading font-bold text-foreground text-sm">
                      Good morning, Maria 👋
                    </p>
                    <span className="text-[11px] text-muted">Mon, May 26</span>
                  </div>
                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Today", value: "42" },
                      { label: "Streak", value: "12 🔥" },
                      { label: "Mastery", value: "74%" },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="rounded-xl bg-card-bg border border-border/50 p-3 text-center"
                      >
                        <p className="font-heading font-bold text-foreground text-base leading-none">
                          {s.value}
                        </p>
                        <p className="text-[10px] text-muted mt-1">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  {/* Daily goal */}
                  <div className="rounded-2xl bg-card-bg border border-border/50 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-foreground">Daily Goal</p>
                      <p className="text-xs text-primary font-semibold">42 / 60 questions</p>
                    </div>
                    <div className="h-2.5 rounded-full bg-track">
                      <div
                        className="h-2.5 rounded-full bg-linear-to-r from-(--heading-from) to-(--heading-to)"
                        style={{ width: "70%" }}
                      />
                    </div>
                    <p className="text-[10px] text-muted mt-1.5">70% — keep going!</p>
                  </div>
                  {/* Activity feed */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-foreground">Recent Activity</p>
                    {[
                      { icon: "📝", label: "Mock Exam · Anatomy", time: "2h ago", score: "88%" },
                      {
                        icon: "🃏",
                        label: "Flashcards · Pharmacology",
                        time: "4h ago",
                        score: "32 cards",
                      },
                    ].map((a) => (
                      <div
                        key={a.label}
                        className="flex items-center gap-3 rounded-xl bg-card-bg border border-border/50 p-3"
                      >
                        <span className="text-base leading-none">{a.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-medium text-foreground truncate">
                            {a.label}
                          </p>
                          <p className="text-[10px] text-muted">{a.time}</p>
                        </div>
                        <span className="text-[11px] font-semibold text-success shrink-0">
                          {a.score}
                        </span>
                      </div>
                    ))}
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
              What the dashboard gives you
            </h2>
            <p className="text-secondary max-w-lg leading-relaxed">
              Four views that keep you oriented, motivated, and always one step ahead of the exam.
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
              Three steps from signup to a dashboard that stays on top of your study journey.
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
            Ready to take control of your study day?
          </h2>
          <p className="text-secondary leading-relaxed max-w-lg">
            Create your free account and open your Orki dashboard in under two minutes.
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
