import type { Metadata } from "next";
import Link from "next/link";

import { routes } from "@/shared/config/routes";
import { PublicLayout } from "@/widgets/landing/public-layout";

export const metadata: Metadata = {
  title: "PmLE — Psychometrician Licensure Examination",
  description:
    "Prepare for the Psychometrician Licensure Examination (PmLE) with Orki. Practice with PRC-sourced mock exams and flashcards, and track your progress with smart analytics.",
  keywords: ["PmLE", "Psychometrician Licensure Examination", "PRC board exam", "psychology exam reviewer", "Philippines"],
};

const subjects = [
  {
    code: "01",
    name: "General Psychology & Psychological Testing",
    description: "Foundations of psychology, theories of personality, and principles of psychological assessment.",
  },
  {
    code: "02",
    name: "Psychological Statistics & Research",
    description: "Descriptive and inferential statistics, research methodology, and data interpretation for psychological studies.",
  },
  {
    code: "03",
    name: "Industrial & Organizational Psychology",
    description: "Workplace behavior, organizational development, personnel selection, and human resource applications.",
  },
  {
    code: "04",
    name: "Clinical & Abnormal Psychology",
    description: "Psychopathology, diagnostic systems (DSM), abnormal behavior patterns, and clinical assessment.",
  },
  {
    code: "05",
    name: "Developmental Psychology",
    description: "Human development across the lifespan from prenatal to late adulthood, developmental theories and milestones.",
  },
  {
    code: "06",
    name: "Psychological Measurement & Evaluation",
    description: "Test construction, validity, reliability, standardization, and the ethics of psychological testing.",
  },
  {
    code: "07",
    name: "Ethics & Professional Psychology",
    description: "Code of ethics for psychologists, professional responsibilities, and legal considerations in practice.",
  },
];

const features = [
  {
    title: "PmLE-Specific Question Bank",
    description: "Hundreds of practice questions aligned with the PRC PmLE syllabus, categorized by subject area and difficulty.",
  },
  {
    title: "Timed Mock Examinations",
    description: "Simulate real PmLE exam conditions with timed sessions that match the official examination format.",
  },
  {
    title: "Smart Flashcards",
    description: "Spaced-repetition flashcards for key concepts, psychological terms, theorists, and statistical formulas.",
  },
  {
    title: "Subject Mastery Tracking",
    description: "See exactly which subject areas need more attention with your personalized analytics dashboard.",
  },
];

export default function PmlePage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <div className="relative overflow-hidden bg-[#0B1D35] py-20 sm:py-28">
        <div className="absolute inset-0 bg-linear-to-br from-[#0B1D35] via-[#0d2240] to-[#102A4C] pointer-events-none" />
        <div className="absolute top-0 right-0 w-lg h-lg rounded-full bg-primary/8 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-5">
              <span className="rounded-full bg-primary/15 border border-primary/25 px-3 py-1 text-xs font-bold text-primary uppercase tracking-widest">
                PRC Exam
              </span>
              <span className="rounded-full bg-white/8 border border-white/15 px-3 py-1 text-xs font-medium text-white/70">
                7 Subject Areas
              </span>
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-5 leading-tight">
              Psychometrician
              <br />
              <span className="bg-linear-to-r from-[#5bc5f5] to-[#2fa2e2] bg-clip-text text-transparent">
                Licensure Exam
              </span>
            </h1>
            <p className="text-lg text-white/70 leading-relaxed mb-8 max-w-xl">
              The PmLE is administered by the Professional Regulation Commission (PRC) and measures
              competence in psychological assessment, testing, and related professional practice.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={routes.register}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 font-semibold text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200"
              >
                Start Studying PmLE
              </Link>
              <Link
                href={routes.exams}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 px-8 py-4 font-medium text-white/80 hover:bg-white/8 hover:text-white transition-all duration-200"
              >
                Browse Exams
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Subject areas */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
            Coverage
          </p>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
            Subject Areas
          </h2>
          <p className="text-secondary mt-2 max-w-xl">
            Orki covers all major subject areas of the PmLE with targeted practice questions and
            detailed explanations.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => (
            <div
              key={subject.code}
              className="rounded-2xl border border-border bg-card-bg p-5 flex flex-col gap-2.5 transition-colors duration-200 hover:border-primary/25 hover:bg-primary/3"
            >
              <div className="flex items-start gap-3">
                <span className="font-heading font-bold text-2xl text-primary/25 leading-none mt-0.5">
                  {subject.code}
                </span>
                <h3 className="font-semibold text-foreground text-sm leading-snug">{subject.name}</h3>
              </div>
              <p className="text-xs text-secondary leading-relaxed">{subject.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How Orki helps */}
      <div className="bg-section-alt border-t border-b border-border/50 py-16 sm:py-20 transition-colors duration-300">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
              Your Study System
            </p>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
              How Orki helps you pass PmLE
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-border bg-card-bg p-6 flex gap-4 transition-colors duration-200"
              >
                <div className="w-2 rounded-full bg-primary/40 shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1.5">{feature.title}</h3>
                  <p className="text-sm text-secondary leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="relative overflow-hidden bg-[#0B1D35] py-16 sm:py-20">
        <div className="absolute inset-0 bg-linear-to-br from-[#0B1D35] via-[#102A4C] to-[#0B1D35] pointer-events-none" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-4">
            Your PmLE journey starts here.
          </h2>
          <p className="text-white/65 mb-8 max-w-md mx-auto">
            Join students preparing for the Psychometrician board exam with Orki&apos;s structured,
            data-driven study system.
          </p>
          <Link
            href={routes.register}
            className="inline-flex items-center gap-2.5 rounded-2xl bg-primary px-9 py-4 font-semibold text-white shadow-lg shadow-primary/25 hover:-translate-y-0.5 hover:shadow-primary/40 hover:shadow-xl transition-all duration-200"
          >
            Start Free Today
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
