import type { Metadata } from "next";
import Link from "next/link";

import { routes } from "@/shared/config/routes";
import { PublicLayout } from "@/widgets/landing/public-layout";

export const metadata: Metadata = {
  title: "Refund Policy",
  description:
    "Understand Orki's refund policy for subscriptions and one-time payments, including how to request a refund and processing timelines.",
};

export default function RefundPolicyPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <div className="bg-section-alt border-b border-border/50 py-14 sm:py-20 transition-colors duration-300">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Legal</p>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-3 leading-tight">
            Refund Policy
          </h1>
          <p className="text-muted text-sm">Last updated: May 24, 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-16">
        {/* Summary card */}
        <div className="mb-10 p-6 rounded-2xl border border-primary/20 bg-primary/5 transition-colors duration-300">
          <p className="font-semibold text-foreground mb-1">Quick summary</p>
          <p className="text-sm text-secondary leading-relaxed">
            Orki offers refunds within <strong>7 days</strong> of your initial subscription
            purchase, provided you have not consumed more than 20% of the available content in that
            billing period. Refunds are not available after this window or for renewals.
          </p>
        </div>

        <div className="space-y-10">
          <section id="eligibility" className="scroll-mt-24">
            <h2 className="font-heading text-lg font-semibold text-foreground mb-3 pb-2 border-b border-border/50">
              1. Refund Eligibility
            </h2>
            <div className="space-y-3">
              <p className="text-[15px] text-secondary leading-relaxed">
                You may be eligible for a full refund if all of the following conditions are met:
              </p>
              <ul className="space-y-2 pl-4">
                {[
                  "The refund request is submitted within 7 calendar days of your initial purchase or subscription activation.",
                  "You have not completed more than 20% of the available exam questions or flashcard content in the subscription period.",
                  "Your account has not been flagged for Terms of Service violations.",
                  "The request is for a first-time subscription purchase (not a renewal).",
                ].map((item, i) => (
                  <li key={i} className="flex gap-2.5 text-[15px] text-secondary leading-relaxed">
                    <span className="text-primary mt-0.5 shrink-0">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section id="non-refundable" className="scroll-mt-24">
            <h2 className="font-heading text-lg font-semibold text-foreground mb-3 pb-2 border-b border-border/50">
              2. Non-Refundable Situations
            </h2>
            <div className="space-y-3">
              <p className="text-[15px] text-secondary leading-relaxed">
                Refunds will <strong>not</strong> be issued in the following situations:
              </p>
              <ul className="space-y-2 pl-4">
                {[
                  "Subscription renewal charges (automatic or manual).",
                  "Requests made after the 7-day refund window has elapsed.",
                  "Accounts where more than 20% of content has been accessed.",
                  "Accounts terminated for violations of the Terms & Conditions.",
                  "Partial refunds for unused days within a billing period.",
                  "Promotional, discounted, or trial plan purchases (unless otherwise stated).",
                ].map((item, i) => (
                  <li key={i} className="flex gap-2.5 text-[15px] text-secondary leading-relaxed">
                    <span className="text-muted mt-0.5 shrink-0">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section id="how-to-request" className="scroll-mt-24">
            <h2 className="font-heading text-lg font-semibold text-foreground mb-3 pb-2 border-b border-border/50">
              3. How to Request a Refund
            </h2>
            <div className="space-y-3">
              <p className="text-[15px] text-secondary leading-relaxed">
                To request a refund, email{" "}
                <a
                  href="mailto:billing@orki.cosedevs.com"
                  className="text-primary hover:underline"
                >
                  billing@orki.cosedevs.com
                </a>{" "}
                with the following information:
              </p>
              <ul className="space-y-2 pl-4">
                {[
                  "The email address associated with your Orki account.",
                  "Date of purchase.",
                  "PayMongo transaction reference number (found in your confirmation email).",
                  "Reason for the refund request.",
                ].map((item, i) => (
                  <li key={i} className="flex gap-2.5 text-[15px] text-secondary leading-relaxed">
                    <span className="text-primary mt-0.5 shrink-0">{i + 1}.</span>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-[15px] text-secondary leading-relaxed">
                We will review your request within 3–5 business days and respond via email.
              </p>
            </div>
          </section>

          <section id="processing" className="scroll-mt-24">
            <h2 className="font-heading text-lg font-semibold text-foreground mb-3 pb-2 border-b border-border/50">
              4. Processing & Timeline
            </h2>
            <div className="space-y-3">
              <p className="text-[15px] text-secondary leading-relaxed">
                Approved refunds are processed through PayMongo back to your original payment
                method. Refund timelines depend on your bank or card issuer:
              </p>
              <ul className="space-y-2 pl-4">
                {[
                  "Credit/debit cards: 5–10 business days",
                  "GCash / Maya e-wallets: 3–5 business days",
                  "Other payment methods: up to 15 business days",
                ].map((item, i) => (
                  <li key={i} className="flex gap-2.5 text-[15px] text-secondary leading-relaxed">
                    <span className="text-muted mt-0.5 shrink-0">•</span>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-[15px] text-secondary leading-relaxed">
                Once a refund is approved and initiated, your Orki subscription access will be
                revoked immediately.
              </p>
            </div>
          </section>

          <section id="disputes" className="scroll-mt-24">
            <h2 className="font-heading text-lg font-semibold text-foreground mb-3 pb-2 border-b border-border/50">
              5. Disputes & Chargebacks
            </h2>
            <p className="text-[15px] text-secondary leading-relaxed">
              We encourage you to contact us before initiating a chargeback with your bank. Filing
              an unjustified chargeback may result in permanent account suspension. We are committed
              to resolving disputes fairly and promptly.
            </p>
          </section>

          <section id="contact" className="scroll-mt-24">
            <h2 className="font-heading text-lg font-semibold text-foreground mb-3 pb-2 border-b border-border/50">
              6. Contact
            </h2>
            <p className="text-[15px] text-secondary leading-relaxed">
              For billing and refund questions, contact us at{" "}
              <a href="mailto:billing@orki.cosedevs.com" className="text-primary hover:underline">
                billing@orki.cosedevs.com
              </a>
              .
            </p>
          </section>
        </div>

        {/* Footer links */}
        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-sm text-muted">
            Need billing support?{" "}
            <Link href={routes.contact} className="text-primary hover:underline">
              Contact us
            </Link>
          </p>
          <Link
            href={routes.subscriptionPolicy}
            className="text-sm text-secondary hover:text-primary transition-colors"
          >
            Subscription Policy →
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
