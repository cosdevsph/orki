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

function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="8.25" stroke="currentColor" strokeWidth="1.6" />
      <path d="M11 6.875V11l2.75 2.75" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ScoreIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
      <path
        d="M3.667 18.333V13.75M7.333 18.333V9.167M11 18.333V11M14.667 18.333V6.417M18.333 18.333V3.667"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── Stats Row ────────────────────────────────────────────────────────────────

type StatsRowProps = {
  /** Consecutive study streak days from Firestore analytics doc. */
  streakDays: number;
  /** Average subject mastery % across all subjects. */
  avgScore: number;
  /** Total hours studied this calendar week from Firestore analytics doc. */
  weeklyHours: number;
};

export function StatsRow({ streakDays, avgScore, weeklyHours }: StatsRowProps) {
  return (
    <div className="grid grid-cols-3 gap-3 md:flex md:gap-4">
      <StatCard
        label="Study Streak"
        value={streakDays}
        unit="days"
        icon={<FlameIcon />}
        accentColor="#F59E0B"
        trend={streakDays > 0 ? "Keep it going — you're on fire!" : "Start studying today"}
      />
      <StatCard
        label="Avg. Score"
        value={`${avgScore}%`}
        icon={<ScoreIcon />}
        accentColor="#10B981"
        trend={avgScore >= 75 ? "Above the pass threshold!" : "Aim for 75% to pass"}
      />
      <StatCard
        label="This Week"
        value={weeklyHours.toFixed(1)}
        unit="hrs"
        icon={<ClockIcon />}
        accentColor="#8B5CF6"
        trend="Total study time this week"
      />
    </div>
  );
}
