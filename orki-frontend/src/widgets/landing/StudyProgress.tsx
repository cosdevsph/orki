import Link from "next/link";

import { routes } from "@/shared/config/routes";
import { FeaturePageLayout } from "./feature-page-layout";

const highlights = [
  {
    title: "Daily Streaks",
    description:
      "Log any study activity to maintain your streak. Miss a day and it resets — the perfect low-stakes nudge to stay consistent day after day.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2C9 8 6 10 6 14a6 6 0 0 0 12 0c0-4-3-6-6-12z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M12 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          opacity="0.5"
        />
      </svg>
    ),
  },
  {
    title: "Achievement Badges",
    description:
      "Unlock badges for hitting milestones: first 100 questions, a 7-day streak, 90% mastery in a subject, and more. Collect them all.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="9" r="6" stroke="currentColor" strokeWidth="2" />
        <path
          d="M8.5 9l2.5 2.5 4-4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 15l-2 6 6-2 6 2-2-6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
          opacity="0.5"
        />
      </svg>
    ),
  },
  {
    title: "Goal Milestones",
    description:
      "Set weekly and monthly study targets. Visual progress bars fill as you study, celebrating every step forward with satisfying feedback.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="4 2"
          opacity="0.35"
        />
        <path
          d="M12 3a9 9 0 0 1 9 9"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M8 12l3 3 5-5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Study Calendar Heat Map",
    description:
      "A contribution-style calendar showing activity density across the month. See your commitment in one beautiful, at-a-glance view.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="2" />
        <path
          d="M3 9h18M8 2v3M16 2v3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <rect x="6" y="12" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.3" />
        <rect x="10.5" y="12" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.7" />
        <rect x="15" y="12" width="3" height="3" rx="0.5" fill="currentColor" />
      </svg>
    ),
  },
];

const steps = [
  {
    number: "01",
    title: "Study Anything",
    description:
      "Any activity counts: an exam, a flashcard session, or a review. Orki tracks it all automatically — no manual logging needed.",
  },
  {
    number: "02",
    title: "Watch Your Streak Grow",
    description:
      "Each consecutive study day extends your streak. The longer it gets, the more you&apos;ll want to protect it — turning study into a daily habit.",
  },
  {
    number: "03",
    title: "Unlock, Reflect, and Keep Going",
    description:
      "Earn badges when you hit milestones, review your calendar heat map, and let your own visible progress inspire you to study more.",
  },
];

const calendarDays = [
  8, 3, 0, 6, 9, 4, 2,
  5, 7, 9, 8, 3, 0, 7,
  6, 9, 8, 7, 5, 4, 9,
  3, 6, 9, 8, 7, 5, 9,
];

function heatColor(val: number) {
  if (val === 0) return "bg-track";
  if (val <= 3) return "bg-success/20";
  if (val <= 6) return "bg-success/50";
  return "bg-success";
}

export function StudyProgress() {
  return (
    <FeaturePageLayout>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-background py-20 sm:py-28 transition-colors duration-300">
        <div className="absolute -top-32 -right-48 w-180 h-180 rounded-full bg-success/5 blur-3xl pointer-events-none" />
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
              <span className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/8 px-4 py-1.5 text-sm font-medium text-success">
                Study Progress
              </span>
              <div className="flex flex-col gap-4">
                <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-foreground">
                  Stay Motivated{" "}
                  <span className="bg-linear-to-r from-(--heading-from) to-(--heading-to) bg-clip-text text-transparent">
                    Every Single Day
                  </span>
                </h1>
                <p className="text-lg text-secondary leading-relaxed max-w-lg">
                  Learning is a marathon. Orki&apos;s progress system uses streaks, milestones, and
                  achievement badges to turn daily discipline into a deeply satisfying habit that
                  compounds over time.
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

            {/* Right: Progress mockup */}
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
                  {/* Streak + weekly goal */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-card-bg border border-border/50 p-4 text-center">
                      <p className="text-3xl leading-none mb-1">🔥</p>
                      <p className="font-heading font-bold text-foreground text-xl leading-none">
                        12
                      </p>
                      <p className="text-[10px] text-muted mt-1">Day Streak</p>
                    </div>
                    <div className="rounded-2xl bg-card-bg border border-border/50 p-4">
                      <p className="text-xs font-semibold text-foreground mb-2">Weekly Goal</p>
                      <div className="h-2 rounded-full bg-track mb-1.5">
                        <div
                          className="h-2 rounded-full bg-success"
                          style={{ width: "78%" }}
                        />
                      </div>
                      <p className="text-[10px] text-muted">390 / 500 questions</p>
                    </div>
                  </div>

                  {/* Calendar heat map */}
                  <div>
                    <p className="text-xs font-semibold text-foreground mb-2">May 2026</p>
                    <div className="grid grid-cols-7 gap-1">
                      {calendarDays.map((val, i) => (
                        <div
                          key={i}
                          className={`w-full aspect-square rounded-sm ${heatColor(val)}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Badges */}
                  <div>
                    <p className="text-xs font-semibold text-foreground mb-2">Achievements</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: "7-Day Streak", emoji: "🔥", earned: true },
                        { label: "100 Questions", emoji: "📝", earned: true },
                        { label: "90% Mastery", emoji: "🏆", earned: false },
                        { label: "30-Day Streak", emoji: "⚡", earned: false },
                      ].map(({ label, emoji, earned }) => (
                        <div
                          key={label}
                          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[10px] font-semibold ${
                            earned
                              ? "bg-success/10 text-success border border-success/20"
                              : "bg-surface text-muted border border-border/50 opacity-50"
                          }`}
                        >
                          <span>{emoji}</span>
                          {label}
                        </div>
                      ))}
                    </div>
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
              What keeps you coming back
            </h2>
            <p className="text-secondary max-w-lg leading-relaxed">
              Four systems designed to build a study habit that outlasts motivation and becomes
              discipline.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            {highlights.map((h) => (
              <div
                key={h.title}
                className="flex gap-5 rounded-3xl border border-border/60 bg-card-bg p-7 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-2xl bg-success/10 text-success flex items-center justify-center shrink-0">
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
              No setup required. Your progress starts building the moment you answer your first
              question.
            </p>
          </div>
          <div className="flex flex-col gap-6 sm:gap-8">
            {steps.map((step, i) => (
              <div key={step.number} className="flex gap-6 items-start">
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-success flex items-center justify-center font-heading font-bold text-white text-sm">
                    {step.number}
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-0.5 h-8 sm:h-10 bg-success/20 mt-2" />
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
            Start your streak today.
          </h2>
          <p className="text-secondary leading-relaxed max-w-lg">
            Every board exam passer started with a single study session. Create your free Orki
            account and begin building the habit that leads to passing.
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
