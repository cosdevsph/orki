"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import { BottomDock } from "@/widgets/navigation/bottom-dock";

function ExamCountdown({ examDate }: { examDate: string }) {
  const target = new Date(examDate);
  const now = new Date();
  const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diff < 0) return null;
  
  const examLabel = diff === 0 ? "Today!" : diff === 1 ? "1 day" : `${diff} days`;

  return (
    <div className="flex items-center gap-2 rounded-full bg-badge-amber-bg px-3 py-1.5">
      <svg width="14" height="14" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="8.25" stroke="#D97706" strokeWidth="1.6" />
        <path d="M11 6.875V11l2.75 2.75" stroke="#D97706" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-xs font-bold text-amber-700">{examLabel}</span>
      <span className="text-[10px] text-amber-600">to exam</span>
    </div>
  );
}

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  // Hide bottom navigation during an active exam session
  const isExamTakePage = /^\/exams\/[^/]+\/take(\?.*)?$/.test(pathname);

  return (
    <div className="ambient-bg min-h-screen text-foreground transition-colors duration-300">
      {/* Top header bar with Orki logo + exam countdown */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 pt-6 pb-2">
        <div className="flex items-center gap-2">
          <Image
            src="/Logo/OrkiLogo.svg"
            alt="Orki"
            width={24}
            height={24}
            className="select-none"
          />
          <span className="font-heading text-base font-bold text-foreground tracking-tight">
            Orki
          </span>
        </div>
        <div className="flex items-center gap-3">
          {user?.exam_date && <ExamCountdown examDate={user.exam_date} />}
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-6 pt-4 pb-32">
        {children}
      </main>
      {!isExamTakePage && <BottomDock />}
    </div>
  );
}

// ─── legacy export kept for compatibility ─────────────────────────────────────
// (nothing below this line)
