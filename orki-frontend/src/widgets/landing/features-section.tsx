import type { ReactNode } from "react";
import Link from "next/link";

import { routes } from "@/shared/config/routes";

type FeatureCardProps = {
  icon: ReactNode;
  iconBg: string;
  title: string;
  description: string;
  href?: string;
};

function FeatureCard({ icon, iconBg, title, description, href }: FeatureCardProps) {
  const cardClass =
    "group flex flex-col gap-5 rounded-3xl border border-border/60 bg-card-bg p-8 shadow-sm hover:-translate-y-2 hover:shadow-2xl hover:border-primary/20 transition-all duration-300";

  const inner = (
    <>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${iconBg}`}>
        {icon}
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="font-heading text-xl font-bold text-foreground">{title}</h3>
        <p className="text-muted leading-relaxed text-[15px]">{description}</p>
      </div>
      <div className="mt-auto flex items-center gap-1.5 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        Learn more
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M2 7h10M8 3l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </>
  );

  if (href) {
    return <Link href={href} className={cardClass}>{inner}</Link>;
  }
  return <div className={cardClass}>{inner}</div>;
}

const DashboardIcon = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
    <rect x="2" y="2" width="9" height="9" rx="2.5" stroke="#2FA2E2" strokeWidth="2" />
    <rect x="15" y="2" width="9" height="9" rx="2.5" stroke="#2FA2E2" strokeWidth="2" />
    <rect x="2" y="15" width="9" height="9" rx="2.5" stroke="#2FA2E2" strokeWidth="2" />
    <rect x="15" y="15" width="9" height="9" rx="2.5" stroke="#2FA2E2" strokeWidth="2" />
  </svg>
);

const AnalyticsIcon = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
    <path
      d="M5 22V16"
      stroke="#2FA2E2"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <path
      d="M13 22V8"
      stroke="#2FA2E2"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <path
      d="M21 22V4"
      stroke="#2FA2E2"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <path
      d="M3 13l4-5 4 4 6-9"
      stroke="#2FA2E2"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.45"
    />
  </svg>
);

const ExamsIcon = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
    <path
      d="M8 4H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2"
      stroke="#2FA2E2"
      strokeWidth="2"
    />
    <rect x="9" y="2" width="8" height="5" rx="1.5" stroke="#2FA2E2" strokeWidth="2" />
    <path
      d="M8 13h10M8 17h7"
      stroke="#2FA2E2"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M8 9l1.5 1.5L12 8"
      stroke="#10B981"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const FlashcardsIcon = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
    <rect x="2" y="8" width="22" height="15" rx="3" stroke="#2FA2E2" strokeWidth="2" />
    <path
      d="M6 8V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v2"
      stroke="#2FA2E2"
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.45"
    />
    <path
      d="M10 16h6M10 19h4"
      stroke="#2FA2E2"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const ProgressIcon = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
    <path
      d="M6 10H4a3 3 0 0 1 0-6h2"
      stroke="#10B981"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M20 10h2a3 3 0 0 0 0-6h-2"
      stroke="#10B981"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M4 24h18"
      stroke="#10B981"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M10 17.6V20a1 1 0 0 1-1 1h-.5C7 21.5 6 23 6 24"
      stroke="#10B981"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M16 17.6V20a1 1 0 0 0 1 1h.5c1.5 0 2.5 1.5 2.5 3"
      stroke="#10B981"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M6 4h14v10a7 7 0 0 1-14 0V4Z"
      stroke="#10B981"
      strokeWidth="2"
    />
  </svg>
);

const topRowFeatures: FeatureCardProps[] = [
  {
    icon: <DashboardIcon />,
    iconBg: "bg-primary/10",
    title: "Dashboard Tracking",
    description:
      "See your full study picture at a glance. Visualize daily progress, manage your schedule, and stay relentlessly on track.",
    href: routes.featureDashboardTracking,
  },
  {
    icon: <AnalyticsIcon />,
    iconBg: "bg-primary/10",
    title: "Smart Analytics",
    description:
      "Understand exactly where you're strong and where to focus. Data-driven insights to optimize every study session.",
    href: routes.featureSmartAnalytics,
  },
  {
    icon: <ExamsIcon />,
    iconBg: "bg-primary/10",
    title: "Mock Exams",
    description:
      "Practice under real exam conditions with timed, adaptive mock tests that mirror actual board exam structure.",
    href: routes.featureMockExams,
  },
];

const bottomRowFeatures: FeatureCardProps[] = [
  {
    icon: <FlashcardsIcon />,
    iconBg: "bg-primary/10",
    title: "Smart Flashcards",
    description:
      "Spaced repetition flashcards that adapt to how you learn — surfacing the right cards at exactly the right moment.",
    href: routes.featureSmartFlashcards,
  },
  {
    icon: <ProgressIcon />,
    iconBg: "bg-success/10",
    title: "Study Progress",
    description:
      "Milestone tracking, daily streaks, and achievement badges that keep your motivation burning through every chapter.",
    href: routes.featureStudyProgress,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="bg-background py-16 lg:py-28 transition-colors duration-300">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        {/* Section header */}
        <div className="flex flex-col items-center gap-4 text-center mb-10 lg:mb-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-4 py-1.5 text-sm font-medium text-primary">
            Core Features
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
            Everything you need to ace your boards.
          </h2>
          <p className="text-base lg:text-lg text-secondary max-w-xl leading-relaxed">
            Orki brings together every study tool you need in one intelligent, beautifully designed
            platform.
          </p>
        </div>

        {/* 3-column top row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {topRowFeatures.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>

        {/* 2-column bottom row — centered */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto">
          {bottomRowFeatures.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </div>
    </section>
  );
}
