import Image from "next/image";
import Link from "next/link";

import { routes } from "@/shared/config/routes";

const footerColumns = [
  {
    title: "Product",
    links: [
      { label: "Dashboard", href: routes.featureDashboardTracking },
      { label: "Exams", href: routes.featureMockExams },
      { label: "Flashcards", href: routes.featureSmartFlashcards },
      { label: "Analytics", href: routes.featureSmartAnalytics },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: routes.about },
      { label: "Contact", href: routes.contact },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms & Conditions", href: routes.terms },
      { label: "Privacy Policy", href: routes.privacy },
      { label: "Refund Policy", href: routes.refundPolicy },
      { label: "Subscription Policy", href: routes.subscriptionPolicy },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: routes.helpCenter },
      { label: "FAQs", href: routes.faq },
      { label: "Report a Problem", href: routes.reportProblem },
    ],
  },
];

const examCategories = [
  { label: "PmLE", href: routes.examCategoryPmle },
  { label: "LET", href: routes.examCategoryLet },
  { label: "CLE", href: routes.examCategoryCle },
  { label: "Civil Service", href: routes.examCategoryCivilService },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#0B1D35]">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-br from-[#0B1D35] via-[#102A4C] to-[#0B1D35] pointer-events-none" />

      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 pt-14 pb-8">
        {/* Primary grid: brand + nav columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-10 lg:gap-6 pb-10 border-b border-white/10">
          {/* Brand column */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1 flex flex-col gap-5">
            <Link href={routes.home} className="flex items-center gap-2.5 w-fit">
              <div className="w-8 h-8 rounded-xl overflow-hidden bg-white/8 flex items-center justify-center">
                <Image
                  src="/Logo/OrkiLogo.svg"
                  alt="Orki"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </div>
              <span className="font-heading font-bold text-white text-lg">Orki</span>
            </Link>
            <p className="text-sm text-white/50 leading-relaxed max-w-50">
              Smart exam preparation platform for Filipino board exam takers.
            </p>
            <Link
              href={routes.register}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#5bc5f5] hover:text-white transition-colors duration-150 w-fit"
            >
              Start free →
            </Link>
          </div>

          {/* Navigation columns */}
          {footerColumns.map((col) => (
            <div key={col.title} className="flex flex-col gap-3.5">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/35">
                {col.title}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/55 hover:text-white transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Exam categories strip */}
        <div className="py-6 border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5">
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/35 shrink-0">
            Exam Categories
          </span>
          <div className="flex flex-wrap gap-2">
            {examCategories.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="rounded-full border border-white/10 bg-white/4 px-4 py-1.5 text-xs font-medium text-white/55 hover:bg-white/10 hover:text-white hover:border-white/25 transition-all duration-150"
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/25 order-last sm:order-first">
            © 2026 Orki. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5">
            <Link
              href={routes.terms}
              className="text-xs text-white/35 hover:text-white/65 transition-colors"
            >
              Terms
            </Link>
            <Link
              href={routes.privacy}
              className="text-xs text-white/35 hover:text-white/65 transition-colors"
            >
              Privacy
            </Link>
            <Link
              href={routes.refundPolicy}
              className="text-xs text-white/35 hover:text-white/65 transition-colors"
            >
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
