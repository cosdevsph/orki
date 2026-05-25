"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { AttemptHistoryItem } from "@/shared/firebase/firestore";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SubjectProgress = {
  subject: string;
  /** Attempts sorted ascending by attempt_number. */
  attempts: AttemptHistoryItem[];
  bestScore: number;
  latestScore: number;
  avgScore: number;
  /** latestScore − second-to-latest score. Null when only one attempt exists. */
  improvement: number | null;
};

type Props = {
  subjectGroups: SubjectProgress[];
  loading: boolean;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function scoreColor(score: number): string {
  if (score >= 80) return "#10B981";
  if (score >= 60) return "#2FA2E2";
  return "#F59E0B";
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ExamProgressSection({ subjectGroups, loading }: Props) {
  const [activeSubject, setActiveSubject] = useState<string | null>(null);

  // Gracefully resolve the selected group (falls back to first if state is stale)
  const selected =
    subjectGroups.find((g) => g.subject === activeSubject) ??
    subjectGroups[0] ??
    null;

  const totalAttempts = subjectGroups.reduce(
    (sum, g) => sum + g.attempts.length,
    0,
  );

  // Chart data for the selected subject — ascending so attempt #1 is leftmost
  const chartData =
    selected?.attempts.map((a) => ({
      attempt: `#${a.attempt_number}`,
      score: a.score,
    })) ?? [];

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="glass rounded-2xl p-4 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <div className="h-5 w-36 rounded-lg bg-surface animate-pulse" />
            <div className="h-3 w-52 rounded-lg bg-surface animate-pulse" />
          </div>
        </div>
        <div className="space-y-2 animate-pulse">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-surface" />
          ))}
        </div>
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (subjectGroups.length === 0) {
    return (
      <div className="glass rounded-2xl p-4 md:p-6">
        <h2 className="font-heading text-base md:text-lg font-semibold text-foreground mb-0.5">
          Exam Progress
        </h2>
        <p className="text-xs text-muted mb-5">
          Track your improvement across retakes
        </p>
        <p className="text-sm text-muted text-center py-6">
          Complete a mock exam to start tracking your attempt history.
        </p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-4 md:p-6 space-y-4 md:space-y-5">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-base md:text-lg font-semibold text-foreground">
            Exam Progress
          </h2>
          <p className="text-xs text-muted">
            Track your improvement across retakes
          </p>
        </div>
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
          {totalAttempts} {totalAttempts === 1 ? "attempt" : "attempts"}
        </span>
      </div>

      {/* ── Subject Navigation — scrollable cards, one per subject ─────────── */}
      <div className="flex gap-2 overflow-x-auto pb-0.5">
        {subjectGroups.map((g) => {
          const isActive = g.subject === (selected?.subject ?? "");
          return (
            <button
              key={g.subject}
              type="button"
              onClick={() => setActiveSubject(g.subject)}
              className={`flex-none flex flex-col gap-1 rounded-xl p-3 text-left transition-all w-[140px] min-w-[110px] ${
                isActive
                  ? "border border-primary/30 bg-primary/5 shadow-sm"
                  : "bg-surface hover:opacity-80"
              }`}
            >
              <span className="text-[11px] font-semibold text-foreground leading-tight line-clamp-2">
                {g.subject}
              </span>
              <span
                className="font-heading text-xl font-bold leading-tight"
                style={{ color: scoreColor(g.latestScore) }}
              >
                {g.latestScore}%
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-muted">
                  {g.attempts.length}{" "}
                  {g.attempts.length === 1 ? "attempt" : "attempts"}
                </span>
                {g.improvement !== null && (
                  <span
                    className={`text-[9px] font-bold ${
                      g.improvement > 0
                        ? "text-emerald-600"
                        : g.improvement < 0
                          ? "text-red-500"
                          : "text-muted"
                    }`}
                  >
                    {g.improvement > 0
                      ? `↑ +${g.improvement}%`
                      : g.improvement < 0
                        ? `↓ ${g.improvement}%`
                        : "→"}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {selected && (
        <>
          {/* ── Stats Row ────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            {(
              [
                { label: "Best", value: selected.bestScore, color: "#10B981" },
                { label: "Latest", value: selected.latestScore, color: "#2FA2E2" },
                { label: "Average", value: selected.avgScore, color: "#8B5CF6" },
              ] as const
            ).map(({ label, value, color }) => (
              <div key={label} className="rounded-xl bg-surface p-3 text-center">
                <p
                  className="font-heading text-xl md:text-2xl font-bold leading-none"
                  style={{ color }}
                >
                  {value}%
                </p>
                <p className="mt-0.5 text-[10px] text-muted">{label}</p>
              </div>
            ))}
          </div>

          {/* ── Improvement indicator (latest vs previous) ───────────────────── */}
          {selected.improvement !== null && (
            <div
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold ${
                selected.improvement > 0
                  ? "bg-emerald-500/10 text-emerald-600"
                  : selected.improvement < 0
                    ? "bg-red-500/10 text-red-500"
                    : "bg-surface text-muted"
              }`}
            >
              <span className="text-base leading-none">
                {selected.improvement > 0
                  ? "↑"
                  : selected.improvement < 0
                    ? "↓"
                    : "→"}
              </span>
              <span>
                {selected.improvement > 0
                  ? `+${selected.improvement}% improvement on latest retake`
                  : selected.improvement < 0
                    ? `${selected.improvement}% decline on latest retake`
                    : "No change on latest retake"}
              </span>
            </div>
          )}

          {/* ── Score Progression Chart (2+ attempts only) ───────────────────── */}
          {selected.attempts.length >= 2 && (
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
                Score Progression
              </p>
              <div style={{ height: 160 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 4, right: 8, left: -24, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(100,100,100,0.1)"
                    />
                    <XAxis
                      dataKey="attempt"
                      tick={{ fontSize: 11 }}
                      stroke="rgba(100,100,100,0.4)"
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 11 }}
                      stroke="rgba(100,100,100,0.4)"
                    />
                    <ReferenceLine
                      y={75}
                      stroke="rgba(100,100,100,0.25)"
                      strokeDasharray="4 4"
                      label={{
                        value: "75%",
                        position: "right",
                        fill: "rgba(100,100,100,0.5)",
                        fontSize: 10,
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(20,20,20,0.85)",
                        border: "1px solid rgba(100,100,100,0.3)",
                        borderRadius: "8px",
                        color: "#fff",
                        fontSize: 12,
                      }}
                      formatter={(value) =>
                        value != null ? [`${value}%`, "Score"] : ["—", "Score"]
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#2FA2E2"
                      strokeWidth={2.5}
                      dot={{ fill: "#2FA2E2", r: 4 }}
                      activeDot={{ r: 6 }}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* ── Attempt Timeline (latest first) ──────────────────────────────── */}
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
              Attempt History
            </p>

            {[...selected.attempts].reverse().map((attempt, idx, arr) => {
              // arr is reversed, so arr[idx+1] is the chronologically prior attempt
              const prevAttempt = arr[idx + 1];
              const delta = prevAttempt
                ? attempt.score - prevAttempt.score
                : null;
              const isLatest = idx === 0;

              return (
                <div
                  key={attempt.id}
                  className={`flex items-center gap-3 rounded-xl p-3 transition-all ${
                    isLatest
                      ? "border border-primary/20 bg-primary/5"
                      : "bg-surface"
                  }`}
                >
                  {/* Attempt number badge */}
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-black/5">
                    <span className="text-[9px] font-bold uppercase text-muted">
                      Attempt
                    </span>
                    <span className="text-lg font-bold leading-none text-foreground">
                      #{attempt.attempt_number}
                    </span>
                  </div>

                  {/* Score */}
                  <div className="w-14 shrink-0 text-center">
                    <p
                      className="font-heading text-xl font-bold leading-none"
                      style={{ color: scoreColor(attempt.score) }}
                    >
                      {attempt.score}%
                    </p>
                    <p className="text-[10px] text-muted">
                      {attempt.total_correct}/{attempt.total_questions}
                    </p>
                  </div>

                  {/* Meta: time + date */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="text-xs text-muted">
                        {formatDuration(attempt.time_spent_seconds)}
                      </span>
                      <span className="text-xs text-muted/40">·</span>
                      <span className="text-xs text-muted">
                        {formatDate(attempt.completed_at)}
                      </span>
                    </div>
                    {isLatest && (
                      <span className="mt-0.5 inline-block rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                        Latest
                      </span>
                    )}
                  </div>

                  {/* Delta vs previous attempt */}
                  {delta !== null ? (
                    <div
                      className={`shrink-0 rounded-lg px-2 py-1 text-xs font-bold ${
                        delta > 0
                          ? "bg-emerald-500/10 text-emerald-600"
                          : delta < 0
                            ? "bg-red-500/10 text-red-500"
                            : "bg-surface text-muted"
                      }`}
                    >
                      {delta > 0 ? `+${delta}%` : `${delta}%`}
                    </div>
                  ) : (
                    <div className="shrink-0 rounded-lg bg-black/5 px-2 py-1 text-[10px] font-semibold text-muted">
                      1st
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* View full history — navigates to subject detail & comparison page */}
          <Link
            href={`/analytics/subject/${encodeURIComponent(selected.subject)}`}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-primary/20 bg-primary/5 py-2.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
          >
            View full history & compare
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </>
      )}
    </div>
  );
}
