import Link from "next/link";

import { routes } from "@/shared/config/routes";
import { FeaturePageLayout } from "./feature-page-layout";

const highlights = [
  {
    title: "Spaced Repetition Engine",
    description:
      "Based on the proven SM-2 algorithm, cards resurface at widening intervals — maximizing retention with the minimum amount of review time.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 12a9 9 0 1 0 9-9"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M12 3V7M12 3L9 6M12 3l3 3"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="2.5" fill="currentColor" opacity="0.5" />
      </svg>
    ),
  },
  {
    title: "Tap-to-Flip Interface",
    description:
      "Clean, distraction-free card design. Tap to reveal the answer, then rate your confidence: Easy, Medium, or Hard. That&apos;s all it takes.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="6" width="20" height="13" rx="2.5" stroke="currentColor" strokeWidth="2" />
        <path
          d="M6 6V5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v1"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.4"
        />
        <path
          d="M8 13h8M8 16h5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Smart Daily Deck",
    description:
      "Each morning, Orki builds your review deck from cards that are due today plus a small batch of new material — always the right amount.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect
          x="4"
          y="8"
          width="16"
          height="12"
          rx="2"
          stroke="currentColor"
          strokeWidth="2"
        />
        <rect
          x="7"
          y="5"
          width="16"
          height="12"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity="0.35"
        />
        <path d="M9 14h6M9 17h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Mastery Tracking",
    description:
      "Every deck shows a progress bar from 0% to 100% mastered. Watch your collections turn green as knowledge locks in for the long term.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 17l4-4 4 3 4-5 4 2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="7" cy="13" r="1.5" fill="currentColor" />
        <circle cx="11" cy="16" r="1.5" fill="currentColor" />
        <circle cx="15" cy="11" r="1.5" fill="currentColor" />
        <circle cx="19" cy="13" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
];

const steps = [
  {
    number: "01",
    title: "Choose a Deck",
    description:
      "Browse subject-specific decks curated for board exams, or build your own cards from exam items you want to memorize.",
  },
  {
    number: "02",
    title: "Study & Rate Your Recall",
    description:
      "Flip each card and honestly rate how well you remembered it. Easy cards come back in days. Hard cards return tomorrow.",
  },
  {
    number: "03",
    title: "Let the Algorithm Work",
    description:
      "Orki handles the schedule so you never review too early or too late. Study consistently and your mastery percentages climb steadily.",
  },
];

export function SmartFlashcards() {
  return (
    <FeaturePageLayout>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-background py-20 sm:py-28 transition-colors duration-300">
        <div className="absolute -top-32 -right-48 w-180 h-180 rounded-full bg-primary/6 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -left-32 w-80 h-80 rounded-full bg-primary/4 blur-3xl pointer-events-none" />

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
                Smart Flashcards
              </span>
              <div className="flex flex-col gap-4">
                <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-foreground">
                  Lock In Knowledge{" "}
                  <span className="bg-linear-to-r from-(--heading-from) to-(--heading-to) bg-clip-text text-transparent">
                    That Sticks
                  </span>
                </h1>
                <p className="text-lg text-secondary leading-relaxed max-w-lg">
                  Flashcards that don&apos;t just repeat — they remember. Orki&apos;s spaced
                  repetition algorithm schedules each card at the exact moment you&apos;re about
                  to forget it, building lasting memory with less time spent reviewing.
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

            {/* Right: Flashcard mockup */}
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
                      app.orki.study/flashcards
                    </div>
                  </div>
                </div>
                <div className="p-5 bg-surface space-y-4">
                  {/* Deck header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-heading font-bold text-foreground text-sm">
                        Pharmacology
                      </p>
                      <p className="text-[11px] text-muted mt-0.5">124 cards · 68% mastered</p>
                    </div>
                    <div className="text-[11px] font-semibold text-primary">12 / 40 today</div>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 rounded-full bg-track">
                    <div
                      className="h-1.5 rounded-full bg-primary"
                      style={{ width: "68%" }}
                    />
                  </div>
                  {/* Flashcard front */}
                  <div className="rounded-2xl bg-card-bg border-2 border-border shadow-sm min-h-30 flex flex-col items-center justify-center p-6 text-center gap-3">
                    <span className="text-[10px] font-semibold text-primary uppercase tracking-widest">
                      Question
                    </span>
                    <p className="text-sm font-semibold text-foreground leading-snug">
                      What is the mechanism of action of beta-blockers in heart failure?
                    </p>
                    <button className="mt-2 text-[11px] text-muted border border-border/60 rounded-lg px-3 py-1.5 hover:bg-overlay-hover-mid transition-colors">
                      Tap to flip
                    </button>
                  </div>
                  {/* Rate buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Hard", color: "border-red-400/50 text-red-500 hover:bg-red-50" },
                      {
                        label: "Medium",
                        color: "border-amber-400/50 text-amber-600 hover:bg-amber-50",
                      },
                      {
                        label: "Easy",
                        color: "border-success/40 text-success hover:bg-success/5",
                      },
                    ].map(({ label, color }) => (
                      <button
                        key={label}
                        className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors ${color}`}
                      >
                        {label}
                      </button>
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
              What makes these flashcards smarter
            </h2>
            <p className="text-secondary max-w-lg leading-relaxed">
              Not just digital index cards — a full memory-training system backed by cognitive
              science.
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
              Three steps to a review habit that actually builds long-term memory.
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
            Make every review session count.
          </h2>
          <p className="text-secondary leading-relaxed max-w-lg">
            Start with a curated deck today and let the spaced repetition engine do the heavy
            lifting for you.
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
