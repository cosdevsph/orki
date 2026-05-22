import Link from "next/link";

import { routes } from "@/shared/config/routes";

type QuickActionProps = {
  label: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
};

function QuickAction({ label, description, href, icon, color }: QuickActionProps) {
  return (
    <Link
      href={href}
      className="glass card-hover group flex flex-col gap-3 rounded-2xl p-4 transition-all duration-200"
    >
      <div
        className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110"
        style={{ backgroundColor: `${color}15`, color }}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="mt-0.5 text-xs text-muted">{description}</p>
      </div>
    </Link>
  );
}

function StartExamIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
      <polygon points="7,4 18,11 7,18" fill="currentColor" />
    </svg>
  );
}

function ReviewCardsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
      <rect x="2.75" y="6.417" width="16.5" height="11" rx="2.2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M6.417 6.417V5.042a1.833 1.833 0 0 1 1.833-1.834h5.5A1.833 1.833 0 0 1 15.583 5.042v1.375" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M11 10.083v3.667M9.167 11.917h3.666" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function AnalyticsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
      <path d="M3.667 18.333V13.75M7.333 18.333V9.167M11 18.333V11M14.667 18.333V6.417M18.333 18.333V3.667" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="7.333" r="3.667" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.667 19.25c0-4.051 3.284-7.333 7.333-7.333s7.333 3.282 7.333 7.333" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function QuickActions() {
  return (
    <div className="space-y-3">
      <h2 className="font-heading text-lg font-semibold text-foreground">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickAction
          label="Start Exam"
          description="Begin a mock test"
          href={routes.exams}
          icon={<StartExamIcon />}
          color="#8B5CF6"
        />
        <QuickAction
          label="Review Cards"
          description="24 cards due now"
          href={routes.flashcards}
          icon={<ReviewCardsIcon />}
          color="#2FA2E2"
        />
        <QuickAction
          label="View Analytics"
          description="Track your progress"
          href={routes.analytics}
          icon={<AnalyticsIcon />}
          color="#10B981"
        />
        <QuickAction
          label="My Profile"
          description="Settings & account"
          href={routes.profile}
          icon={<ProfileIcon />}
          color="#F59E0B"
        />
      </div>
    </div>
  );
}
