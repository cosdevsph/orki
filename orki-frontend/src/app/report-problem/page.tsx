import type { Metadata } from "next";
import Link from "next/link";

import { routes } from "@/shared/config/routes";
import { PublicLayout } from "@/widgets/landing/public-layout";
import { ReportForm } from "./_components/report-form";

export const metadata: Metadata = {
  title: "Report a Problem",
  description:
    "Encountered a bug or issue with Orki? Report it here and our team will investigate and get back to you promptly.",
};

export default function ReportProblemPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <div className="bg-section-alt border-b border-border/50 py-14 sm:py-20 transition-colors duration-300">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Support</p>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-3 leading-tight">
            Report a Problem
          </h1>
          <p className="text-secondary max-w-lg">
            Found something broken or unexpected? Let us know and we'll work on a fix.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14">
          {/* Form */}
          <div className="lg:col-span-2">
            <ReportForm />
          </div>

          {/* Side info */}
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-border bg-card-bg p-5 flex flex-col gap-2.5 transition-colors duration-300">
              <p className="text-xs font-bold uppercase tracking-widest text-muted">
                Response time
              </p>
              <p className="font-semibold text-foreground">1–2 business days</p>
              <p className="text-sm text-secondary">
                We take every report seriously and aim to respond promptly.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card-bg p-5 flex flex-col gap-3 transition-colors duration-300">
              <p className="text-xs font-bold uppercase tracking-widest text-muted">
                Other ways to reach us
              </p>
              <a
                href="mailto:support@orki.cosedevs.com"
                className="flex items-center gap-2.5 text-sm text-secondary hover:text-primary transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
                  <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M3 9l9 6 9-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                support@orki.cosedevs.com
              </a>
            </div>

            <div className="rounded-2xl border border-border bg-card-bg p-5 flex flex-col gap-2.5 transition-colors duration-300">
              <p className="text-xs font-bold uppercase tracking-widest text-muted">
                Before reporting
              </p>
              <ul className="space-y-2">
                {[
                  "Check our FAQ for known issues",
                  "Try refreshing the page",
                  "Clear your browser cache",
                  "Try a different browser",
                ].map((tip) => (
                  <li key={tip} className="flex gap-2 text-sm text-secondary">
                    <span className="text-primary mt-0.5 shrink-0">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
              <Link href={routes.faq} className="text-sm text-primary hover:underline mt-1">
                View FAQ →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
