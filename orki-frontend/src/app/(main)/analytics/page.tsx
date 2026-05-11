"use client";

import { useEffect, useState, useMemo } from "react";

import type { AnalyticsOverview } from "@/entities/analytics/types";
import { ProgressRing } from "@/components/ui/progress-ring";
import { useExamType } from "@/hooks/useExamType";
import { getAnalyticsOverview } from "@/shared/api/study";
import { SUBJECT_COLORS } from "@/shared/utils/exam-type";

const MASTERY_LABELS: Record<AnalyticsOverview["masteryLevel"], string> = {
  low: "Building foundation",
  medium: "Developing mastery",
  high: "High mastery",
};

const MASTERY_PCT: Record<AnalyticsOverview["masteryLevel"], number> = {
  low: 30,
  medium: 60,
  high: 90,
};

/** Build a 28-day calendar grid from the last_active_date streak info */
function buildStreakCalendar(lastActiveDateStr: string | null | undefined): { active: boolean; intensity: number }[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastActive = lastActiveDateStr ? new Date(lastActiveDateStr) : null;
  if (lastActive) lastActive.setHours(0, 0, 0, 0);

  return Array.from({ length: 28 }, (_, i) => {
    const day = new Date(today);
    day.setDate(today.getDate() - (27 - i));
    // mark as active if it's <= lastActive (rough heuristic for non-zero streaks)
    const active = lastActive ? day <= lastActive && day >= new Date(lastActive.getTime() - 27 * 86400_000) : false;
    return { active, intensity: active ? 0.3 + (i % 5) * 0.14 : 0 };
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const { examFullName, examType } = useExamType();
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalyticsOverview()
      .then(setOverview)
      .catch(() => setOverview(null))
      .finally(() => setLoading(false));
  }, []);

  const trend = useMemo(
    () => overview?.trend ?? [
      { label: "Mon", score: 0 }, { label: "Tue", score: 0 }, { label: "Wed", score: 0 },
      { label: "Thu", score: 0 }, { label: "Fri", score: 0 }, { label: "Sat", score: 0 }, { label: "Sun", score: 0 },
    ],
    [overview?.trend],
  );
  const maxScore = useMemo(() => Math.max(...trend.map((p) => p.score), 1), [trend]);
  const streakDays = overview?.streak?.current_streak ?? 0;
  const masteryLevel = overview?.masteryLevel ?? "low";
  const avgScore = overview?.averageScore ?? 0;
  const subjectMasteries = overview?.subjectMasteries ?? [];
  const streakCalendar = useMemo(() => buildStreakCalendar(overview?.streak?.last_active_date), [overview?.streak?.last_active_date]);

  const trendDelta = useMemo(() => {
    if (trend.length < 2) return null;
    const first = trend[0].score;
    const last = trend[trend.length - 1].score;
    const diff = last - first;
    return diff;
  }, [trend]);
  return (
    <div className="animate-page-in space-y-8">
      {/* Header with Study Streak at top-right */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground">Analytics</h1>
          <p className="text-base text-muted">
            {examType
              ? `${examFullName} — your progress, mastery levels, and performance trends.`
              : "Your study progress, mastery levels, and performance trends."}
          </p>
        </div>
        {/* Study Streak Badge */}
        <div className="flex items-center gap-2 rounded-full bg-badge-amber-bg px-4 py-2.5 shadow-sm">
          <svg width="16" height="16" viewBox="0 0 22 22" fill="none">
            <path d="M11 2c0 4-4 5.5-4 9a4 4 0 0 0 8 0c0-3.5-4-5-4-9Z" fill="#F59E0B" />
          </svg>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-badge-amber-text">
              {loading ? "—" : `${streakDays} ${streakDays === 1 ? "day" : "days"}`}
            </span>
            <span className="text-[9px] text-badge-amber-text/70 leading-none">Study Streak</span>
          </div>
        </div>
      </div>

      {/* Top metrics row */}
      <div className="grid grid-cols-4 gap-5">
        {/* Average score ring */}
        <div className="glass rounded-2xl flex flex-col items-center justify-center gap-3 p-5">
          <ProgressRing
            value={avgScore}
            size={110}
            strokeWidth={10}
            color="#2FA2E2"
            label={loading ? "—" : `${avgScore}%`}
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
            value={MASTERY_PCT[masteryLevel]}
            size={110}
            strokeWidth={10}
            color="#10B981"
            label={loading ? "—" : `${MASTERY_PCT[masteryLevel]}%`}
            sublabel="Mastery"
          />
          <div className="text-center mt-1">
            <p className="text-sm font-semibold text-foreground">{MASTERY_LABELS[masteryLevel]}</p>
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
            <div className="flex items-center gap-1 rounded-full bg-badge-amber-bg px-2 py-0.5">
              <svg width="10" height="10" viewBox="0 0 22 22" fill="none">
                <path d="M11 2c0 4-4 5.5-4 9a4 4 0 0 0 8 0c0-3.5-4-5-4-9Z" fill="#F59E0B" />
              </svg>
              <span className="text-[10px] font-bold text-badge-amber-text">
                {loading ? "—" : `${streakDays} ${streakDays === 1 ? "day" : "days"}`}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mt-2">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <span key={`${d}-${i}`} className="text-center text-[9px] font-semibold text-muted">
                {d}
              </span>
            ))}
            {streakCalendar.map((day, i) => (
              <div
                key={i}
                className="aspect-square rounded-[3px]"
                style={{
                  backgroundColor: day.active
                    ? `rgba(47,162,226,${0.2 + day.intensity * 0.7})`
                    : "var(--surface)",
                }}
              />
            ))}
          </div>

          <p className="text-[10px] text-muted text-center mt-2">
            {streakDays > 0 ? "Great job! Keep it up!" : "Start studying to build your streak!"}
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
          {trendDelta !== null && trendDelta !== 0 && (
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${trendDelta > 0 ? "bg-success/10 text-success" : "bg-red-100 text-red-600"}`}>
              {trendDelta > 0 ? "↑" : "↓"} {Math.abs(trendDelta)}pts this week
            </span>
          )}
        </div>

        {/* Bar chart */}
        <div className="flex items-end justify-between gap-3" style={{ height: 120 }}>
          {trend.map((point, i) => {
            const heightPct = (point.score / maxScore) * 100;
            const isMax = point.score === maxScore && point.score > 0;

            return (
              <div key={point.label} className="group flex flex-1 flex-col items-center gap-2">
                <div className="mb-1 text-[11px] font-semibold text-foreground opacity-0 transition-opacity group-hover:opacity-100">
                  {point.score > 0 ? `${point.score}%` : "—"}
                </div>
                <div className="relative flex w-full items-end justify-center" style={{ height: 90 }}>
                  <div
                    className="w-full max-w-[36px] rounded-t-xl transition-all duration-700"
                    style={{
                      height: `${Math.max(heightPct, 4)}%`,
                      background: isMax
                        ? "linear-gradient(to top, #2FA2E2, #60C3F0)"
                        : i === trend.length - 1
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

      {/* Subject mastery — real data from analytics API */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-foreground">Subject Mastery</h2>
          {examType && (
            <span
              className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
              style={{ background: "rgba(47,162,226,0.1)", color: "#2FA2E2" }}
            >
              {examType}
            </span>
          )}
        </div>
        {loading ? (
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="space-y-1.5 animate-pulse">
                <div className="flex justify-between">
                  <div className="h-3 w-32 rounded bg-surface" />
                  <div className="h-3 w-10 rounded bg-surface" />
                </div>
                <div className="h-2 rounded-full bg-surface" />
              </div>
            ))}
          </div>
        ) : subjectMasteries.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            {subjectMasteries.map((sub, idx) => {
              const color = SUBJECT_COLORS[idx % SUBJECT_COLORS.length];
              const pct = Math.round(sub.mastery_percentage);
              return (
                <div key={sub.subject} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{sub.subject}</span>
                    <span className="text-sm font-semibold" style={{ color }}>{pct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-track">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted py-4 text-center">
            Complete a mock exam to see your subject mastery breakdown.
          </p>
        )}
      </div>
    </div>
  );
}
