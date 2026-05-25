"use client";

import { useEffect, useState, useMemo } from "react";

import type { AnalyticsOverview } from "@/entities/analytics/types";
import { ProgressRing } from "@/components/ui/progress-ring";
import { ScoreTrendChart } from "@/components/analytics/ScoreTrendChart";
import { useExamType } from "@/hooks/useExamType";
import { useAuth } from "@/hooks/useAuth";
import { getAnalyticsOverview } from "@/shared/api/study";
import { getAnalyticsDocument, getAttemptHistory } from "@/shared/firebase/firestore";
import type { AttemptHistoryItem } from "@/shared/firebase/firestore";
import { useAnalyticsStore } from "@/shared/stores/useAnalyticsStore";
import { SUBJECT_COLORS, getSubjectsByExam } from "@/shared/utils/exam-type";
import { ExamProgressSection } from "@/components/analytics/ExamProgressSection";
import type { SubjectProgress } from "@/components/analytics/ExamProgressSection";



/** Build a 42-day calendar grid (6 complete weeks) aligned to actual calendar month view.
 * Shows the current month plus leading/trailing days to fill complete weeks starting Sunday.
 * For May 2026: April 26 - June 6
 */
function buildActivityGrid(activityGrid: Record<string, number> | undefined): { date: string; count: number; intensity: number }[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get the first day of the current month
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  // Find the Sunday at or before the first day of the month
  const dayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(firstDayOfMonth.getDate() - dayOfWeek + 1); // Go back to Sunday, plus 1
  
  return Array.from({ length: 42 }, (_, i) => {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + i);
    const dateStr = day.toISOString().split("T")[0];
    const count = activityGrid?.[dateStr] ?? 0;
    
    // Color intensity based on exam count: 0=none, 1-2=light, 3-5=medium, 6+=dark
    let intensity = 0;
    if (count >= 6) intensity = 1.0;
    else if (count >= 3) intensity = 0.65;
    else if (count >= 1) intensity = 0.3;
    
    return { date: dateStr, count, intensity };
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const { examFullName, examType } = useExamType();
  const { user } = useAuth();
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [activityGrid, setActivityGrid] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [weeklyHours, setWeeklyHours] = useState(0);
  const [readinessIndex, setReadinessIndex] = useState(0);
  const [subjectProgress, setSubjectProgress] = useState<SubjectProgress[]>([]);
  const [progressLoading, setProgressLoading] = useState(false);

  // Zustand store for score trend
  const { examHistory, marketSentiment, isLoading: trendLoading, fetchScoreTrend } = useAnalyticsStore();

  useEffect(() => {
    async function loadAnalytics() {
      try {
        // If user is authenticated and has exam type, fetch from flat /analytics/{uid} collection
        if (user?.uid && examType) {
          const analyticsDoc = await getAnalyticsDocument(user.uid);
          
          if (analyticsDoc && analyticsDoc.examType === examType) {
            // Transform flat analytics structure to AnalyticsOverview format
            const subjects = getSubjectsByExam(examType);
            const subjectMasteries = subjects
              .filter(s => analyticsDoc.subjects[s.name] !== undefined)
              .map(s => {
                const data = analyticsDoc.subjects[s.name];
                return {
                  subject: s.name,
                  exam_type: examType,
                  mastery_percentage: Math.round(data.subjectMastery),
                  total_questions_attempted: data.totalTries,
                  total_questions_correct: Math.round(
                    (data.runningAverage / 100) * data.totalTries
                  ),
                  weak_topics: [],
                  strong_topics: [],
                  last_updated: new Date().toISOString(),
                };
              });

            // Compute overall stats
            const avgMastery = subjectMasteries.length > 0
              ? Math.round(
                  subjectMasteries.reduce((sum, s) => sum + s.mastery_percentage, 0) /
                    subjectMasteries.length
                )
              : 0;

            // Extract streak data from Firestore
            const currentStreak = analyticsDoc.streak?.currentStreak ?? 0;
            const lastActiveDate = analyticsDoc.streak?.lastActiveDate ?? null;

            // Calculate Readiness Index = avgMastery + (2% * currentStreak, capped at 100%)
            const streakBonus = Math.min(currentStreak * 2, 40); // Max +40% from streak (20 days)
            const readiness = Math.min(avgMastery + streakBonus, 100);
            setReadinessIndex(readiness);

            // Extract weekly hours (auto-resets if week changed in Firestore)
            setWeeklyHours(analyticsDoc.currentWeeklyHours ?? 0);

            setOverview({
              subjectMasteries,
              averageScore: avgMastery,
              masteryLevel:
                avgMastery >= 70 ? "high" : avgMastery >= 40 ? "medium" : "low",
              trend: [],
              streak: { current_streak: currentStreak, last_active_date: lastActiveDate, longest_streak: 0, updated_at: null },
            });

            // Store activity grid for rendering
            setActivityGrid(analyticsDoc.activityGrid ?? {});
          } else {
            // No analytics yet for this exam type, show empty state
            setReadinessIndex(0);
            setWeeklyHours(0);
            setOverview({
              subjectMasteries: [],
              averageScore: 0,
              masteryLevel: "low",
              trend: [],
              streak: { current_streak: 0, last_active_date: null, longest_streak: 0, updated_at: null },
            });
            setActivityGrid({});
          }
        } else {
          // Fallback to backend API if not authenticated or no examType
          const data = await getAnalyticsOverview();
          setOverview(data);
          setActivityGrid({});
          setReadinessIndex(0);
          setWeeklyHours(0);
        }
      } catch (err) {
        console.warn("[AnalyticsPage] Failed to load analytics:", err);
        setOverview(null);
        setActivityGrid({});
        setReadinessIndex(0);
        setWeeklyHours(0);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, [user?.uid, examType]);

  // Fetch score trend from Zustand store
  useEffect(() => {
    if (user?.uid && examType) {
      void fetchScoreTrend(user.uid, examType);
    }
  }, [user?.uid, examType, fetchScoreTrend]);

  // Load exam attempt progression history
  useEffect(() => {
    const uid = user?.uid;
    if (!uid || !examType) return;

    void (async () => {
      setProgressLoading(true);
      try {
        const attempts = await getAttemptHistory(uid, examType);

        // Group by subject (attempts already sorted ascending by attempt_number)
        const grouped: Record<string, AttemptHistoryItem[]> = {};
        for (const a of attempts) {
          if (!grouped[a.subject]) grouped[a.subject] = [];
          grouped[a.subject].push(a);
        }

        const groups: SubjectProgress[] = Object.entries(grouped).map(
          ([subject, subjectAttempts]) => {
            const scores = subjectAttempts.map((a) => a.score);
            const bestScore = Math.max(...scores);
            const latestScore = scores[scores.length - 1];
            const avgScore = Math.round(
              scores.reduce((sum, s) => sum + s, 0) / scores.length,
            );
            const improvement =
              scores.length >= 2
                ? latestScore - scores[scores.length - 2]
                : null;
            return {
              subject,
              attempts: subjectAttempts,
              bestScore,
              latestScore,
              avgScore,
              improvement,
            };
          },
        );

        // Sort: subjects with the most retakes shown first
        groups.sort((a, b) => b.attempts.length - a.attempts.length);
        setSubjectProgress(groups);
      } catch (err) {
        console.warn("[AnalyticsPage] Failed to load attempt history:", err);
      } finally {
        setProgressLoading(false);
      }
    })();
  }, [user?.uid, examType]);

  const trend = useMemo(
    () => overview?.trend ?? [
      { label: "Mon", score: 0 }, { label: "Tue", score: 0 }, { label: "Wed", score: 0 },
      { label: "Thu", score: 0 }, { label: "Fri", score: 0 }, { label: "Sat", score: 0 }, { label: "Sun", score: 0 },
    ],
    [overview?.trend],
  );
  const streakDays = overview?.streak?.current_streak ?? 0;
  const avgScore = overview?.averageScore ?? 0;
  const subjectMasteries = overview?.subjectMasteries ?? [];
  // Recalculate grid when activity data changes
  const activityGridData = useMemo(() => buildActivityGrid(activityGrid), [activityGrid]);

  const trendDelta = useMemo(() => {
    if (trend.length < 2) return null;
    const first = trend[0].score;
    const last = trend[trend.length - 1].score;
    const diff = last - first;
    return diff;
  }, [trend]);
  return (
    <div className="animate-page-in space-y-5 md:space-y-8">
      {/* Header with Study Streak at top-right */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-0">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl md:text-4xl font-bold tracking-tight text-foreground">Analytics</h1>
          <p className="text-sm md:text-base text-muted">
            {examType
              ? `${examFullName} — your progress, mastery levels, and performance trends.`
              : "Your study progress, mastery levels, and performance trends."}
          </p>
        </div>
        {/* Study Streak Badge */}
        <div className="flex items-center gap-2 rounded-full bg-badge-amber-bg px-3 py-2 md:px-4 md:py-2.5 shadow-sm self-start sm:self-auto">
          <svg width="16" height="16" viewBox="0 0 22 22" fill="none">
            <path d="M11 2c0 4-4 5.5-4 9a4 4 0 0 0 8 0c0-3.5-4-5-4-9Z" fill="#F59E0B" />
          </svg>
          <div className="flex flex-col">
            <span className="text-xs md:text-sm font-bold text-badge-amber-text">
              {loading ? "—" : `${streakDays} ${streakDays === 1 ? "day" : "days"}`}
            </span>
            <span className="text-[9px] text-badge-amber-text/70 leading-none">Study Streak</span>
          </div>
        </div>
      </div>

      {/* Top metrics row */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
        {/* Average score ring */}
        <div className="glass rounded-2xl flex flex-col items-center justify-center gap-2 md:gap-3 p-2 md:p-5">
          <div className="md:hidden">
            <ProgressRing value={avgScore} size={78} strokeWidth={7} color="#2FA2E2" label={loading ? "—" : `${avgScore}%`} sublabel="Avg Score" />
          </div>
          <div className="hidden md:block">
            <ProgressRing value={avgScore} size={110} strokeWidth={10} color="#2FA2E2" label={loading ? "—" : `${avgScore}%`} sublabel="Avg Score" />
          </div>
          <div className="text-center mt-0.5 md:mt-1">
            <p className="text-xs md:text-sm font-semibold text-foreground">Average Score</p>
            <p className="text-[10px] md:text-xs text-muted">Across all exams</p>
          </div>
        </div>

        {/* Mastery ring — Building Foundation (Readiness Index) */}
        <div className="glass rounded-2xl flex flex-col items-center justify-center gap-2 md:gap-3 p-2 md:p-5">
          <div className="md:hidden">
            <ProgressRing value={readinessIndex} size={78} strokeWidth={7} color="#10B981" label={loading ? "—" : `${readinessIndex}%`} sublabel="Mastery" />
          </div>
          <div className="hidden md:block">
            <ProgressRing value={readinessIndex} size={110} strokeWidth={10} color="#10B981" label={loading ? "—" : `${readinessIndex}%`} sublabel="Mastery" />
          </div>
          <div className="text-center mt-0.5 md:mt-1">
            <p className="text-xs md:text-sm font-semibold text-foreground">Building Foundation</p>
            <p className="text-[10px] md:text-xs text-muted">Knowledge + streak bonus</p>
          </div>
        </div>

        {/* Study ring — Weekly Goal */}
        <div className="glass rounded-2xl flex flex-col items-center justify-center gap-2 md:gap-3 p-2 md:p-5">
          <div className="md:hidden">
            <ProgressRing value={Math.min((weeklyHours / 40) * 100, 100)} size={78} strokeWidth={7} color="#8B5CF6" label={loading ? "—" : `${Math.round((weeklyHours / 40) * 100)}%`} sublabel="Goal" />
          </div>
          <div className="hidden md:block">
            <ProgressRing value={Math.min((weeklyHours / 40) * 100, 100)} size={110} strokeWidth={10} color="#8B5CF6" label={loading ? "—" : `${Math.round((weeklyHours / 40) * 100)}%`} sublabel="Goal" />
          </div>
          <div className="text-center mt-0.5 md:mt-1">
            <p className="text-xs md:text-sm font-semibold text-foreground">Weekly Goal</p>
            <p className="text-[10px] md:text-xs text-muted">{weeklyHours.toFixed(1)} of 40 hrs</p>
          </div>
        </div>

        {/* Streak calendar */}
        <div className="glass rounded-2xl p-3 md:p-5 flex flex-col justify-between col-span-2 md:col-span-1">
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
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <span key={`${d}-${i}`} className="text-center text-[9px] font-semibold text-muted">
                {d}
              </span>
            ))}
            {activityGridData.map((day, i) => (
              <div
                key={i}
                className="aspect-square rounded-[3px]"
                style={{
                  backgroundColor: day.intensity > 0
                    ? `rgba(16,185,129,${day.intensity})`
                    : "var(--surface)",
                }}
                title={`${day.date}: ${day.count} ${day.count === 1 ? "exam" : "exams"}`}
              />
            ))}
          </div>

          <p className="text-[10px] text-muted text-center mt-2">
            {streakDays > 0 ? "Great job! Keep it up!" : "Start studying to build your streak!"}
          </p>
        </div>
      </div>

      {/* Score trend chart */}
      <div className="glass rounded-2xl p-4 md:p-6 space-y-3 md:space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-base md:text-lg font-semibold text-foreground">Score Trend</h2>
            <p className="text-xs text-muted">7-day performance overview</p>
          </div>
          {trendDelta !== null && trendDelta !== 0 && (
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${trendDelta > 0 ? "bg-success/10 text-success" : "bg-red-100 text-red-600"}`}>
              {trendDelta > 0 ? "↑" : "↓"} {Math.abs(trendDelta)}pts this week
            </span>
          )}
        </div>

        {/* Bar chart */}
        <ScoreTrendChart data={examHistory} sentiment={marketSentiment} isLoading={trendLoading} />
      </div>

      {/* Subject mastery — real data from analytics API */}
      <div className="glass rounded-2xl p-4 md:p-6 space-y-3 md:space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-base md:text-lg font-semibold text-foreground">Subject Mastery</h2>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 md:gap-x-8 gap-y-3 md:gap-y-4">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 md:gap-x-8 gap-y-3 md:gap-y-4">
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

      {/* Exam Progress — attempt history, score progression, retake tracking */}
      <ExamProgressSection
        subjectGroups={subjectProgress}
        loading={progressLoading}
      />
    </div>
  );
}
