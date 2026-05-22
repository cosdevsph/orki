import type { Exam } from "@/entities/exams/types";

const UPCOMING: Exam[] = [
  {
    id: "1",
    title: "Anatomy – Upper Limb",
    scheduledAt: "2026-05-10T09:00:00Z",
    durationMinutes: 60,
    status: "scheduled",
  },
  {
    id: "4",
    title: "Pharmacology – Antibiotics",
    scheduledAt: "2026-05-15T11:00:00Z",
    durationMinutes: 90,
    status: "scheduled",
  },
  {
    id: "5",
    title: "Pathology – Inflammation",
    scheduledAt: "2026-05-12T13:00:00Z",
    durationMinutes: 60,
    status: "scheduled",
  },
];

function formatExamDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getDaysUntil(iso: string): number {
  const now = new Date();
  const target = new Date(iso);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function UpcomingExamsWidget() {
  return (
    <div className="space-y-3">
      <h2 className="font-heading text-lg font-semibold text-foreground">Upcoming Exams</h2>
      <div className="glass rounded-2xl divide-y divide-black/[0.04] overflow-hidden">
        {UPCOMING.map((exam) => {
          const daysLeft = getDaysUntil(exam.scheduledAt);
          const isUrgent = daysLeft <= 3;

          return (
            <div
              key={exam.id}
              className="flex items-center justify-between px-4 py-3 md:px-5 md:py-4 transition-colors hover:bg-black/[0.02]"
            >
                <div className="flex items-center gap-3 md:gap-4">
                <div
                  className="flex h-10 w-10 flex-col items-center justify-center rounded-xl text-center"
                  style={{
                    backgroundColor: isUrgent ? "rgba(239,68,68,0.1)" : "rgba(47,162,226,0.1)",
                  }}
                >
                  <span
                    className="text-[10px] font-bold uppercase leading-none"
                    style={{ color: isUrgent ? "#EF4444" : "#2FA2E2" }}
                  >
                    {formatExamDate(exam.scheduledAt).split(" ")[0]}
                  </span>
                  <span
                    className="text-base font-bold leading-tight"
                    style={{ color: isUrgent ? "#EF4444" : "#2FA2E2" }}
                  >
                    {formatExamDate(exam.scheduledAt).split(" ")[1]}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{exam.title}</p>
                  <p className="text-xs text-muted">{exam.durationMinutes} min · Mock Exam</p>
                </div>
              </div>
              <span
                className="rounded-full px-2.5 py-1 text-xs font-semibold"
                style={{
                  backgroundColor: isUrgent ? "rgba(239,68,68,0.1)" : "rgba(47,162,226,0.1)",
                  color: isUrgent ? "#EF4444" : "#2FA2E2",
                }}
              >
                {daysLeft === 0 ? "Today" : daysLeft === 1 ? "Tomorrow" : `In ${daysLeft}d`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
