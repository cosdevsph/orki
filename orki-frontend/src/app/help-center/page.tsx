import type { Metadata } from "next";
import Link from "next/link";

import { routes } from "@/shared/config/routes";
import { PublicLayout } from "@/widgets/landing/public-layout";

export const metadata: Metadata = {
  title: "Help Center",
  description:
    "Find answers, guides, and support for getting the most out of Orki — your smart board exam preparation platform for Filipino professionals.",
};

const categories = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-primary">
        <path
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M12 7v5l3 3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Getting Started",
    description: "New to Orki? Learn how to create your account, choose an exam category, and begin your first study session.",
    topics: ["Creating an account", "Choosing your exam category", "Setting up your study schedule", "Understanding the dashboard"],
    href: `${routes.faq}#getting-started`,
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-primary">
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
        <path
          d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "Account & Profile",
    description: "Manage your account settings, subscription, payment history, and personal profile information.",
    topics: ["Updating your profile", "Changing your password", "Managing your subscription", "Viewing payment history"],
    href: `${routes.faq}#account`,
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-primary">
        <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2" />
        <path
          d="M9 9h6M9 12h6M9 15h4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "Mock Exams",
    description: "Learn how mock examinations work, how questions are curated, and how to interpret your results.",
    topics: ["Starting an exam", "Question types explained", "Reading your results", "Reviewing incorrect answers"],
    href: `${routes.faq}#exams`,
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-primary">
        <rect x="4" y="3" width="7" height="9" rx="1.5" stroke="currentColor" strokeWidth="2" />
        <rect x="13" y="12" width="7" height="9" rx="1.5" stroke="currentColor" strokeWidth="2" />
        <path
          d="M7.5 12v3M16.5 3v6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "Flashcards",
    description: "Understand how Orki's spaced-repetition flashcard system works to maximize your retention.",
    topics: ["How flashcards are created", "Spaced repetition explained", "Creating custom decks", "Tracking flashcard progress"],
    href: `${routes.faq}#flashcards`,
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-primary">
        <path
          d="M3 12h3l3-9 3 18 3-12 3 6h3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Analytics",
    description: "Make sense of your performance data, study streaks, subject mastery, and improvement trends.",
    topics: ["Reading your analytics dashboard", "Understanding subject mastery", "Study streak explained", "Interpreting score trends"],
    href: `${routes.faq}#analytics`,
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-primary">
        <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M3 10h18" stroke="currentColor" strokeWidth="2" />
        <path
          d="M7 14h2M7 17h4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "Billing & Payments",
    description: "Everything about subscriptions, payment methods, invoices, cancellations, and refund requests.",
    topics: ["Available payment methods", "How to cancel your subscription", "Requesting a refund", "Updating payment details"],
    href: `${routes.faq}#billing`,
  },
];

export default function HelpCenterPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <div className="relative overflow-hidden bg-section-alt border-b border-border/50 py-16 sm:py-24 transition-colors duration-300">
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent pointer-events-none" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Support</p>
          <h1 className="font-heading text-3xl sm:text-5xl font-bold text-foreground mb-4 leading-tight">
            How can we help?
          </h1>
          <p className="text-lg text-secondary max-w-xl mx-auto">
            Browse guides by category or jump straight to our{" "}
            <Link href={routes.faq} className="text-primary hover:underline">
              FAQ
            </Link>
            .
          </p>
        </div>
      </div>

      {/* Category cards */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <Link
              key={cat.title}
              href={cat.href}
              className="group rounded-2xl border border-border bg-card-bg p-6 flex flex-col gap-4 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-200"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/8 flex items-center justify-center">
                {cat.icon}
              </div>
              <div className="flex-1">
                <h2 className="font-heading font-semibold text-foreground mb-1.5 group-hover:text-primary transition-colors">
                  {cat.title}
                </h2>
                <p className="text-sm text-secondary leading-relaxed mb-3">{cat.description}</p>
                <ul className="space-y-1">
                  {cat.topics.map((topic) => (
                    <li key={topic} className="text-xs text-muted flex gap-1.5 items-center">
                      <span className="w-1 h-1 rounded-full bg-muted/50 shrink-0" />
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
                View articles
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* Still need help? */}
        <div className="mt-16 rounded-3xl border border-border bg-section-alt p-8 sm:p-10 text-center transition-colors duration-300">
          <h2 className="font-heading text-xl font-bold text-foreground mb-2">
            Still can&apos;t find what you need?
          </h2>
          <p className="text-secondary mb-6 max-w-md mx-auto">
            Our support team is here to help. Reach out and we&apos;ll get back to you as soon as
            possible.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={routes.reportProblem}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-7 py-3 text-sm font-semibold text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25 transition-all duration-200"
            >
              Report a Problem
            </Link>
            <Link
              href={routes.contact}
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card-bg px-7 py-3 text-sm font-medium text-foreground hover:border-primary/30 hover:text-primary transition-all duration-200"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
