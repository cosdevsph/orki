import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { routes } from "@/shared/config/routes";
import { PublicLayout } from "@/widgets/landing/public-layout";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Orki's mission to help Filipino professionals pass their board exams with smart analytics, PRC-sourced content, and personalized study tracking.",
};

const values = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Excellence First",
    description:
      "We hold our content to the same rigorous standards that licensure boards apply to their examinations. Every question is reviewed, every explanation is verified.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
        <path
          d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Student-Centered",
    description:
      "Every feature we build starts with the question: does this help a student pass their board exam? Orki exists to serve the learner, not the other way around.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Trustworthy",
    description:
      "We are transparent about how AI is used, how data is stored, and what our platform can and cannot do. No false promises — only honest preparation.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        <path
          d="M12 6v6l4 2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Constantly Improving",
    description:
      "We continuously expand our question banks, refine our analytics, and ship new features based on real student feedback. Orki today is always better than Orki yesterday.",
  },
];

const stats = [
  { value: "500+", label: "Students preparing" },
  { value: "4", label: "Exam categories" },
  { value: "2026", label: "Founded" },
  { value: "PH", label: "Proudly Filipino" },
];

export default function AboutPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <div className="relative overflow-hidden bg-[#0B1D35] py-20 sm:py-28">
        <div className="absolute inset-0 bg-linear-to-br from-[#0B1D35] via-[#102A4C] to-[#1B3D62] pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-160 h-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6 text-center lg:text-left items-center lg:items-start">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm font-medium text-white/80">
              🇵🇭 Made for Filipino Professionals
            </span>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white leading-tight">
              Helping you{" "}
              <span className="bg-linear-to-r from-[#5bc5f5] to-[#2fa2e2] bg-clip-text text-transparent">
                earn your license.
              </span>
            </h1>
            <p className="text-lg text-white/70 leading-relaxed max-w-lg">
              Orki was born from a simple belief: every Filipino professional who puts in the work
              deserves a smarter, more accessible way to prepare for their board exam.
            </p>
          </div>

          {/* Mascot */}
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-56 h-56 rounded-full bg-primary/15 blur-3xl" />
              </div>
              <Image
                src="/mascott/OrkiLogoFront.webp"
                alt="Orki mascot"
                width={320}
                height={320}
                className="relative object-contain drop-shadow-2xl w-48 h-48 sm:w-64 sm:h-64 lg:w-auto lg:h-auto"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-card-bg border-b border-border/50 py-8 transition-colors duration-300">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-heading text-3xl font-bold text-primary">{stat.value}</p>
              <p className="text-sm text-muted mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mission */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4">
            Our Mission
          </p>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-5 leading-tight">
            No Filipino professional should fail a board exam for lack of the right resources.
          </h2>
          <div className="space-y-4 text-[16px] text-secondary leading-relaxed">
            <p>
              Millions of Filipino students prepare for licensure examinations each year — from
              future teachers and psychometricians to criminologists and civil servants. The path is
              demanding. The stakes are high. And yet, quality study tools have historically been
              expensive, scattered, or simply inaccessible.
            </p>
            <p>
              Orki changes that. We combine PRC-sourced exam content, spaced-repetition flashcards,
              and AI-driven performance analytics into a single, affordable platform — purpose-built
              for Philippine board exams.
            </p>
            <p>
              We built Orki because we believe that preparation is the great equalizer. When you
              walk into that examination room having truly prepared, everything else falls into
              place.
            </p>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="bg-section-alt border-t border-b border-border/50 py-16 sm:py-20 transition-colors duration-300">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
              Our Values
            </p>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
              What guides everything we build
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((v) => (
              <div
                key={v.title}
                className="rounded-2xl border border-border bg-card-bg p-6 flex flex-col gap-3 transition-colors duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center text-primary">
                  {v.icon}
                </div>
                <h3 className="font-heading font-semibold text-foreground">{v.title}</h3>
                <p className="text-sm text-secondary leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Meet Orki (mascot story) */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-last lg:order-first flex items-center justify-center">
            <div className="relative rounded-3xl overflow-hidden bg-primary/5 border border-border p-8">
              <Image
                src="/mascott/OrkiLogoLeft.webp"
                alt="Orki the whale"
                width={260}
                height={260}
                className="object-contain animate-float"
              />
            </div>
          </div>
          <div className="flex flex-col gap-5">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Meet Orki</p>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground leading-tight">
              A friendly companion for your exam journey
            </h2>
            <div className="space-y-3 text-[15px] text-secondary leading-relaxed">
              <p>
                Orki is a whale — and like a whale navigating vast oceans with confidence and
                grace, we want every student on our platform to navigate the waters of board exam
                preparation with the same certainty.
              </p>
              <p>
                Whales are known for their intelligence, their memory, and their incredible
                journeys. They remind us that great things are possible when you prepare thoroughly
                and trust the process.
              </p>
              <p>
                Orki the mascot is your study buddy — always there to encourage you, celebrate your
                milestones, and remind you that you're making progress, even on the hard days.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-section-alt border-t border-border/50 py-16 sm:py-20 transition-colors duration-300">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Ready to start your journey?
          </h2>
          <p className="text-secondary mb-8 max-w-md mx-auto">
            Join hundreds of students who are preparing smarter, not harder, with Orki.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={routes.register}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-9 py-4 font-semibold text-white shadow-lg shadow-primary/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200"
            >
              Start Studying Free
            </Link>
            <Link
              href={routes.contact}
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card-bg px-9 py-4 font-medium text-foreground hover:border-primary/30 hover:text-primary transition-all duration-200"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
