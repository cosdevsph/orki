import type { AnalyticsOverview } from "@/entities/analytics/types";
import { ProgressRing } from "@/components/ui/progress-ring";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const OVERVIEW: AnalyticsOverview = {
  averageScore: 78,
  masteryLevel: "medium",
  trend: [
    { label: "Mon", score: 65 },
    { label: "Tue", score: 72 },
    { label: "Wed", score: 68 },
    { label: "Thu", score: 80 },
    { label: "Fri", score: 76 },
    { label: "Sat", score: 82 },
    { label: "Sun", score: 78 },
  ],
};

const SUBJECTS = [
  { name: "Anatomy", score: 84, color: "#2FA2E2" },
  { name: "Physiology", score: 71, color: "#10B981" },
  { name: "Biochemistry", score: 63, color: "#8B5CF6" },
  { name: "Pharmacology", score: 55, color: "#F59E0B" },
  { name: "Pathology", score: 78, color: "#EF4444" },
  { name: "Microbiology", score: 66, color: "#06B6D4" },
];

const STREAK_CALENDAR = Array.from({ length: 35 }, (_, i) => ({
  active: Math.random() > 0.4,
  intensity: Math.random(),
}));

const MASTERY_LABELS: Record<AnalyticsOverview["masteryLevel"], string> = {
  low: "Building foundation",
  medium: "Developing mastery",
  high: "High mastery",
};

const MAX_SCORE = Math.max(...OVERVIEW.trend.map((p) => p.score));

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  return (
    <div className="animate-page-in space-y-8">
      {/* Header with Study Streak at top-right */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground">Analytics</h1>
          <p className="text-base text-muted">Your study progress, mastery levels, and performance trends.</p>
        </div>
        {/* Study Streak Badge — top right per requirement #8 */}
        <div className="flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2.5 shadow-sm">
          <svg width="16" height="16" viewBox="0 0 22 22" fill="none">
            <path d="M11 2c0 4-4 5.5-4 9a4 4 0 0 0 8 0c0-3.5-4-5-4-9Z" fill="#F59E0B" />
          </svg>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-amber-700">12 days</span>
            <span className="text-[9px] text-amber-600 leading-none">Study Streak</span>
          </div>
        </div>
      </div>

      {/* Top metrics row */}
      <div className="grid grid-cols-4 gap-5">
        {/* Average score ring */}
        <div className="glass rounded-2xl flex flex-col items-center justify-center gap-3 p-5">
          <ProgressRing
            value={OVERVIEW.averageScore}
            size={110}
            strokeWidth={10}
            color="#2FA2E2"
            label={`${OVERVIEW.averageScore}%`}
            sublabel="Avg Score"
          />
          <div className="text-center mt-1">
            <p className="text-sm font-semibold text-foreground">Average Score</p>
            <p className="text-xs text-muted">Across all exams</p>
          </div>
        </div>

        {/* Mastery ring */}
        <div className="glass rounded-2xl flex flex-col items-center justify-center gap-3 p-5">
          <ProgressRing
            value={OVERVIEW.masteryLevel === "low" ? 30 : OVERVIEW.masteryLevel === "medium" ? 60 : 90}
            size={110}
            strokeWidth={10}
            color="#10B981"
            label={OVERVIEW.masteryLevel === "low" ? "30%" : OVERVIEW.masteryLevel === "medium" ? "60%" : "90%"}
            sublabel="Mastery"
          />
          <div className="text-center mt-1">
            <p className="text-sm font-semibold text-foreground">{MASTERY_LABELS[OVERVIEW.masteryLevel]}</p>
            <p className="text-xs text-muted">Knowledge level</p>
          </div>
        </div>

        {/* Study ring */}
        <div className="glass rounded-2xl flex flex-col items-center justify-center gap-3 p-5">
          <ProgressRing
            value={72}
            size={110}
            strokeWidth={10}
            color="#8B5CF6"
            label="72%"
            sublabel="Goal"
          />
          <div className="text-center mt-1">
            <p className="text-sm font-semibold text-foreground">Weekly Goal</p>
            <p className="text-xs text-muted">12 of 16.7 hrs</p>
          </div>
        </div>

        {/* Streak calendar */}
        <div className="glass rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-sm font-semibold text-foreground">Study Streak</h2>
            <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5">
              <svg width="10" height="10" viewBox="0 0 22 22" fill="none">
                <path d="M11 2c0 4-4 5.5-4 9a4 4 0 0 0 8 0c0-3.5-4-5-4-9Z" fill="#F59E0B" />
              </svg>
              <span className="text-[10px] font-bold text-amber-600">12 days</span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mt-2">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <span key={`${d}-${i}`} className="text-center text-[9px] font-semibold text-muted">
                {d}
              </span>
            ))}
            {STREAK_CALENDAR.slice(-28).map((day, i) => (
              <div
                key={i}
                className="aspect-square rounded-[3px]"
                style={{
                  backgroundColor: day.active
                    ? `rgba(47,162,226,${0.2 + day.intensity * 0.7})`
                    : "rgba(0,0,0,0.05)",
                }}
              />
            ))}
          </div>

          <p className="text-[10px] text-muted text-center mt-2">
            Keep studying daily!
          </p>
        </div>
      </div>

      {/* Score trend chart */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-lg font-semibold text-foreground">Score Trend</h2>
            <p className="text-xs text-muted">7-day performance overview</p>
          </div>
          <span className="rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
            ↑ +13pts this week
          </span>
        </div>

        {/* Bar chart */}
        <div className="flex items-end justify-between gap-3" style={{ height: 120 }}>
          {OVERVIEW.trend.map((point, i) => {
            const heightPct = (point.score / MAX_SCORE) * 100;
            const isMax = point.score === MAX_SCORE;

            return (
              <div key={point.label} className="group flex flex-1 flex-col items-center gap-2">
                {/* Value tooltip */}
                <div className="mb-1 text-[11px] font-semibold text-foreground opacity-0 transition-opacity group-hover:opacity-100">
                  {point.score}%
                </div>
                <div className="relative flex w-full items-end justify-center" style={{ height: 90 }}>
                  <div
                    className="w-full max-w-[36px] rounded-t-xl transition-all duration-700"
                    style={{
                      height: `${heightPct}%`,
                      background: isMax
                        ? "linear-gradient(to top, #2FA2E2, #60C3F0)"
                        : i === OVERVIEW.trend.length - 1
                        ? "rgba(47,162,226,0.4)"
                        : "rgba(47,162,226,0.2)",
                      boxShadow: isMax ? "0 4px 16px rgba(47,162,226,0.4)" : "none",
                    }}
                  />
                </div>
                <span className="text-[11px] font-medium text-muted">{point.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subject mastery */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <h2 className="font-heading text-lg font-semibold text-foreground">Subject Mastery</h2>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          {SUBJECTS.map((sub) => (
            <div key={sub.name} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{sub.name}</span>
                <span className="text-sm font-semibold" style={{ color: sub.color }}>
                  {sub.score}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-black/[0.06]">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${sub.score}%`, backgroundColor: sub.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
