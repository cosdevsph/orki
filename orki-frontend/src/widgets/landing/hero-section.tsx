import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

import { routes } from "@/shared/config/routes";

function GlassCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`absolute glass rounded-2xl px-4 py-3.5 ${className}`}
    >
      {children}
    </div>
  );
}

const avatarColors = ["#3B82F6", "#8B5CF6", "#EC4899", "#10B981"];
const avatarInitials = ["M", "C", "A", "J"];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background min-h-screen flex items-center transition-colors duration-300">
      {/* Background gradient blobs */}
      <div className="absolute -top-32 -right-48 w-180 h-180 rounded-full bg-primary/6 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-48 w-140 h-140 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-80 h-80 rounded-full bg-success/4 blur-3xl pointer-events-none" />

      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 pt-24 sm:pt-28 lg:pt-36 pb-16 sm:pb-20 lg:pb-28 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* ── Left column ── */}
        <div className="flex flex-col gap-7 lg:gap-9 text-center lg:text-left items-center lg:items-start">
          {/* Trust badge */}
          <span className="inline-flex items-center gap-2 self-center lg:self-start rounded-full border border-primary/25 bg-primary/8 px-4 py-2 text-sm font-medium text-primary">
            <span className="text-[15px] leading-none">✦</span>
            Trusted by 500+ students
          </span>

          {/* Headline */}
          <div className="flex flex-col gap-4 lg:gap-5">
            <h1 className="font-heading text-[2.5rem] sm:text-5xl lg:text-7xl font-bold leading-[1.04] tracking-tight text-foreground">
              Study Smarter,{" "}
              <span className="bg-linear-to-r from-[var(--heading-from)] to-[var(--heading-to)] bg-clip-text text-transparent">
                Not Harder.
              </span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-secondary leading-relaxed max-w-xl lg:max-w-105 mx-auto lg:mx-0">
              Orki is your intelligent board exam companion — track progress, master flashcards, and
              conquer mock exams with confidence.
            </p>
          </div>

          {/* CTA row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <Link
              href={routes.register}
              className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-primary px-8 py-4 font-semibold text-white shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
            >
              Get Started Free
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <a
              href="#features"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card-bg px-8 py-4 font-medium text-foreground hover:bg-overlay-hover-mid hover:border-muted/30 transition-all duration-200"
            >
              Explore Features
            </a>
          </div>

          {/* Social proof strip */}
          <div className="flex items-center gap-3 pt-1 border-t border-border/50 w-full justify-center lg:justify-start">
            <div className="flex -space-x-2.5">
              {avatarInitials.map((initial, i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full border-2 border-background flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: avatarColors[i] }}
                >
                  {initial}
                </div>
              ))}
            </div>
            <p className="text-sm text-secondary">
              Join{" "}
              <span className="font-semibold text-foreground">500+</span> students crushing
              their boards
            </p>
          </div>
        </div>

        {/* ── Right column: whale + floating cards ── */}
        <div className="relative flex items-center justify-center h-72 sm:h-96 lg:h-150">
          {/* Glow halo */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full bg-primary/12 blur-3xl" />
          </div>

          {/* Whale mascot */}
          <Image
            src="/mascott/OrkiLogoFront.webp"
            alt="Orki whale mascot"
            width={420}
            height={420}
            className="relative drop-shadow-2xl animate-float object-contain w-48 h-48 sm:w-64 sm:h-64 lg:w-auto lg:h-auto"
            priority
          />

          {/* Floating card — streak (hidden on smallest screens) */}
          <GlassCard className="top-4 left-0 sm:top-14 sm:left-2 animate-float-delayed hidden sm:block">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-xl leading-none">
                🔥
              </div>
              <div>
                <p className="text-[11px] font-semibold text-secondary uppercase tracking-wide">
                  Study Streak
                </p>
                <p className="text-xl font-bold text-foreground font-heading leading-none mt-0.5">
                  12 Days
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Floating card — pass rate */}
          <GlassCard className="bottom-10 right-0 sm:bottom-28 sm:right-0 animate-float-slow hidden sm:block">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M3 14l4-5 4 3 4-7"
                    stroke="#10B981"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-secondary uppercase tracking-wide">
                  Avg. Pass Rate
                </p>
                <p className="text-xl font-bold text-success font-heading leading-none mt-0.5">
                  92%
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Floating card — flashcards */}
          <GlassCard className="top-16 right-0 sm:top-32 sm:right-0 animate-float-delayed hidden sm:block">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect
                    x="2"
                    y="6"
                    width="16"
                    height="11"
                    rx="2"
                    stroke="#2FA2E2"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M5 6V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"
                    stroke="#2FA2E2"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    opacity="0.5"
                  />
                </svg>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-secondary uppercase tracking-wide">
                  Cards Mastered
                </p>
                <p className="text-xl font-bold text-primary font-heading leading-none mt-0.5">
                  248
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Floating card — micro chart */}
          <GlassCard className="bottom-2 left-4 sm:bottom-10 sm:left-8 animate-float hidden sm:block">
            <div className="flex items-center gap-3">
              <div className="flex items-end gap-0.5 h-8">
                {[45, 60, 52, 75, 70, 88, 95].map((h, i) => (
                  <div
                    key={i}
                    className="w-2 rounded-sm"
                    style={{
                      height: `${(h / 100) * 32}px`,
                      background: i === 6 ? "#10B981" : "#2FA2E2",
                      opacity: i === 6 ? 1 : 0.3 + i * 0.1,
                    }}
                  />
                ))}
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground leading-none">Improving</p>
                <p className="text-[11px] text-success mt-0.5">↑ 20% this week</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-secondary/60">
        <p className="text-xs font-medium tracking-wide uppercase">Scroll</p>
        <div className="w-px h-8 bg-linear-to-b from-muted/40 to-transparent" />
      </div>
    </section>
  );
}
