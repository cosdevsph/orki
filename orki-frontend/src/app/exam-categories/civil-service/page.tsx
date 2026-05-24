import type { Metadata } from "next";
import Link from "next/link";

import { routes } from "@/shared/config/routes";
import { PublicLayout } from "@/widgets/landing/public-layout";

export const metadata: Metadata = {
  title: "Civil Service Examination",
  description:
    "Prepare for the Civil Service Examination (CSE) with Orki. Study Verbal, Numerical, and Analytical Ability questions for both Professional and Sub-Professional levels.",
  keywords: ["Civil Service Examination", "CSE", "government exam", "Civil Service Commission", "Philippines"],
};

const levels = [
  {
    name: "Professional Level",
    description:
      "For positions requiring college-level education. Covers a wider range of analytical and verbal abilities.",
    eligibility: "Career Service Professional Eligibility",
  },
  {
    name: "Sub-Professional Level",
    description:
      "For positions not requiring college-level education. Focuses on fundamental verbal, numerical, and clerical skills.",
    eligibility: "Career Service Sub-Professional Eligibility",
  },
];

const subjects = [
  {
    code: "01",
    name: "Verbal Ability",
    description: "English vocabulary, grammar and correct usage, reading comprehension, analogy, and paragraph organization.",
  },
  {
    code: "02",
    name: "Numerical Ability",
    description: "Basic operations, number series, word problems, data interpretation, and mathematical reasoning.",
  },
  {
    code: "03",
    name: "Analytical Ability",
    description: "Logic, critical thinking, abstract reasoning, data sufficiency, and problem-solving sequences.",
  },
  {
    code: "04",
    name: "Reading Comprehension",
    description: "Understanding written passages, drawing inferences, identifying main ideas, and interpreting meaning.",
  },
  {
    code: "05",
    name: "General Information",
    description: "Philippine Constitution, Code of Conduct for Public Officials, environmental laws, and general knowledge.",
  },
  {
    code: "06",
    name: "Clerical Ability",
    description: "Spelling, filing, name-finding, and number checking — primarily for the Sub-Professional level.",
  },
];

const features = [
  {
    title: "Professional & Sub-Pro Coverage",
    description: "Practice tests calibrated to both CSE Professional and Sub-Professional levels with appropriate difficulty distributions.",
  },
  {
    title: "Verbal & Numerical Drills",
    description: "Hundreds of targeted verbal reasoning, vocabulary, grammar, and numerical ability questions to build speed and accuracy.",
  },
  {
    title: "Analytical Reasoning Practice",
    description: "Logical reasoning, abstract patterns, and data sufficiency exercises specifically designed for the CSE Analytical component.",
  },
  {
    title: "Timed Practice Mode",
    description: "Practice under timed conditions that mirror the actual Civil Service Examination to build confidence and time management.",
  },
];

export default function CivilServicePage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <div className="relative overflow-hidden bg-[#0B1D35] py-20 sm:py-28">
        <div className="absolute inset-0 bg-linear-to-br from-[#071525] via-[#0B1D35] to-[#102A4C] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-lg h-96 rounded-full bg-primary/8 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-5">
              <span className="rounded-full bg-primary/15 border border-primary/25 px-3 py-1 text-xs font-bold text-primary uppercase tracking-widest">
                CSC Exam
              </span>
              <span className="rounded-full bg-white/8 border border-white/15 px-3 py-1 text-xs font-medium text-white/70">
                Professional &amp; Sub-Professional
              </span>
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-5 leading-tight">
              Civil Service
              <br />
              <span className="bg-linear-to-r from-[#5bc5f5] to-[#2fa2e2] bg-clip-text text-transparent">
                Examination
              </span>
            </h1>
            <p className="text-lg text-white/70 leading-relaxed mb-8 max-w-xl">
              The Civil Service Examination (CSE) is administered by the Civil Service Commission
              (CSC) and is a requirement for permanent employment in the Philippine government.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={routes.register}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 font-semibold text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200"
              >
                Start Studying CSE
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

      {/* Levels */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-16">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Exam Levels</p>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
            Choose your level
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
          {levels.map((level) => (
            <div
              key={level.name}
              className="rounded-2xl border border-border bg-card-bg p-6 flex flex-col gap-2.5 transition-colors duration-200 hover:border-primary/25"
            >
              <h3 className="font-heading font-bold text-foreground">{level.name}</h3>
              <p className="text-sm text-secondary leading-relaxed">{level.description}</p>
              <div className="mt-1 inline-flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="6" stroke="#10B981" strokeWidth="1.5" />
                  <path d="M4.5 7l2 2 3-3" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-xs font-medium text-success">{level.eligibility}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Subjects */}
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Coverage</p>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
            Subject Areas
          </h2>
          <p className="text-secondary mt-2 max-w-xl">
            Orki covers all components of the Civil Service Examination with focused practice
            questions and performance tracking.
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
              How Orki helps you pass CSE
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
            Ready for government service?
          </h2>
          <p className="text-white/65 mb-8 max-w-md mx-auto">
            Orki's structured CSE preparation helps you build the verbal, numerical, and analytical
            skills you need to pass — and serve with excellence.
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
