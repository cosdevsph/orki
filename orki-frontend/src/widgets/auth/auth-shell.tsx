"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { SignInForm } from "./sign-in-form";
import { SignUpForm } from "./sign-up-form";
import { routes } from "@/shared/config/routes";

type Tab = "signin" | "signup";

interface AuthShellProps {
  initialTab?: Tab;
}

const avatarColors = ["#3B82F6", "#8B5CF6", "#EC4899", "#10B981"];
const avatarInitials = ["M", "C", "A", "J"];

export function AuthShell({ initialTab = "signin" }: AuthShellProps) {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      {/* ── Page background ── */}
      <div className="absolute inset-0 bg-background transition-colors duration-300" />

      {/* ── Back to landing link ── */}
      <Link
        href={routes.home}
        className="absolute left-6 top-6 z-20 flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-muted transition-colors duration-150 hover:bg-overlay-hover-mid hover:text-foreground"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path
            d="M9 11L5 7l4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Back
      </Link>

      {/* ── Main card ── */}
      <div className="relative z-10 flex w-full max-w-5xl overflow-hidden rounded-3xl shadow-2xl ring-1 ring-border/30">

        {/* ════════════════════════════════════
            LEFT PANEL — Branding & Mascot
        ════════════════════════════════════ */}
        <div className="relative hidden w-[42%] flex-col overflow-hidden lg:flex">
          {/* Background layers */}
          <div className="absolute inset-0 bg-linear-to-br from-[#0B1D35] via-[#0F2540] to-[#0D2242]" />
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-[#0B1D35]/80 via-transparent to-transparent" />

          {/* Glow blobs inside panel */}
          <div className="pointer-events-none absolute top-0 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/3 rounded-full bg-primary/15 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-48 w-48 translate-x-1/4 translate-y-1/4 rounded-full bg-primary/12 blur-2xl" />
          <div className="pointer-events-none absolute bottom-1/4 left-0 h-40 w-40 -translate-x-1/3 rounded-full bg-blue-400/8 blur-2xl" />

          {/* Content */}
          <div className="relative flex h-full flex-col p-10">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-white/10">
                <Image
                  src="/Logo/OrkiLogo.svg"
                  alt="Orki"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <span className="font-heading text-xl font-bold text-white">Orki</span>
            </div>

            {/* Center: mascot + tagline */}
            <div className="relative flex flex-1 flex-col items-center justify-center gap-7">
              {/* Glow halo behind mascot */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-72 w-72 rounded-full bg-primary/18 blur-3xl" />
              </div>

              <Image
                src="/mascott/OrkiLogoFront.webp"
                alt="Orki whale mascot"
                width={220}
                height={220}
                className="relative animate-float object-contain drop-shadow-2xl"
                priority
              />

              <div className="relative text-center">
                <h2 className="font-heading text-[2rem] font-bold leading-tight text-white">
                  Study Smarter,
                </h2>
                <h2 className="font-heading text-[2rem] font-bold leading-tight">
                  <span className="bg-linear-to-r from-[#93C5FD] to-[#2FA2E2] bg-clip-text text-transparent">
                    Not Harder.
                  </span>
                </h2>
                <p className="mx-auto mt-3.5 max-w-50 text-sm leading-relaxed text-white/55">
                  Your intelligent board exam companion — track progress, master flashcards, and
                  conquer mock exams.
                </p>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="relative flex flex-col gap-4">
              {/* Student avatars */}
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {avatarInitials.map((initial, i) => (
                    <div
                      key={initial}
                      className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#0B1D35] text-[10px] font-bold text-white"
                      style={{ backgroundColor: avatarColors[i] }}
                    >
                      {initial}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-white/50">
                  <span className="font-semibold text-white/75">1,000+</span> students trust Orki
                </p>
              </div>

              {/* Micro badges */}
              <div className="flex items-center gap-4">
                {["Try it at ₱ 49", "No credit card", "Cancel anytime"].map((item) => (
                  <div key={item} className="flex items-center gap-1 text-[11px] text-white/40">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <circle cx="6" cy="6" r="5" stroke="#10B981" strokeWidth="1.5" />
                      <path
                        d="M3.5 6l2 2 3-3"
                        stroke="#10B981"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════
            RIGHT PANEL — Auth Form
        ════════════════════════════════════ */}
        <div className="flex min-h-160 flex-1 flex-col bg-card-bg transition-colors duration-300">
          {/* Form area */}
          <div className="flex flex-1 flex-col justify-center px-10 py-8">
            {/* Welcome header */}
            <div className="mb-7">
              <h1 className="font-heading text-2xl font-bold text-foreground">
                {activeTab === "signin" ? "Welcome back" : "Join Orki"}
              </h1>
              <p className="mt-1.5 text-sm text-muted">
                {activeTab === "signin"
                  ? "Sign in to continue your study progress."
                  : "Create your account and begin your board exam journey."}
              </p>
            </div>

            {/* macOS-style segmented tab switcher */}
            <div className="relative mb-7 flex rounded-xl bg-surface p-1">
              {/* Sliding active indicator */}
              <div
                className="pointer-events-none absolute inset-y-1 rounded-lg bg-card-bg shadow-sm transition-all duration-300 ease-out"
                style={{
                  width: "calc(50% - 6px)",
                  left: activeTab === "signin" ? "4px" : "calc(50% + 2px)",
                }}
              />
              <button
                type="button"
                onClick={() => setActiveTab("signin")}
                className={`relative z-10 flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors duration-200 ${
                  activeTab === "signin" ? "text-foreground" : "text-muted hover:text-secondary"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("signup")}
                className={`relative z-10 flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors duration-200 ${
                  activeTab === "signup" ? "text-foreground" : "text-muted hover:text-secondary"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Animated form content */}
            {activeTab === "signin" ? (
              <div key="signin" className="animate-auth-fade-in">
                <SignInForm />
              </div>
            ) : (
              <div key="signup" className="animate-auth-fade-in">
                <SignUpForm />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border/50 px-10 py-4">
            <p className="text-center text-xs text-muted/60">
              By continuing, you agree to our{" "}
              <button type="button" className="text-primary hover:underline">
                Terms of Service
              </button>{" "}
              and{" "}
              <button type="button" className="text-primary hover:underline">
                Privacy Policy
              </button>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
