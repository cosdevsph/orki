import type { Metadata } from "next";
import Link from "next/link";

import { routes } from "@/shared/config/routes";
import { PublicLayout } from "@/widgets/landing/public-layout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how Orki collects, uses, and protects your personal data including Firebase, Google Sign-In, Firestore, and PayMongo integrations.",
};

const sections = [
  {
    id: "overview",
    title: "1. Overview",
    content: [
      "Orki (\"we\", \"our\", or \"the Platform\") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.",
      "By using Orki, you consent to the practices described in this policy. If you disagree with any part, please discontinue use and contact us for account deletion.",
    ],
  },
  {
    id: "data-collected",
    title: "2. Information We Collect",
    content: [
      "Account Information: When you register, we collect your name, email address, and profile photo (if signing in with Google). We do not collect government IDs or sensitive personal identifiers.",
      "Usage Data: We automatically collect information about how you interact with the Platform, including pages visited, exam scores, flashcard activity, session durations, and study streaks.",
      "Device Information: We may collect device type, operating system, browser type, and IP address for security and analytics purposes.",
      "Payment Information: When subscribing, payment details are processed by PayMongo. We receive only a transaction confirmation and the last four digits of your card — we never store full card numbers or CVV codes.",
    ],
  },
  {
    id: "firebase-auth",
    title: "3. Firebase Authentication & Google Sign-In",
    content: [
      "Orki uses Google Firebase Authentication to manage user accounts. When you sign in with Google, we receive your name, email address, and profile picture from your Google account.",
      "We use this information solely to create and maintain your Orki account. We do not access your Google contacts, Drive, or any other Google service beyond basic identity verification.",
      "Firebase Authentication is governed by Google's Privacy Policy (policies.google.com/privacy). We encourage you to review it.",
    ],
  },
  {
    id: "firestore",
    title: "4. Firestore Data Storage",
    content: [
      "Your study data — including exam attempts, scores, flashcard progress, analytics data, and study streaks — is stored in Google Cloud Firestore.",
      "Firestore data is encrypted at rest and in transit. Access is restricted to authenticated users viewing their own data, enforced via Firebase Security Rules.",
      "Data is stored in Google's cloud infrastructure, which may be located outside the Philippines. By using Orki, you consent to this cross-border data transfer in accordance with applicable data protection laws.",
    ],
  },
  {
    id: "paymongo",
    title: "5. PayMongo Payment Processing",
    content: [
      "Subscription payments are processed by PayMongo, a payment service provider licensed by the Bangko Sentral ng Pilipinas (BSP) and compliant with PCI-DSS security standards.",
      "Orki does not store, process, or transmit full payment card details. All billing information is handled entirely by PayMongo's secure environment.",
      "PayMongo's Privacy Policy governs how your payment data is handled on their end. We receive only non-sensitive transaction metadata (amount, status, date) for subscription management.",
    ],
  },
  {
    id: "analytics",
    title: "6. Analytics & Performance Monitoring",
    content: [
      "We use Firebase Analytics and Vercel Analytics to understand how users interact with the Platform. These tools collect aggregated, anonymized usage statistics to help us improve Orki.",
      "Analytics data is not sold or shared with third parties for advertising purposes.",
    ],
  },
  {
    id: "sharing",
    title: "7. How We Share Your Information",
    content: [
      "We do not sell, rent, or trade your personal information to third parties.",
      "We may share data with: (a) Google / Firebase for authentication and storage services; (b) PayMongo for payment processing; (c) Vercel for application hosting and analytics; (d) Law enforcement when legally required.",
    ],
  },
  {
    id: "security",
    title: "8. Data Security",
    content: [
      "We implement industry-standard security measures including HTTPS encryption, Firebase Security Rules, and access control policies to protect your data.",
      "Despite our best efforts, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security but commit to promptly addressing any identified vulnerabilities.",
    ],
  },
  {
    id: "retention",
    title: "9. Data Retention",
    content: [
      "We retain your account and study data for as long as your account is active. If you request account deletion, we will remove your personal data within 30 days, except where retention is required by law.",
      "Aggregated, anonymized analytics data may be retained indefinitely for platform improvement purposes.",
    ],
  },
  {
    id: "rights",
    title: "10. Your Rights",
    content: [
      "Under the Philippine Data Privacy Act of 2012 (Republic Act No. 10173), you have the right to: (a) access your personal data; (b) correct inaccurate data; (c) object to processing; (d) request deletion of your data; (e) data portability.",
      "To exercise these rights, contact our Data Privacy Officer at privacy@orki.cosedevs.com. We will respond within 15 business days.",
    ],
  },
  {
    id: "children",
    title: "11. Children's Privacy",
    content: [
      "Orki is not intended for children under 18. We do not knowingly collect personal information from minors. If you believe a minor has provided us their information, contact us immediately.",
    ],
  },
  {
    id: "changes",
    title: "12. Changes to This Policy",
    content: [
      "We may update this Privacy Policy periodically. We will notify you of significant changes via email or a prominent in-app notice. Your continued use after changes constitutes acceptance.",
    ],
  },
  {
    id: "contact",
    title: "13. Contact",
    content: [
      "For privacy-related inquiries, contact our Data Privacy Officer at privacy@orki.cosedevs.com or write to us at the address listed on our Contact page.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <div className="bg-section-alt border-b border-border/50 py-14 sm:py-20 transition-colors duration-300">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Legal</p>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-3 leading-tight">
            Privacy Policy
          </h1>
          <p className="text-muted text-sm">Last updated: May 24, 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-16">
        {/* Quick navigation */}
        <div className="mb-10 p-5 rounded-2xl border border-border bg-card-bg transition-colors duration-300">
          <p className="text-xs font-bold uppercase tracking-widest text-muted mb-3">
            On this page
          </p>
          <div className="flex flex-wrap gap-2">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="text-xs text-secondary hover:text-primary transition-colors"
              >
                {s.title}
              </a>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="font-heading text-lg font-semibold text-foreground mb-3 pb-2 border-b border-border/50">
                {section.title}
              </h2>
              <div className="space-y-3">
                {section.content.map((para, i) => (
                  <p key={i} className="text-[15px] text-secondary leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-sm text-muted">
            Privacy questions?{" "}
            <a href="mailto:privacy@orki.cosedevs.com" className="text-primary hover:underline">
              privacy@orki.cosedevs.com
            </a>
          </p>
          <div className="flex gap-3">
            <Link
              href={routes.terms}
              className="text-sm text-secondary hover:text-primary transition-colors"
            >
              ← Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
