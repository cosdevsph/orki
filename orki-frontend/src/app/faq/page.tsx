import type { Metadata } from "next";
import Link from "next/link";

import { routes } from "@/shared/config/routes";
import { PublicLayout } from "@/widgets/landing/public-layout";

export const metadata: Metadata = {
  title: "FAQs",
  description:
    "Frequently asked questions about Orki — account setup, exam preparation, flashcards, analytics, subscriptions, and more.",
};

const faqData = [
  {
    id: "getting-started",
    category: "Getting Started",
    questions: [
      {
        q: "What is Orki?",
        a: "Orki is a board exam preparation platform for Filipino professionals. It provides PRC-sourced mock examinations, smart flashcards, and AI-powered analytics and personalized study recommendations for licensure exams including PmLE, LET, CLE, and the Civil Service Examination.",
      },
      {
        q: "How do I create an account?",
        a: "You can register at orki.cosedevs.com/register using your email address or by signing in with your Google account. Google Sign-In is the fastest way to get started — no password required.",
      },
      {
        q: "Is Orki free to use?",
        a: "Orki requires a subscription to access its full features. A monthly All Access subscription is available at ₱49/month. See our Subscription Policy for details.",
      },
      {
        q: "Which exams does Orki support?",
        a: "Orki currently supports the Psychometrician Licensure Examination (PmLE), Licensure Examination for Teachers (LET), Criminology Licensure Examination (CLE), and the Civil Service Examination (CSE). More categories are being added.",
      },
      {
        q: "Do I need to install an app?",
        a: "No. Orki is a web application that works on any modern browser — desktop, tablet, or mobile. Simply visit orki.cosedevs.com to get started.",
      },
    ],
  },
  {
    id: "account",
    category: "Account & Profile",
    questions: [
      {
        q: "How do I update my profile information?",
        a: "Go to Profile from the main navigation, then click Edit Profile. You can update your display name and profile photo.",
      },
      {
        q: "Can I change my email address?",
        a: "If you registered with email/password, contact us at support@orki.cosedevs.com to request an email change. Google Sign-In accounts use the email from your Google account.",
      },
      {
        q: "How do I change my password?",
        a: "Go to Profile → Account Security → Change Password. If you signed in with Google, you manage your password through your Google account settings.",
      },
      {
        q: "Can I use Orki on multiple devices?",
        a: "Yes. Your account and progress sync automatically across all devices. Just sign in with the same account on any device.",
      },
      {
        q: "How do I delete my account?",
        a: "To request account deletion, email support@orki.cosedevs.com with the subject 'Account Deletion Request'. We will process your request within 30 days and delete all associated personal data.",
      },
    ],
  },
  {
    id: "exams",
    category: "Mock Exams",
    questions: [
      {
        q: "How are the exam questions sourced?",
        a: "Our question bank is sourced from PRC licensure examination materials and reputable online review resources, then verified by educational content specialists for accuracy and alignment with current syllabi. AI is not used to generate exam questions.",
      },
      {
        q: "How many questions are in the question bank?",
        a: "The question bank contains hundreds of curated practice questions per exam category, with new questions added regularly to keep content fresh and comprehensive.",
      },
      {
        q: "Can I review my incorrect answers after an exam?",
        a: "Yes. After completing any mock exam, you can access a full review of all questions including explanations for correct answers. This helps you understand your mistakes and improve.",
      },
      {
        q: "Are the mock exams timed?",
        a: "Yes. Mock exams are timed to simulate real licensure examination conditions. You can see the timer in the top bar during an exam session.",
      },
      {
        q: "Can I pause an exam?",
        a: "Exams cannot be paused once started, to maintain exam integrity. Make sure you are in a distraction-free environment before beginning.",
      },
    ],
  },
  {
    id: "flashcards",
    category: "Flashcards",
    questions: [
      {
        q: "How do the flashcards work?",
        a: "Orki's flashcard system uses spaced repetition — a proven learning technique that shows you cards at increasing intervals based on how well you know them. Cards you struggle with appear more frequently.",
      },
      {
        q: "Can I create my own flashcard decks?",
        a: "Yes. You can create custom flashcard decks from the Flashcards section. Add your own terms and definitions to supplement the built-in content.",
      },
      {
        q: "How is my flashcard progress tracked?",
        a: "Orki tracks which cards you've mastered, which need review, and your overall deck completion percentage. This data appears in your Analytics dashboard.",
      },
      {
        q: "Are flashcards available offline?",
        a: "Currently, Orki requires an internet connection to access flashcards. Offline mode is on our roadmap for a future update.",
      },
    ],
  },
  {
    id: "analytics",
    category: "Analytics",
    questions: [
      {
        q: "What does the Analytics dashboard show?",
        a: "The Analytics dashboard shows your study streaks, exam score trends, subject mastery levels, time spent studying, and personalized improvement recommendations.",
      },
      {
        q: "How is subject mastery calculated?",
        a: "Subject mastery is calculated based on your cumulative performance across all exam questions in that subject area. A higher accuracy rate over more questions results in a higher mastery percentage.",
      },
      {
        q: "What is a study streak?",
        a: "A study streak is the number of consecutive days you have engaged with Orki content — either taking an exam or reviewing flashcards. Streaks reset if you miss a day.",
      },
      {
        q: "Can I export my analytics data?",
        a: "All subscribers can contact support to request a data export. Contact support@orki.cosedevs.com for data export requests.",
      },
    ],
  },
  {
    id: "billing",
    category: "Billing & Payments",
    questions: [
      {
        q: "What payment methods are accepted?",
        a: "Orki accepts Visa, Mastercard, GCash, Maya, GrabPay, and other methods supported by PayMongo. All transactions are processed in Philippine Peso (₱).",
      },
      {
        q: "How do I cancel my subscription?",
        a: "Go to Profile → Subscription → Cancel Plan. Your access continues until the end of the current billing period. You will not be charged at the next renewal.",
      },
      {
        q: "Is my payment information safe?",
        a: "Yes. Orki does not store your card details. All payment processing is handled by PayMongo, which is PCI-DSS compliant and licensed by the Bangko Sentral ng Pilipinas.",
      },
      {
        q: "Can I get a refund?",
        a: "Refunds are available within 7 days of your first subscription purchase, subject to usage limits. See our Refund Policy for full details.",
      },
      {
        q: "Where can I find my payment receipts?",
        a: "Payment confirmation emails are sent to your registered email after each transaction. You can also view your payment history at Profile → Payment History.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <div className="bg-section-alt border-b border-border/50 py-14 sm:py-20 transition-colors duration-300">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Support</p>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-3 leading-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-secondary">
            Can&apos;t find your answer?{" "}
            <Link href={routes.contact} className="text-primary hover:underline">
              Contact our team
            </Link>
            .
          </p>
        </div>
      </div>

      {/* FAQ content */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-16">
        {/* Category jump links */}
        <div className="flex flex-wrap gap-2 mb-10">
          {faqData.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="rounded-full border border-border bg-card-bg px-4 py-2 text-xs font-medium text-secondary hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-all duration-150"
            >
              {section.category}
            </a>
          ))}
        </div>

        {/* FAQ sections with native accordion */}
        <div className="space-y-12">
          {faqData.map((section) => (
            <div key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="font-heading text-base font-bold text-foreground mb-4 pb-2 border-b border-border/50 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                {section.category}
              </h2>
              <div className="space-y-2">
                {section.questions.map((item, i) => (
                  <details
                    key={i}
                    className="group rounded-2xl border border-border bg-card-bg overflow-hidden transition-colors duration-200 open:border-primary/25 open:bg-primary/3"
                  >
                    <summary className="flex items-center justify-between gap-4 cursor-pointer list-none px-5 py-4 select-none hover:bg-overlay-hover-mid transition-colors duration-150">
                      <span className="text-[15px] font-medium text-foreground">{item.q}</span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        className="shrink-0 text-muted transition-transform duration-200 group-open:rotate-180"
                      >
                        <path
                          d="M4 6l4 4 4-4"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </summary>
                    <div className="px-5 pb-4 pt-0">
                      <p className="text-[15px] text-secondary leading-relaxed">{item.a}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Still need help? */}
        <div className="mt-14 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <p className="font-semibold text-foreground mb-1">Didn&apos;t find your answer?</p>
            <p className="text-sm text-muted">Our team responds within 1–2 business days.</p>
          </div>
          <Link
            href={routes.reportProblem}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-7 py-3 text-sm font-semibold text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25 transition-all duration-200 shrink-0"
          >
            Report a Problem
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
