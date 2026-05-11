"use client";

import { useMemo } from "react";

// ─── Curated quote dataset ────────────────────────────────────────────────────

const QUOTES = [
  { text: "The expert in anything was once a beginner who refused to give up.", author: "Helen Hayes" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Anonymous" },
  { text: "Education is the passport to the future — tomorrow belongs to those who prepare for it today.", author: "Malcolm X" },
  { text: "Your future self is counting on the discipline you show today.", author: "Anonymous" },
  { text: "A year from now, you'll wish you had started today.", author: "Karen Lamb" },
  { text: "Studying is not just about passing exams. It's about building a life you're proud of.", author: "Anonymous" },
  { text: "Every expert was once a student who refused to give up.", author: "Anonymous" },
  { text: "The pain of discipline is far less than the pain of regret.", author: "Jim Rohn" },
  { text: "Dream big. Start small. Act now.", author: "Robin Sharma" },
  { text: "Your board exam is not the end — it's your beginning.", author: "Orki" },
  { text: "One flashcard at a time. One question at a time. One day at a time.", author: "Orki" },
  { text: "The reviewee who studies consistently beats the genius who studies inconsistently.", author: "Anonymous" },
  { text: "You are closer than you think. Keep pushing.", author: "Anonymous" },
  { text: "Each day you study, you are one step closer to the license that changes your life.", author: "Anonymous" },
  { text: "Mastery is not about perfection. It's about progress.", author: "Anonymous" },
  { text: "The most effective way to do it, is to do it.", author: "Amelia Earhart" },
  { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
  { text: "Keep studying. Your license is the reward for your patience and persistence.", author: "Orki" },
  { text: "Success is no accident. It is hard work, perseverance, learning, and sacrifice.", author: "Pelé" },
  { text: "What you do today determines where you will be tomorrow.", author: "Anonymous" },
  { text: "Preparation is the foundation of confidence. Study hard, walk in ready.", author: "Anonymous" },
  { text: "The will to succeed is nothing without the will to prepare.", author: "Juma Ikangaa" },
  { text: "Consistency is more important than intensity. Show up every day.", author: "Anonymous" },
] as const;

// ─── Daily rotation helper ────────────────────────────────────────────────────

/** Returns a stable quote index that changes once per calendar day. */
function getDailyIndex(length: number): number {
  const daysSinceEpoch = Math.floor(Date.now() / 86_400_000);
  return daysSinceEpoch % length;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MotivationWidget() {
  const quote = useMemo(() => QUOTES[getDailyIndex(QUOTES.length)], []);

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6"
      style={{
        background:
          "linear-gradient(135deg, rgba(47,162,226,0.07) 0%, rgba(139,92,246,0.06) 50%, rgba(16,185,129,0.05) 100%)",
        border: "1px solid rgba(47,162,226,0.15)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      {/* Decorative quotation mark */}
      <div
        aria-hidden="true"
        className="absolute -top-2 left-4 font-heading text-9xl font-bold leading-none select-none pointer-events-none"
        style={{ color: "rgba(47,162,226,0.08)" }}
      >
        &#8220;
      </div>

      {/* Content */}
      <div className="relative space-y-3">
        <p className="font-heading text-lg font-semibold leading-relaxed text-foreground">
          &ldquo;{quote.text}&rdquo;
        </p>
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-border/40" />
          <p className="text-xs font-medium text-muted">— {quote.author}</p>
        </div>
      </div>

      {/* Subtle gradient orb */}
      <div
        aria-hidden="true"
        className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
