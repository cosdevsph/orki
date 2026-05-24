import type { Metadata } from "next";
import Link from "next/link";

import { routes } from "@/shared/config/routes";
import { PublicLayout } from "@/widgets/landing/public-layout";

export const metadata: Metadata = {
  title: "LET — Licensure Examination for Teachers",
  description:
    "Prepare for the Licensure Examination for Teachers (LET) with Orki. Practice with PRC-sourced questions covering Professional Education, General Education, and Specialization.",
  keywords: ["LET", "Licensure Examination for Teachers", "PRC board exam", "teacher board exam", "Philippines"],
};

const subjectAreas = [
  {
    level: "Elementary & Secondary",
    category: "Professional Education",
    description: "Covers theories of learning, curriculum development, classroom management, assessment, and teaching strategies.",
    topics: [
      "Child & Adolescent Development",
      "Theories of Learning",
      "The Teaching Profession",
      "Curriculum Development",
      "Assessment of Student Learning",
      "Field Study & Practice Teaching",
    ],
  },
  {
    level: "Elementary",
    category: "General Education",
    description: "Broad knowledge across English, Mathematics, Science, Social Studies, Filipino, and Arts & PE.",
    topics: [
      "English Language Proficiency",
      "Mathematics & Problem Solving",
      "Science & Technology",
      "Social Studies & Philippine History",
      "Filipino Language & Literature",
      "Arts, Music, & Physical Education",
    ],
  },
  {
    level: "Secondary",
    category: "Specialization",
    description: "In-depth coverage of the specific teaching field — Mathematics, English, Science, Social Studies, Filipino, etc.",
    topics: [
      "English — Language, Literature, Communication",
      "Mathematics — Algebra, Geometry, Calculus",
      "Science — Biology, Chemistry, Physics",
      "Social Studies — History, Political Science",
      "Filipino — Panitikan, Linggwistika",
      "Technology & Livelihood Education",
    ],
  },
];

const features = [
  {
    title: "Separate Elementary & Secondary Banks",
    description: "Practice questions organized specifically by level and subject track so you study only what's relevant to your LET.",
  },
  {
    title: "Professional Education Deep-Dives",
    description: "Targeted flashcards and quizzes covering all Professional Education domains, the highest-weighted LET component.",
  },
  {
    title: "General Education Coverage",
    description: "Comprehensive General Education practice spanning all required subjects for the Elementary LET.",
  },
  {
    title: "Performance Analytics",
    description: "Track your weak subjects and monitor improvement across practice sessions with your personalized analytics dashboard.",
  },
];

export default function LetPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <div className="relative overflow-hidden bg-[#0B1D35] py-20 sm:py-28">
        <div className="absolute inset-0 bg-linear-to-br from-[#071a2e] via-[#0B1D35] to-[#102A4C] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-lg h-96 rounded-full bg-success/5 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-5">
              <span className="rounded-full bg-primary/15 border border-primary/25 px-3 py-1 text-xs font-bold text-primary uppercase tracking-widest">
                PRC Exam
              </span>
              <span className="rounded-full bg-white/8 border border-white/15 px-3 py-1 text-xs font-medium text-white/70">
                Elementary &amp; Secondary
              </span>
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-5 leading-tight">
              Licensure Exam
              <br />
              <span className="bg-linear-to-r from-[#5bc5f5] to-[#2fa2e2] bg-clip-text text-transparent">
                for Teachers
              </span>
            </h1>
            <p className="text-lg text-white/70 leading-relaxed mb-8 max-w-xl">
              The LET is the gateway to the teaching profession in the Philippines, administered by
              the PRC. Pass the LET and earn the right to shape the next generation.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={routes.register}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 font-semibold text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200"
              >
                Start Studying LET
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
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Coverage</p>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
            Subject Areas
          </h2>
          <p className="text-secondary mt-2 max-w-xl">
            The LET covers General Education, Professional Education, and Specialization depending
            on your level.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {subjectAreas.map((area) => (
            <div
              key={area.category}
              className="rounded-2xl border border-border bg-card-bg p-6 flex flex-col gap-4 transition-colors duration-200 hover:border-primary/25"
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-primary">
                  {area.level}
                </span>
                <h3 className="font-heading font-bold text-foreground mt-1 mb-1.5">
                  {area.category}
                </h3>
                <p className="text-sm text-secondary leading-relaxed">{area.description}</p>
              </div>
              <ul className="space-y-1.5">
                {area.topics.map((topic) => (
                  <li key={topic} className="flex gap-2 text-xs text-muted">
                    <span className="text-primary shrink-0 mt-0.5">•</span>
                    {topic}
                  </li>
                ))}
              </ul>
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
              How Orki helps you pass LET
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
            Ready to become a licensed teacher?
          </h2>
          <p className="text-white/65 mb-8 max-w-md mx-auto">
            Study smarter for the LET with structured practice, real exam simulations, and
            analytics that show you exactly what to focus on.
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
