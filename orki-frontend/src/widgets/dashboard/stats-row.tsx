import type { DashboardSummary } from "@/entities/dashboard/types";

// ─── Stat Card ────────────────────────────────────────────────────────────────

type StatCardProps = {
  label: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  accentColor?: string;
  trend?: string;
};

function StatCard({ label, value, unit, icon, accentColor = "#2FA2E2", trend }: StatCardProps) {
  return (
    <div className="glass card-hover flex flex-1 flex-col gap-2 md:gap-4 rounded-2xl p-3 md:p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted">{label}</span>
        <div
          className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${accentColor}18` }}
        >
          <span style={{ color: accentColor }}>{icon}</span>
        </div>
      </div>
      <div className="flex items-end gap-1.5">
        <span className="font-heading text-2xl md:text-4xl font-bold leading-none text-foreground">{value}</span>
        {unit && <span className="mb-0.5 text-sm font-medium text-muted">{unit}</span>}
      </div>
      {trend && (
        <p className="text-xs text-muted">{trend}</p>
      )}
    </div>
  );
}

// ─── Icons ─────────────────────────────────────────────────────────────────────

function FlameIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
      <path
        d="M11 2c0 4-4 5.5-4 9a4 4 0 0 0 8 0c0-3.5-4-5-4-9ZM8 16.5c0 1.381 1.343 2.5 3 2.5s3-1.119 3-2.5c0-1.5-3-4.5-3-4.5s-3 3-3 4.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function CardsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
      <rect x="2.75" y="6.417" width="16.5" height="11" rx="2.2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M6.417 6.417V5.042a1.833 1.833 0 0 1 1.833-1.834h5.5A1.833 1.833 0 0 1 15.583 5.042v1.375" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ExamBellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
      <path
        d="M11 2.75A5.5 5.5 0 0 0 5.5 8.25c0 3.437-1.375 4.583-1.375 4.583h13.75S16.5 11.687 16.5 8.25A5.5 5.5 0 0 0 11 2.75Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9.167 17.417a2.062 2.062 0 0 0 3.666 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="8.25" stroke="currentColor" strokeWidth="1.6" />
      <path d="M11 6.875V11l2.75 2.75" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Stats Row ────────────────────────────────────────────────────────────────

type StatsRowProps = {
  stats: DashboardSummary;
};

export function StatsRow({ stats }: StatsRowProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:flex md:gap-4">
      <StatCard
        label="Study Streak"
        value={stats.activeStreakDays}
        unit="days"
        icon={<FlameIcon />}
        accentColor="#F59E0B"
        trend="Keep it going — you're on fire!"
      />
      <StatCard
        label="Due Flashcards"
        value={stats.dueFlashcards}
        unit="cards"
        icon={<CardsIcon />}
        accentColor="#2FA2E2"
        trend="Review now for best retention"
      />
      <StatCard
        label="Upcoming Exams"
        value={stats.upcomingExams}
        unit="exams"
        icon={<ExamBellIcon />}
        accentColor="#8B5CF6"
        trend="Next exam in 3 days"
      />
      <StatCard
        label="This Week"
        value={stats.weeklyStudyHours}
        unit="hrs"
        icon={<ClockIcon />}
        accentColor="#10B981"
        trend="↑ 12% vs last week"
      />
    </div>
  );
}
