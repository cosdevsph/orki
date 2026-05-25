"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import type { SubjectMasteryItem } from "@/entities/analytics/types";
import { ProgressRing } from "@/components/ui/progress-ring";
import { WelcomeHeader } from "@/widgets/dashboard/welcome-header";
import { MotivationWidget } from "@/widgets/dashboard/motivation-widget";
import { StatsRow } from "@/widgets/dashboard/stats-row";
import { getAnalyticsDocument, getRecentExamAttempts } from "@/shared/firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { useExamType } from "@/hooks/useExamType";
import { SUBJECT_COLORS, getSubjectsByExam } from "@/shared/utils/exam-type";

function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return "Today, " + then.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  if (diffHours < 24) return "Today, " + then.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  if (diffHours < 48) return "Yesterday, " + then.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return then.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function ActivityIcon({ icon }: { icon: string }) {
  if (icon === "exam") return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/10">
      <svg width="14" height="14" viewBox="0 0 22 22" fill="none" className="text-success">
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
  if (icon === "flashcard") return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
      <svg width="14" height="14" viewBox="0 0 22 22" fill="none" className="text-primary">
        <rect x="3.667" y="2.75" width="14.667" height="16.5" rx="2.2" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    </div>
  );
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50">
      <svg width="14" height="14" viewBox="0 0 22 22" fill="none" className="text-amber-600">
        <rect x="2.75" y="6.417" width="16.5" height="11" rx="2.2" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    </div>
  );
}

function SubjectMasteryCard({ masteries, examType }: { masteries: SubjectMasteryItem[]; examType: string | null }) {
  if (masteries.length === 0) {
    return (
      <div className="glass rounded-2xl p-4 md:p-6 space-y-4">
        <h2 className="font-heading text-lg font-semibold text-foreground">Subject Mastery</h2>
        <p className="text-sm text-muted text-center py-4">
          Complete your first exam to track subject mastery.
        </p>
      </div>
    );
  }
  return (
    <div className="glass rounded-2xl p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-foreground">Subject Mastery</h2>
        {examType && (
          <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ background: "rgba(47,162,226,0.1)", color: "#2FA2E2" }}>
            {examType}
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 md:gap-x-8 gap-y-3">
        {masteries.map((sub, idx) => {
          const color = SUBJECT_COLORS[idx % SUBJECT_COLORS.length];
          const pct = Math.round(sub.mastery_percentage);
          return (
            <div key={sub.subject} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{sub.subject}</span>
                <span className="text-sm font-semibold" style={{ color }}>{pct}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-track">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Readiness tier label ──────────────────────────────────────────────────────
function readinessLabel(score: number): string {
  if (score >= 85) return "Exam Ready";
  if (score >= 70) return "Almost Ready";
  if (score >= 40) return "Progressing";
  return "Building Foundation";
}

// ─── Activity item type ────────────────────────────────────────────────────────
type ActivityItem = {
  title: string;
  subtitle?: string;
  timestamp: string;
  icon: "exam" | "flashcard" | "other";
};

export default function DashboardPage() {
  const { examType } = useExamType();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [readiness, setReadiness] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [weeklyHours, setWeeklyHours] = useState(0);
  const [avgScore, setAvgScore] = useState(0);
  const [subjectMasteries, setSubjectMasteries] = useState<SubjectMasteryItem[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const uid = user?.uid;
    if (!uid || !examType) {
      setLoading(false);
      return;
    }

    setLoading(true);
    void Promise.all([
      getAnalyticsDocument(uid),
      getRecentExamAttempts(uid, examType, 5),
    ])
      .then(([doc, attempts]) => {
        if (doc && doc.examType === examType) {
          // Build subject mastery list (mirrors analytics page logic)
          const subjects = getSubjectsByExam(examType);
          const masteries: SubjectMasteryItem[] = subjects
            .filter((s) => doc.subjects[s.name] !== undefined)
            .map((s) => {
              const data = doc.subjects[s.name];
              return {
                subject: s.name,
                exam_type: examType,
                mastery_percentage: Math.round(data.subjectMastery),
                total_questions_attempted: data.totalTries,
                total_questions_correct: Math.round(
                  (data.runningAverage / 100) * data.totalTries,
                ),
                weak_topics: [],
                strong_topics: [],
                last_updated: new Date().toISOString(),
              };
            });
          setSubjectMasteries(masteries);

          const avg =
            masteries.length > 0
              ? Math.round(
                  masteries.reduce((sum, s) => sum + s.mastery_percentage, 0) /
                    masteries.length,
                )
              : 0;
          setAvgScore(avg);

          // Readiness = avg mastery + streak bonus (same formula as analytics page)
          const streak = doc.streak?.currentStreak ?? 0;
          const streakBonus = Math.min(streak * 2, 40);
          setReadiness(Math.min(avg + streakBonus, 100));
          setStreakDays(streak);
          setWeeklyHours(doc.currentWeeklyHours ?? 0);
        }

        // Build recent activity feed from latest exam attempts
        setRecentActivity(
          attempts.map((a) => ({
            title: `${a.subject}${
              a.attempt_number ? ` — Attempt #${a.attempt_number}` : ""
            }`,
            subtitle: `${a.score}% · ${a.total_correct}/${a.total_questions} correct`,
            timestamp:
              a.completed_at?.toISOString() ?? new Date().toISOString(),
            icon: "exam" as const,
          })),
        );
      })
      .catch((err) => {
        console.warn("[Dashboard] Failed to load Firestore data:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user?.uid, examType]);

  return (
    <div className="animate-page-in space-y-5 md:space-y-8">
      <WelcomeHeader />

      {/* Daily Motivation */}
      <MotivationWidget />

      {/* Stats row */}
      <StatsRow streakDays={streakDays} avgScore={avgScore} weeklyHours={weeklyHours} />

      {/* Overall Readiness + Recent Activity row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-5">
        {/* Overall Readiness Card */}
        <div className="md:col-span-3 glass rounded-2xl p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6">
          <ProgressRing
            value={readiness}
            size={120}
            strokeWidth={12}
            color="#10B981"
            label={loading ? "—" : `${readiness}%`}
            sublabel="READINESS"
          />
          <div className="flex-1 space-y-2">
            <h2 className="font-heading text-xl md:text-2xl font-bold text-foreground">Overall Readiness</h2>
            <p className="text-sm text-muted leading-relaxed">
              {loading
                ? "Loading your performance data…"
                : readiness === 0
                ? "Start your first mock exam to track your readiness score."
                : `You're at ${readiness}% readiness — ${readinessLabel(readiness)}. Keep practicing to improve your score.`}
            </p>
            <Link
              href="/analytics"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-primary/90 hover:shadow-primary/25"
            >
              View Detailed Analysis
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M5.25 2.917 9.333 7 5.25 11.083" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="md:col-span-2 glass rounded-2xl p-4 md:p-6 space-y-4">
          <h3 className="font-heading text-lg font-bold text-foreground">Recent Activity</h3>
          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-start gap-3 animate-pulse">
                  <div className="h-8 w-8 rounded-full bg-surface" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 rounded bg-surface w-3/4" />
                    <div className="h-2.5 rounded bg-surface w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-start gap-3">
                  <ActivityIcon icon={activity.icon} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{activity.title}</p>
                    <p className="text-[11px] text-muted">{formatRelativeTime(activity.timestamp)}</p>
                    {activity.subtitle && (
                      <p className="text-[11px] font-semibold text-success mt-0.5">↗ {activity.subtitle}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted py-2">No recent activity yet. Start studying!</p>
          )}
          <Link href="/analytics" className="block w-full text-center text-xs font-medium text-muted hover:text-foreground transition-colors">
            View Full History →
          </Link>
        </div>
      </div>

      {/* Subject Mastery */}
      <SubjectMasteryCard masteries={subjectMasteries} examType={examType} />

      {/* Continue Studying */}
      <section className="space-y-4">
        <h2 className="font-heading text-lg font-semibold text-foreground">Continue Studying</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          <Link href="/exams" className="glass card-hover flex items-center gap-4 rounded-2xl p-4 md:p-5">
            <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-2xl bg-primary/10">
              <svg width="20" height="20" viewBox="0 0 22 22" fill="none" className="text-primary">
                <rect x="3.667" y="2.75" width="14.667" height="16.5" rx="2.2" stroke="currentColor" strokeWidth="1.6" />
                <path d="M7.333 7.333h7.334M7.333 11h7.334" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">Mock Exams</p>
              <p className="text-xs text-muted">Practice with real questions</p>
            </div>
            <div className="text-xs font-medium text-primary flex items-center gap-1">
              Start
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M5.25 2.917 9.333 7 5.25 11.083" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </Link>
          <Link href="/flashcards" className="glass card-hover flex items-center gap-4 rounded-2xl p-4 md:p-5">
            <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-2xl bg-amber-50">
              <svg width="20" height="20" viewBox="0 0 22 22" fill="none" className="text-amber-600">
                <rect x="2.75" y="6.417" width="16.5" height="11" rx="2.2" stroke="currentColor" strokeWidth="1.6" />
                <path d="M6.417 6.417V5.042a1.833 1.833 0 0 1 1.833-1.834h5.5A1.833 1.833 0 0 1 15.583 5.042v1.375" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">Due Flashcards</p>
              <p className="text-xs text-muted">
                {loading ? "Loading…" : "Review your flashcard decks"}
              </p>
            </div>
            <div className="text-xs font-medium text-primary flex items-center gap-1">
              Review
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M5.25 2.917 9.333 7 5.25 11.083" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </Link>
          <Link href="/analytics" className="glass card-hover flex items-center gap-4 rounded-2xl p-4 md:p-5">
            <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-2xl bg-success/10">
              <svg width="20" height="20" viewBox="0 0 22 22" fill="none" className="text-success">
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">Analytics</p>
              <p className="text-xs text-muted">View progress & insights</p>
            </div>
            <div className="text-xs font-medium text-primary flex items-center gap-1">
              View
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M5.25 2.917 9.333 7 5.25 11.083" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </Link>
        </div>
      </section>

      {/* Study streak badge */}
      {streakDays > 0 && (
        <div className="flex items-center justify-end">
          <div className="glass flex items-center gap-2 rounded-full px-4 py-2">
            <svg width="14" height="14" viewBox="0 0 22 22" fill="none">
              <path d="M11 2c0 4-4 5.5-4 9a4 4 0 0 0 8 0c0-3.5-4-5-4-9Z" fill="#F59E0B" />
            </svg>
            <span className="text-xs font-bold text-amber-600">
              {streakDays}-day streak — keep it up!
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
