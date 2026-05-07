"use client";

import { BottomDock } from "@/widgets/navigation/bottom-dock";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="ambient-bg min-h-screen text-foreground">
      <main className="mx-auto w-full max-w-6xl px-6 pt-10 pb-32">
        {children}
      </main>
      <BottomDock />
    </div>
  );
}

// ─── legacy export kept for compatibility ─────────────────────────────────────
// (nothing below this line)
