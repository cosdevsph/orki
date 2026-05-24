import type { ReactNode } from "react";
import Link from "next/link";

import { routes } from "@/shared/config/routes";
import { Footer } from "./footer";
import { LandingNav } from "./landing-nav";

const featureLinks = [
  { label: "Dashboard", href: routes.featureDashboardTracking },
  { label: "Analytics", href: routes.featureSmartAnalytics },
  { label: "Mock Exams", href: routes.featureMockExams },
  { label: "Flashcards", href: routes.featureSmartFlashcards },
  { label: "Progress", href: routes.featureStudyProgress },
];

export function FeaturePageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <LandingNav />
      <main className="pt-16">{children}</main>

      {/* Feature nav strip */}
      <div className="border-t border-border/50 bg-section-alt py-8 transition-colors duration-300">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-xs font-semibold text-muted uppercase tracking-widest text-center mb-5">
            Explore all features
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {featureLinks.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="rounded-xl border border-border bg-card-bg px-5 py-2.5 text-sm font-medium text-foreground hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-all duration-150"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
