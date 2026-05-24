import type { Metadata } from "next";
import Link from "next/link";

import { routes } from "@/shared/config/routes";
import { PublicLayout } from "@/widgets/landing/public-layout";

export const metadata: Metadata = {
  title: "CLE — Criminology Licensure Examination",
  description:
    "Prepare for the Criminology Licensure Examination (CLE) with Orki. Study criminal jurisprudence, criminalistics, law enforcement, and more.",
  keywords: ["CLE", "Criminology Licensure Examination", "PRC board exam", "criminology reviewer", "Philippines"],
};

const subjects = [
  {
    code: "01",
    name: "Criminal Jurisprudence & Procedure",
    description: "Philippine criminal laws, the Revised Penal Code, special laws, criminal procedure, and the administration of criminal justice.",
  },
  {
    code: "02",
    name: "Criminalistics",
    description: "Forensic science principles, physical evidence examination, fingerprinting, ballistics, questioned documents, and crime scene investigation.",
  },
  {
    code: "03",
    name: "Law Enforcement Administration",
    description: "Police organization and management, police ethics, community policing, police operational procedures, and personnel administration.",
  },
  {
    code: "04",
    name: "Correctional Administration",
    description: "Prison management, institutional corrections, non-institutional corrections, parole and probation systems, and rehabilitation programs.",
  },
  {
    code: "05",
    name: "Crime Detection & Investigation",
    description: "Investigative methods, interview and interrogation techniques, surveillance, undercover operations, and case file preparation.",
  },
  {
    code: "06",
    name: "Industrial Security Management",
    description: "Security planning, risk assessment, physical security systems, information security, and private security administration.",
  },
];

const features = [
  {
    title: "CLE-Aligned Question Bank",
    description: "Practice questions mapped directly to the PRC Criminology board exam syllabus and current licensure examination trends.",
  },
  {
    title: "Criminal Law Deep-Dives",
    description: "Flashcards and quizzes covering the Revised Penal Code, special laws, and criminal procedure essentials.",
  },
  {
    title: "Timed Exam Simulations",
    description: "Simulate the actual CLE exam format with timed mock exams and immediate score feedback.",
  },
  {
    title: "Weakness Identification",
    description: "Analytics that pinpoint your weakest subject areas so you can focus where it matters most.",
  },
];

export default function ClePage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <div className="relative overflow-hidden bg-[#0B1D35] py-20 sm:py-28">
        <div className="absolute inset-0 bg-linear-to-br from-[#0a1825] via-[#0B1D35] to-[#102A4C] pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-96 h-96 rounded-full bg-primary/7 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-5">
              <span className="rounded-full bg-primary/15 border border-primary/25 px-3 py-1 text-xs font-bold text-primary uppercase tracking-widest">
                PRC Exam
              </span>
              <span className="rounded-full bg-white/8 border border-white/15 px-3 py-1 text-xs font-medium text-white/70">
                6 Subject Areas
              </span>
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-5 leading-tight">
              Criminology
              <br />
              <span className="bg-linear-to-r from-[#5bc5f5] to-[#2fa2e2] bg-clip-text text-transparent">
                Licensure Exam
              </span>
            </h1>
            <p className="text-lg text-white/70 leading-relaxed mb-8 max-w-xl">
              The CLE is administered by the Professional Regulation Commission (PRC) to assess
              competence in criminology, criminal justice, and public safety.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={routes.register}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 font-semibold text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200"
              >
                Start Studying CLE
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
            Orki covers all major CLE subject areas with curated practice questions and detailed
            answer explanations.
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
              How Orki helps you pass CLE
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
            Ready to become a licensed criminologist?
          </h2>
          <p className="text-white/65 mb-8 max-w-md mx-auto">
            Orki gives you everything you need to walk into the CLE exam with confidence — targeted
            practice, real simulations, and data-driven insights.
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
