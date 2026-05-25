"use client";

import { use, useEffect, useState } from "react";
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

import { getAttemptHistory, type AttemptHistoryItem } from "@/shared/firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { useExamType } from "@/hooks/useExamType";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 80) return "#10B981";
  if (score >= 60) return "#2FA2E2";
  return "#F59E0B";
}

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

function timeDiffLabel(diff: number): string {
  if (diff === 0) return "Same";
  const abs = Math.abs(diff);
  return `${formatDuration(abs)} ${diff < 0 ? "faster" : "longer"}`;
}

// ─── Comparison Row ───────────────────────────────────────────────────────────

type CompareRowProps = {
  label: string;
  a: string;
  b: string;
  diff?: string;
  /** true = good, false = bad, null = neutral */
  diffPositive?: boolean | null;
};

function CompareRow({ label, a, b, diff, diffPositive }: CompareRowProps) {
  return (
    <div className="grid grid-cols-[1fr_80px_1fr] items-center gap-2 py-2.5 border-b border-white/5 last:border-0">
      <span className="text-sm font-semibold text-foreground text-right">{a}</span>
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-[9px] font-semibold text-muted uppercase tracking-wider">
          {label}
        </span>
        {diff != null && (
          <span
            className={`text-[11px] font-bold leading-tight text-center ${
              diffPositive === true
                ? "text-emerald-600"
                : diffPositive === false
                  ? "text-red-500"
                  : "text-muted"
            }`}
          >
            {diff}
          </span>
        )}
      </div>
      <span className="text-sm font-semibold text-foreground">{b}</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Props = {
  params: Promise<{ subject: string }>;
};

export default function SubjectProgressPage({ params }: Props) {
  const { subject: encodedSubject } = use(params);
  const subject = decodeURIComponent(encodedSubject);

  const { user } = useAuth();
  const { examType, examFullName } = useExamType();

  const [attempts, setAttempts] = useState<AttemptHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Comparison selectors
  const [compareA, setCompareA] = useState("");
  const [compareB, setCompareB] = useState("");

  useEffect(() => {
    const uid = user?.uid;
    if (!uid || !examType) return;

    void (async () => {
      setLoading(true);
      try {
        const all = await getAttemptHistory(uid, examType);
        setAttempts(all.filter((a) => a.subject === subject));
      } catch (err) {
        console.warn("[SubjectProgressPage] Failed to load attempts:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.uid, examType, subject]);

  // Derived stats
  const bestScore =
    attempts.length > 0 ? Math.max(...attempts.map((a) => a.score)) : 0;
  const latestScore = attempts.at(-1)?.score ?? 0;
  const avgScore =
    attempts.length > 0
      ? Math.round(
          attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length,
        )
      : 0;
  const totalTimeSec = attempts.reduce((sum, a) => sum + a.time_spent_seconds, 0);

  const chartData = attempts.map((a) => ({
    attempt: `#${a.attempt_number}`,
    score: a.score,
  }));

  // Comparison
  const attemptA = attempts.find((a) => a.id === compareA) ?? null;
  const attemptB = attempts.find((a) => a.id === compareB) ?? null;
  const canCompare = attemptA !== null && attemptB !== null && compareA !== compareB;

  const scoreDiff = canCompare ? attemptB!.score - attemptA!.score : null;
  const timeDiff = canCompare
    ? attemptB!.time_spent_seconds - attemptA!.time_spent_seconds
    : null;
  const correctDiff = canCompare
    ? attemptB!.total_correct - attemptA!.total_correct
    : null;

  return (
    <div className="animate-page-in space-y-5 md:space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-0.5">
          <Link
            href="/analytics"
            className="inline-flex items-center gap-1 text-xs text-muted hover:text-foreground transition-colors mb-1.5"
          >
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
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Analytics
          </Link>
          <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            {subject}
          </h1>
          {examFullName && (
            <p className="text-sm text-muted">{examFullName}</p>
          )}
        </div>
        {examType && (
          <span
            className="mt-1 shrink-0 rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: "rgba(47,162,226,0.1)", color: "#2FA2E2" }}
          >
            {examType}
          </span>
        )}
      </div>

      {/* ── Loading ─────────────────────────────────────────────────────────── */}
      {loading && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="glass rounded-2xl p-4 animate-pulse space-y-2"
              >
                <div className="h-8 w-14 rounded-lg bg-surface mx-auto" />
                <div className="h-3 w-16 rounded bg-surface mx-auto" />
              </div>
            ))}
          </div>
          <div className="glass rounded-2xl h-52 animate-pulse" />
          <div className="glass rounded-2xl h-40 animate-pulse" />
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────────────────────────── */}
      {!loading && attempts.length === 0 && (
        <div className="glass rounded-2xl p-10 text-center space-y-3">
          <p className="text-muted text-sm">
            No tracked attempts found for &ldquo;{subject}&rdquo;.
          </p>
          <Link
            href="/analytics"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            ← Back to Analytics
          </Link>
        </div>
      )}

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      {!loading && attempts.length > 0 && (
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(
              [
                {
                  label: "Attempts",
                  value: attempts.length.toString(),
                  color: undefined,
                },
                { label: "Best", value: `${bestScore}%`, color: "#10B981" },
                {
                  label: "Latest",
                  value: `${latestScore}%`,
                  color: "#2FA2E2",
                },
                {
                  label: "Average",
                  value: `${avgScore}%`,
                  color: "#8B5CF6",
                },
              ] as const
            ).map(({ label, value, color }) => (
              <div key={label} className="glass rounded-2xl p-4 text-center">
                <p
                  className="font-heading text-2xl md:text-3xl font-bold leading-none"
                  style={color ? { color } : undefined}
                >
                  {value}
                </p>
                <p className="text-xs text-muted mt-1.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Score Progression Chart */}
          {attempts.length >= 2 && (
            <div className="glass rounded-2xl p-4 md:p-6 space-y-3">
              <div>
                <h2 className="font-heading text-base font-semibold text-foreground">
                  Score Progression
                </h2>
                <p className="text-xs text-muted">
                  All {attempts.length} attempts — total time{" "}
                  {formatDuration(totalTimeSec)}
                </p>
              </div>
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 4, right: 16, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(100,100,100,0.1)"
                    />
                    <XAxis
                      dataKey="attempt"
                      tick={{ fontSize: 12 }}
                      stroke="rgba(100,100,100,0.4)"
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 12 }}
                      stroke="rgba(100,100,100,0.4)"
                    />
                    <ReferenceLine
                      y={75}
                      stroke="rgba(100,100,100,0.3)"
                      strokeDasharray="4 4"
                      label={{
                        value: "75% pass",
                        position: "right",
                        fill: "rgba(100,100,100,0.5)",
                        fontSize: 11,
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(20,20,20,0.9)",
                        border: "1px solid rgba(100,100,100,0.3)",
                        borderRadius: "10px",
                        color: "#fff",
                        fontSize: 13,
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
                      dot={{ fill: "#2FA2E2", r: 5 }}
                      activeDot={{ r: 7 }}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* ── Compare Attempts ──────────────────────────────────────────────── */}
          {attempts.length >= 2 && (
            <div className="glass rounded-2xl p-4 md:p-6 space-y-4">
              <div>
                <h2 className="font-heading text-base font-semibold text-foreground">
                  Compare Attempts
                </h2>
                <p className="text-xs text-muted">
                  Select two attempts to see a side-by-side breakdown
                </p>
              </div>

              {/* Selectors */}
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <select
                  value={compareA}
                  onChange={(e) => setCompareA(e.target.value)}
                  className="rounded-xl bg-surface px-3 py-2.5 text-sm text-foreground border border-white/10 focus:outline-none focus:border-primary/50 transition-colors"
                >
                  <option value="">Attempt A…</option>
                  {attempts.map((a) => (
                    <option key={a.id} value={a.id}>
                      Attempt #{a.attempt_number} — {a.score}%
                    </option>
                  ))}
                </select>

                <span className="text-sm font-bold text-muted text-center select-none">
                  vs
                </span>

                <select
                  value={compareB}
                  onChange={(e) => setCompareB(e.target.value)}
                  className="rounded-xl bg-surface px-3 py-2.5 text-sm text-foreground border border-white/10 focus:outline-none focus:border-primary/50 transition-colors"
                >
                  <option value="">Attempt B…</option>
                  {attempts.map((a) => (
                    <option key={a.id} value={a.id}>
                      Attempt #{a.attempt_number} — {a.score}%
                    </option>
                  ))}
                </select>
              </div>

              {/* Comparison result */}
              {canCompare && attemptA && attemptB && (
                <div className="rounded-xl border border-white/10 overflow-hidden">
                  {/* Attempt label headers */}
                  <div className="grid grid-cols-[1fr_80px_1fr] bg-surface/50">
                    <div className="p-3 text-right">
                      <span className="text-xs font-bold text-primary">
                        Attempt #{attemptA.attempt_number}
                      </span>
                      <p className="text-[10px] text-muted mt-0.5">
                        {formatDate(attemptA.completed_at)}
                      </p>
                    </div>
                    <div className="border-x border-white/10" />
                    <div className="p-3">
                      <span className="text-xs font-bold text-primary">
                        Attempt #{attemptB.attempt_number}
                      </span>
                      <p className="text-[10px] text-muted mt-0.5">
                        {formatDate(attemptB.completed_at)}
                      </p>
                    </div>
                  </div>
                  <div className="px-4 py-1">
                    <CompareRow
                      label="Score"
                      a={`${attemptA.score}%`}
                      b={`${attemptB.score}%`}
                      diff={
                        scoreDiff !== null
                          ? scoreDiff === 0
                            ? "No change"
                            : scoreDiff > 0
                              ? `+${scoreDiff}%`
                              : `${scoreDiff}%`
                          : undefined
                      }
                      diffPositive={
                        scoreDiff === null || scoreDiff === 0
                          ? null
                          : scoreDiff > 0
                      }
                    />
                    <CompareRow
                      label="Correct"
                      a={`${attemptA.total_correct}/${attemptA.total_questions}`}
                      b={`${attemptB.total_correct}/${attemptB.total_questions}`}
                      diff={
                        correctDiff !== null
                          ? correctDiff === 0
                            ? "Same"
                            : correctDiff > 0
                              ? `+${correctDiff} more`
                              : `${correctDiff} fewer`
                          : undefined
                      }
                      diffPositive={
                        correctDiff === null || correctDiff === 0
                          ? null
                          : correctDiff > 0
                      }
                    />
                    <CompareRow
                      label="Time"
                      a={formatDuration(attemptA.time_spent_seconds)}
                      b={formatDuration(attemptB.time_spent_seconds)}
                      diff={timeDiff !== null ? timeDiffLabel(timeDiff) : undefined}
                      diffPositive={
                        timeDiff === null || timeDiff === 0
                          ? null
                          : timeDiff < 0 // faster = positive
                      }
                    />
                  </div>
                </div>
              )}

              {compareA !== "" && compareB !== "" && compareA === compareB && (
                <p className="text-xs text-muted text-center py-1">
                  Select two different attempts to compare.
                </p>
              )}
            </div>
          )}

          {/* ── Full Attempt History ──────────────────────────────────────────── */}
          <div className="glass rounded-2xl p-4 md:p-6 space-y-3">
            <div>
              <h2 className="font-heading text-base font-semibold text-foreground">
                All Attempts
              </h2>
              <p className="text-xs text-muted">
                {attempts.length} tracked{" "}
                {attempts.length === 1 ? "attempt" : "attempts"} · tap to view
                full results
              </p>
            </div>

            <div className="space-y-2">
              {[...attempts].reverse().map((attempt, idx, arr) => {
                const prevAttempt = arr[idx + 1];
                const delta = prevAttempt
                  ? attempt.score - prevAttempt.score
                  : null;
                const isLatest = idx === 0;

                return (
                  <Link
                    key={attempt.id}
                    href={`/exams/results/${attempt.id}`}
                    className={`flex items-center gap-3 rounded-xl p-3 transition-all group ${
                      isLatest
                        ? "border border-primary/20 bg-primary/5 hover:bg-primary/10"
                        : "bg-surface hover:bg-surface/80"
                    }`}
                  >
                    {/* Attempt badge */}
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

                    {/* Meta */}
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

                    {/* Delta + chevron */}
                    <div className="flex items-center gap-2 shrink-0">
                      {delta !== null ? (
                        <span
                          className={`rounded-lg px-2 py-1 text-xs font-bold ${
                            delta > 0
                              ? "bg-emerald-500/10 text-emerald-600"
                              : delta < 0
                                ? "bg-red-500/10 text-red-500"
                                : "bg-surface text-muted"
                          }`}
                        >
                          {delta > 0 ? `+${delta}%` : `${delta}%`}
                        </span>
                      ) : (
                        <span className="rounded-lg bg-black/5 px-2 py-1 text-[10px] font-semibold text-muted">
                          1st
                        </span>
                      )}
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-muted group-hover:text-foreground transition-colors"
                        aria-hidden="true"
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
