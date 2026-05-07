import Link from "next/link";

import { routes } from "@/shared/config/routes";

export function ResumeCard() {
  return (
    <div
      className="card-hover relative overflow-hidden rounded-2xl p-6"
      style={{
        background:
          "linear-gradient(135deg, rgba(47,162,226,0.12) 0%, rgba(47,162,226,0.05) 60%, rgba(139,92,246,0.08) 100%)",
        border: "1px solid rgba(47,162,226,0.2)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-30"
        style={{
          background: "radial-gradient(circle, rgba(47,162,226,0.4) 0%, transparent 70%)",
        }}
      />

      <div className="relative flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">
              In Progress
            </span>
          </div>
          <h3 className="font-heading text-xl font-bold text-foreground">
            Anatomy – Upper Limb
          </h3>
          <p className="text-sm text-secondary">
            Flashcard deck · 84 cards · 12 due today
          </p>
          <div className="flex items-center gap-3 pt-1">
            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-primary/15">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: "62%" }}
              />
            </div>
            <span className="text-xs font-medium text-muted">62% mastered</span>
          </div>
        </div>

        <Link
          href={routes.flashcards}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 active:scale-95"
        >
          Resume
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5.25 2.917 9.333 7 5.25 11.083" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
