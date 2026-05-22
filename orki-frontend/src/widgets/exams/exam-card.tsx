import type { Exam, ExamStatus } from "@/entities/exams/types";

const STATUS_CONFIG: Record<
  ExamStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  scheduled: {
    label: "Scheduled",
    bg: "rgba(47,162,226,0.1)",
    text: "#2FA2E2",
    dot: "#2FA2E2",
  },
  in_progress: {
    label: "In Progress",
    bg: "rgba(245,158,11,0.12)",
    text: "#D97706",
    dot: "#F59E0B",
  },
  completed: {
    label: "Completed",
    bg: "rgba(16,185,129,0.1)",
    text: "#059669",
    dot: "#10B981",
  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

type ExamCardProps = {
  exam: Exam;
  subject?: string;
  difficulty?: "Beginner" | "Intermediate" | "Advanced";
  questionCount?: number;
};

const DIFFICULTY_COLORS = {
  Beginner: { bg: "rgba(16,185,129,0.1)", text: "#059669" },
  Intermediate: { bg: "rgba(245,158,11,0.1)", text: "#D97706" },
  Advanced: { bg: "rgba(239,68,68,0.1)", text: "#DC2626" },
};

export function ExamCard({
  exam,
  subject = "General",
  difficulty = "Intermediate",
  questionCount = 50,
}: ExamCardProps) {
  const status = STATUS_CONFIG[exam.status];
  const diffColor = DIFFICULTY_COLORS[difficulty];
  const isCompleted = exam.status === "completed";

  return (
    <div
      className={[
        "glass card-hover group flex flex-col gap-3 md:gap-4 rounded-2xl p-4 md:p-5 transition-all",
        isCompleted ? "opacity-70" : "",
      ].join(" ")}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: diffColor.bg, color: diffColor.text }}>
              {difficulty}
            </span>
            <span className="text-xs text-muted">{subject}</span>
          </div>
          <h3 className="font-heading text-base font-bold leading-snug text-foreground">
            {exam.title}
          </h3>
        </div>

        {/* Status badge */}
        <div className="flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1" style={{ backgroundColor: status.bg }}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: status.dot }} />
          <span className="text-[11px] font-semibold" style={{ color: status.text }}>
            {status.label}
          </span>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M7 4.083V7l1.833 1.833" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          {exam.durationMinutes} min
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <rect x="1.75" y="2.333" width="10.5" height="9.917" rx="1.4" stroke="currentColor" strokeWidth="1.4" />
            <path d="M4.667 1.167v2.333M9.333 1.167v2.333M1.75 5.25h10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          {formatDate(exam.scheduledAt)}
        </span>
        <span>{formatTime(exam.scheduledAt)}</span>
        <span className="flex items-center gap-1.5">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <rect x="1.75" y="3.5" width="10.5" height="7.583" rx="1.4" stroke="currentColor" strokeWidth="1.4" />
            <path d="M4.667 6.417h4.666M4.667 8.75h2.916" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          {questionCount} questions
        </span>
      </div>

      {/* CTA */}
      {!isCompleted && (
        <div className="flex items-center justify-between pt-1">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-black/6">
            <div
              className="h-full rounded-full bg-primary/60"
              style={{ width: exam.status === "in_progress" ? "45%" : "0%" }}
            />
          </div>
          <button
            type="button"
            className="ml-4 flex shrink-0 items-center gap-1.5 rounded-xl bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary transition-all duration-150 hover:bg-primary hover:text-white"
          >
            {exam.status === "in_progress" ? "Continue" : "Start"}
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
              <path d="M5.25 2.917 9.333 7 5.25 11.083" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
