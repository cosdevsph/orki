"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import type { FirestoreSubject } from "@/entities/exams/types";
import { useAuth } from "@/hooks/useAuth";
import { useExamType } from "@/hooks/useExamType";
import { useSubjects } from "@/hooks/useSubjects";
import { routes } from "@/shared/config/routes";
import { SUBJECT_COLORS } from "@/shared/utils/exam-type";

// ─── Subject card ─────────────────────────────────────────────────────────────

function SubjectCard({
  subject,
  colorFallback,
  onStart,
}: {
  subject: FirestoreSubject;
  colorFallback: string;
  onStart: () => void;
}) {
  return (
    <div className="glass card-hover group flex flex-col gap-4 rounded-2xl p-5 transition-all">
      {/* Accent bar */}
      <div className="h-1 w-12 rounded-full" style={{ backgroundColor: colorFallback }} />

      {/* Title */}
      <h3 className="font-heading text-base font-bold leading-snug text-foreground">
        {subject.name}
      </h3>

      {/* Exam type badge */}
      <p className="text-xs text-muted">{subject.exam_type} &middot; Practice Exam</p>

      {/* CTA */}
      <button
        type="button"
        onClick={onStart}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary transition-all duration-150 hover:bg-primary hover:text-white"
      >
        Start Exam
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
          <path d="M5.25 2.917 9.333 7 5.25 11.083" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-3 gap-5">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="glass animate-pulse flex flex-col gap-4 rounded-2xl p-5">
          <div className="h-1 w-12 rounded-full bg-surface" />
          <div className="h-5 w-full rounded bg-surface" />
          <div className="h-3 w-24 rounded bg-surface" />
          <div className="h-10 w-full rounded-xl bg-surface mt-2" />
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ExamsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { examFullName } = useExamType();
  const examType = user?.exam_type ?? null;

  const { subjects, loading, error } = useSubjects(examType);
  const [subscription, setSubscription] = useState<{ status: string } | null>(null);
  const [subLoading, setSubLoading] = useState(true);

  // Fetch subscription status
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}users/subscription/`,
          { credentials: "include" }
        );
        if (res.ok) {
          const data = await res.json();
          console.log("📊 Subscription status:", data.status);
          setSubscription(data);
        } else {
          console.error("❌ Subscription fetch failed:", res.status);
        }
      } catch (error) {
        console.error("❌ Failed to fetch subscription:", error);
      } finally {
        setSubLoading(false);
      }
    };

    if (user) {
      fetchSubscription();
    }
  }, [user]);

  // If not subscribed, show paywall
  if (!subLoading && subscription?.status !== "active") {
    return (
      <div className="animate-page-in flex flex-col items-center justify-center py-24 text-center space-y-6">
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" className="text-muted/40">
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3-8c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3z"
            fill="currentColor"
          />
        </svg>
        <div>
          <h2 className="font-heading text-2xl font-bold text-foreground">Exams Locked</h2>
          <p className="text-muted mt-1">
            Subscribe to unlock all practice exams and start your study journey.
          </p>
        </div>
        {subscription?.status !== "pending" && (
          <button
            onClick={() => router.push(routes.subscribe)}
            className="rounded-xl bg-primary text-white font-semibold px-6 py-3 transition hover:bg-primary/90"
          >
            Subscribe Now
          </button>
        )}
      </div>
    );
  }

  function handleStart(subject: FirestoreSubject) {
    router.push(
      `/exams/${encodeURIComponent(subject.id)}/take` +
        `?subject=${encodeURIComponent(subject.name)}` +
        `&exam_type=${encodeURIComponent(examType ?? "")}`,
    );
  }

  return (
    <div className="animate-page-in space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground">
          Exam Library
        </h1>
        <p className="text-base text-muted max-w-lg">
          {examFullName
            ? `Practice modules for ${examFullName}. Choose a subject to begin a focused session.`
            : "Curated practice modules tailored for your certification."}
        </p>
      </div>

      {loading && <SkeletonGrid />}

      {!loading && error && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <svg width="40" height="40" viewBox="0 0 22 22" fill="none" className="text-muted/40">
            <circle cx="11" cy="11" r="8.25" stroke="currentColor" strokeWidth="1.6" />
            <path d="M11 7.333v4.584M11 13.75v.917" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <p className="text-sm text-muted">{error}</p>
        </div>
      )}

      {!loading && !error && subjects.length > 0 && (
        <div className="grid grid-cols-3 gap-5">
          {subjects.map((subject, i) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              colorFallback={SUBJECT_COLORS[i % SUBJECT_COLORS.length]}
              onStart={() => handleStart(subject)}
            />
          ))}
        </div>
      )}

      {!loading && !error && subjects.length === 0 && examType && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <svg width="40" height="40" viewBox="0 0 22 22" fill="none" className="text-muted/40">
            <rect x="3.667" y="2.75" width="14.667" height="16.5" rx="2.2" stroke="currentColor" strokeWidth="1.6" />
            <path d="M7.333 7.333h7.334M7.333 11h7.334M7.333 14.667h4.584" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <p className="text-sm text-muted">
            No subjects found for {examType}. Contact support if this is unexpected.
          </p>
        </div>
      )}
    </div>
  );
}
