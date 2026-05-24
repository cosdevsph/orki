import Link from "next/link";

import { routes } from "@/shared/config/routes";
import { FeaturePageLayout } from "./feature-page-layout";

const highlights = [
  {
    title: "Board-Accurate Questions",
    description:
      "Curated from official exam blueprints and reviewed by subject experts. Same format, difficulty distribution, and coverage as the actual board exam.",
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
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Timed Pressure Mode",
    description:
      "Set a custom countdown timer to practice pacing under real conditions. Learn to work efficiently so exam-day nerves don't rob you of time.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="2" />
        <path
          d="M12 9v4l3 2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 2h6M12 2v2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Instant Score & Review",
    description:
      "See your result the moment you submit. Every question includes a clear explanation so you understand exactly why the correct answer is correct.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path
          d="M8 12l3 3 5-5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Adaptive Difficulty",
    description:
      "Orki monitors your performance and gradually serves harder questions as you improve, keeping you in the optimal learning zone.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 18V9M8 18V6M12 18V11M16 18V4M20 18V8"
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
    title: "Pick Your Settings",
    description:
      "Choose the exam subject, number of questions, and timer duration. Start immediately or schedule a session for later.",
  },
  {
    number: "02",
    title: "Answer Under Pressure",
    description:
      "Work through questions with the clock running. Flag any item you're unsure about and return to it before time runs out.",
  },
  {
    number: "03",
    title: "Review Every Item",
    description:
      "After submitting, read detailed explanations for each question. Bookmark tricky items to revisit as flashcards later.",
  },
];

const examChoices = ["Troponin I", "CK-MB", "AST", "LDH"];

export function MockExams() {
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
                Mock Exams
              </span>
              <div className="flex flex-col gap-4">
                <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-foreground">
                  Simulate the{" "}
                  <span className="bg-linear-to-r from-(--heading-from) to-(--heading-to) bg-clip-text text-transparent">
                    Real Exam Experience
                  </span>
                </h1>
                <p className="text-lg text-secondary leading-relaxed max-w-lg">
                  Build confidence by practicing under real conditions. Orki&apos;s mock exams
                  mirror actual board exam structure — with time pressure, question formats, and
                  instant explanations after every session.
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

            {/* Right: Exam mockup */}
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
                      app.orki.study/exams
                    </div>
                  </div>
                </div>
                <div className="p-5 bg-surface space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-muted">Question 23 of 50</span>
                    <span className="text-[11px] font-semibold text-primary">23:45 remaining</span>
                  </div>
                  <div className="rounded-2xl bg-card-bg border border-border/50 p-4 space-y-4">
                    <p className="text-sm font-medium text-foreground leading-relaxed">
                      Which cardiac enzyme is most specific for myocardial infarction and remains
                      elevated the longest after an acute event?
                    </p>
                    <div className="space-y-2">
                      {examChoices.map((choice, i) => (
                        <div
                          key={choice}
                          className={`flex items-center gap-3 rounded-xl p-3 text-xs font-medium ${
                            i === 0
                              ? "bg-primary text-white"
                              : "bg-surface text-muted border border-border/50"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0 ${
                              i === 0
                                ? "border-white/40 bg-white/20 text-white"
                                : "border-border text-muted"
                            }`}
                          >
                            {["A", "B", "C", "D"][i]}
                          </div>
                          {choice}
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Progress */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full bg-track">
                      <div
                        className="h-2 rounded-full bg-linear-to-r from-(--heading-from) to-(--heading-to)"
                        style={{ width: "46%" }}
                      />
                    </div>
                    <span className="text-[11px] text-muted font-medium shrink-0">46% done</span>
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
              What makes Orki exams different
            </h2>
            <p className="text-secondary max-w-lg leading-relaxed">
              Every detail is designed to close the gap between study mode and exam day.
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
              From picking a subject to reviewing every missed item — in three clear steps.
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
            Practice until passing feels inevitable.
          </h2>
          <p className="text-secondary leading-relaxed max-w-lg">
            Hundreds of board-accurate questions are waiting. Start your first mock exam for free
            today.
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
