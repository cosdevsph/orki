import type { Metadata } from "next";
import Link from "next/link";

import { routes } from "@/shared/config/routes";
import { PublicLayout } from "@/widgets/landing/public-layout";

export const metadata: Metadata = {
  title: "Subscription Policy",
  description:
    "Learn about Orki subscription plans, billing cycles, auto-renewal, cancellation, and access rights for exam preparation services.",
};

const plans = [
  {
    name: "All Access",
    price: "₱49",
    period: "per month",
    features: [
      "Full access to all exam categories",
      "Mock examinations with instant results",
      "Flashcard system",
      "Analytics & progress tracking",
      "Study streak tracking",
      "Personalized study recommendations",
    ],
  },
];

export default function SubscriptionPolicyPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <div className="bg-section-alt border-b border-border/50 py-14 sm:py-20 transition-colors duration-300">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Legal</p>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-3 leading-tight">
            Subscription Policy
          </h1>
          <p className="text-muted text-sm">Last updated: May 24, 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-16">
        {/* Plans overview */}
        <div className="mb-12">
          <h2 className="font-heading text-lg font-semibold text-foreground mb-5 pb-2 border-b border-border/50">
            1. Available Plans
          </h2>
          <div className="max-w-sm">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className="rounded-2xl border border-border bg-card-bg p-5 flex flex-col gap-3 transition-colors duration-300"
              >
                <div>
                  <p className="font-heading font-bold text-foreground">{plan.name}</p>
                  <p className="text-2xl font-bold text-primary mt-1">{plan.price}</p>
                  <p className="text-xs text-muted">{plan.period}</p>
                </div>
                <ul className="space-y-1.5">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex gap-2 text-xs text-secondary">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        className="shrink-0 mt-0.5"
                      >
                        <circle cx="7" cy="7" r="6" stroke="#10B981" strokeWidth="1.5" />
                        <path
                          d="M4.5 7l2 2 3-3"
                          stroke="#10B981"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted mt-4">
            * Price is in Philippine Peso (₱) and is subject to change. Current pricing is
            always displayed at checkout.
          </p>
        </div>

        <div className="space-y-10">
          <section id="billing" className="scroll-mt-24">
            <h2 className="font-heading text-lg font-semibold text-foreground mb-3 pb-2 border-b border-border/50">
              2. Billing & Payments
            </h2>
            <div className="space-y-3">
              <p className="text-[15px] text-secondary leading-relaxed">
                All subscription fees are charged in Philippine Peso (₱) and processed securely
                through PayMongo. By subscribing, you authorize Orki to charge your selected payment
                method at the applicable rate.
              </p>
              <p className="text-[15px] text-secondary leading-relaxed">
                A payment confirmation email will be sent to your registered email address after
                each successful transaction. Keep this for your records.
              </p>
              <p className="text-[15px] text-secondary leading-relaxed">
                Accepted payment methods include: Visa, Mastercard, GCash, Maya, GrabPay, and
                other methods supported by PayMongo.
              </p>
            </div>
          </section>

          <section id="auto-renewal" className="scroll-mt-24">
            <h2 className="font-heading text-lg font-semibold text-foreground mb-3 pb-2 border-b border-border/50">
              3. Auto-Renewal
            </h2>
            <div className="space-y-3">
              <p className="text-[15px] text-secondary leading-relaxed">
                Your subscription automatically renews each month unless you cancel before the
                renewal date.
              </p>
              <p className="text-[15px] text-secondary leading-relaxed">
                You will receive a reminder email at least 3 days before your subscription renews.
                Auto-renewal charges are non-refundable per our{" "}
                <Link href={routes.refundPolicy} className="text-primary hover:underline">
                  Refund Policy
                </Link>
                .
              </p>
            </div>
          </section>

          <section id="access" className="scroll-mt-24">
            <h2 className="font-heading text-lg font-semibold text-foreground mb-3 pb-2 border-b border-border/50">
              4. Access Rights
            </h2>
            <div className="space-y-3">
              <p className="text-[15px] text-secondary leading-relaxed">
                A valid subscription grants you a limited, non-exclusive, non-transferable right to
                access Orki&apos;s premium content and features for personal, non-commercial exam
                preparation purposes only.
              </p>
              <p className="text-[15px] text-secondary leading-relaxed">
                Access is tied to a single user account. Sharing your account credentials is
                prohibited and may result in account suspension.
              </p>
              <p className="text-[15px] text-secondary leading-relaxed">
                Premium content access begins immediately upon successful payment confirmation.
              </p>
            </div>
          </section>

          <section id="cancellation" className="scroll-mt-24">
            <h2 className="font-heading text-lg font-semibold text-foreground mb-3 pb-2 border-b border-border/50">
              5. Cancellation
            </h2>
            <div className="space-y-3">
              <p className="text-[15px] text-secondary leading-relaxed">
                You may cancel your subscription at any time from your account settings under
                Profile → Subscription. Cancellation takes effect at the end of the current billing
                period — you will retain access until then.
              </p>
              <p className="text-[15px] text-secondary leading-relaxed">
                Cancellation does not entitle you to a refund for the current period unless
                otherwise covered by the{" "}
                <Link href={routes.refundPolicy} className="text-primary hover:underline">
                  Refund Policy
                </Link>
                .
              </p>
              <p className="text-[15px] text-secondary leading-relaxed">
                After cancellation, your account reverts to a free tier. Your study data and
                progress are retained and accessible when you re-subscribe.
              </p>
            </div>
          </section>

          <section id="modifications" className="scroll-mt-24">
            <h2 className="font-heading text-lg font-semibold text-foreground mb-3 pb-2 border-b border-border/50">
              6. Price Modifications
            </h2>
            <div className="space-y-3">
              <p className="text-[15px] text-secondary leading-relaxed">
                Orki reserves the right to modify pricing at any time. Existing subscribers will be
                notified at least 14 days before any price change affecting their subscription.
              </p>
            </div>
          </section>

          <section id="contact" className="scroll-mt-24">
            <h2 className="font-heading text-lg font-semibold text-foreground mb-3 pb-2 border-b border-border/50">
              7. Contact
            </h2>
            <p className="text-[15px] text-secondary leading-relaxed">
              For subscription and billing inquiries, contact us at{" "}
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
            Ready to subscribe?{" "}
            <Link href={routes.subscribe} className="text-primary hover:underline">
              View plans
            </Link>
          </p>
          <Link
            href={routes.refundPolicy}
            className="text-sm text-secondary hover:text-primary transition-colors"
          >
            ← Refund Policy
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
