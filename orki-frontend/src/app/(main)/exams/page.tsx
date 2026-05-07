import type { Exam } from "@/entities/exams/types";
import { ExamCard } from "@/widgets/exams/exam-card";

const EXAMS: (Exam & {
  subject: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  questionCount: number;
})[] = [
  {
    id: "2",
    title: "Physiology – Cardiovascular System",
    scheduledAt: "2026-05-08T14:00:00Z",
    durationMinutes: 45,
    status: "in_progress",
    subject: "Physiology",
    difficulty: "Intermediate",
    questionCount: 40,
  },
  {
    id: "1",
    title: "Anatomy – Upper Limb & Shoulder",
    scheduledAt: "2026-05-10T09:00:00Z",
    durationMinutes: 60,
    status: "scheduled",
    subject: "Anatomy",
    difficulty: "Advanced",
    questionCount: 55,
  },
  {
    id: "4",
    title: "Pharmacology – Antibiotic Classes",
    scheduledAt: "2026-05-15T11:00:00Z",
    durationMinutes: 90,
    status: "scheduled",
    subject: "Pharmacology",
    difficulty: "Advanced",
    questionCount: 80,
  },
  {
    id: "5",
    title: "Pathology – Inflammation & Repair",
    scheduledAt: "2026-05-12T13:00:00Z",
    durationMinutes: 60,
    status: "scheduled",
    subject: "Pathology",
    difficulty: "Intermediate",
    questionCount: 50,
  },
  {
    id: "3",
    title: "Biochemistry – Enzyme Kinetics",
    scheduledAt: "2026-05-05T10:00:00Z",
    durationMinutes: 30,
    status: "completed",
    subject: "Biochemistry",
    difficulty: "Beginner",
    questionCount: 25,
  },
  {
    id: "6",
    title: "Microbiology – Viral Pathogens",
    scheduledAt: "2026-05-03T09:00:00Z",
    durationMinutes: 45,
    status: "completed",
    subject: "Microbiology",
    difficulty: "Intermediate",
    questionCount: 40,
  },
];

export default function ExamsPage() {
  const active = EXAMS.filter((e) => e.status !== "completed");
  const completed = EXAMS.filter((e) => e.status === "completed");

  return (
    <div className="animate-page-in space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground">Exams</h1>
        <p className="text-base text-muted">
          Timed mock exams to test your readiness for board exam scenarios.
        </p>
      </div>

      {/* Stats strip */}
      <div className="flex gap-4">
        {[
          { label: "Scheduled", value: EXAMS.filter((e) => e.status === "scheduled").length, color: "#2FA2E2" },
          { label: "In Progress", value: EXAMS.filter((e) => e.status === "in_progress").length, color: "#F59E0B" },
          { label: "Completed", value: EXAMS.filter((e) => e.status === "completed").length, color: "#10B981" },
          { label: "Total Minutes", value: EXAMS.reduce((a, e) => a + e.durationMinutes, 0), color: "#8B5CF6" },
        ].map((s) => (
          <div key={s.label} className="glass flex flex-1 items-center gap-3 rounded-2xl px-4 py-3">
            <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
            <div>
              <p className="font-heading text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Active & Scheduled */}
      <section className="space-y-4">
        <h2 className="font-heading text-lg font-semibold text-foreground">Active & Scheduled</h2>
        <div className="grid grid-cols-2 gap-4">
          {active.map((exam) => (
            <ExamCard
              key={exam.id}
              exam={exam}
              subject={exam.subject}
              difficulty={exam.difficulty}
              questionCount={exam.questionCount}
            />
          ))}
        </div>
      </section>

      {/* Completed */}
      <section className="space-y-4">
        <h2 className="font-heading text-lg font-semibold text-foreground">Completed</h2>
        <div className="grid grid-cols-2 gap-4">
          {completed.map((exam) => (
            <ExamCard
              key={exam.id}
              exam={exam}
              subject={exam.subject}
              difficulty={exam.difficulty}
              questionCount={exam.questionCount}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

