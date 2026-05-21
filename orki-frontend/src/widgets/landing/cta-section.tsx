import Image from "next/image";
import Link from "next/link";

import { routes } from "@/shared/config/routes";

const footerLinks = [
  { label: "Dashboard", href: routes.dashboard },
  { label: "Analytics", href: routes.analytics },
  { label: "Exams", href: routes.exams },
  { label: "Flashcards", href: routes.flashcards },
  { label: "Sign In", href: routes.login },
];

export function CtaSection() {
  return (
    <section className="relative overflow-hidden bg-[#0B1D35] py-16 lg:py-28">
      {/* Gradient layer */}
      <div className="absolute inset-0 bg-linear-to-br from-[#0B1D35] via-[#102A4C] to-[#1B3D62] pointer-events-none" />

      {/* Glow blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-175 h-100 rounded-full bg-primary/12 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-100 h-100 rounded-full bg-primary/8 blur-3xl pointer-events-none" />

      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* ── Left: text + CTA ── */}
          <div className="flex flex-col gap-8 text-center lg:text-left items-center lg:items-start">
            <div className="flex flex-col gap-5">
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-6xl font-bold leading-tight text-white">
                Your board exam{" "}
                <span className="bg-linear-to-r from-[var(--heading-to)] to-[var(--heading-from)] bg-clip-text text-transparent">
                  success starts here.
                </span>
              </h2>
              <p className="text-lg text-white/75 leading-relaxed max-w-md">
                Join thousands of determined students who trust Orki to organize their study journey
                and guide them to the result they deserve.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <Link
                href={routes.register}
                className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-primary px-9 py-4 font-semibold text-white shadow-lg shadow-primary/25 hover:-translate-y-0.5 hover:shadow-primary/40 hover:shadow-xl transition-all duration-200"
              >
                Start Studying Free
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
              <Link
                href={routes.login}
                className="inline-flex items-center justify-center rounded-2xl border border-white/20 px-9 py-4 font-medium text-white/80 hover:bg-white/8 hover:text-white transition-all duration-200"
              >
                Sign in
              </Link>
            </div>

            {/* Micro trust signals */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 pt-1">
              {["Free to start", "No credit card", "Cancel anytime"].map((item) => (
                <div key={item} className="flex items-center gap-1.5 text-sm text-white/65">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6" stroke="#10B981" strokeWidth="1.5" />
                    <path
                      d="M4.5 7l2 2 3-3"
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

          {/* ── Right: whale mascot ── */}
          <div className="flex items-center justify-center order-first lg:order-last">
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-72 h-72 rounded-full bg-primary/20 blur-3xl" />
              </div>
              <Image
                src="/mascott/OrkiLogoLeft.webp"
                alt="Orki mascot"
                width={400}
                height={400}
                className="relative object-contain drop-shadow-2xl animate-float w-48 h-48 sm:w-64 sm:h-64 lg:w-auto lg:h-auto"
              />
            </div>
          </div>
        </div>

        {/* ── Footer nav ── */}
        <div className="mt-16 lg:mt-24 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-4">
          <div className="flex items-center gap-2.5">
            <Image
              src="/Logo/OrkiLogo.svg"
              alt="Orki logo"
              width={28}
              height={28}
              className="rounded-lg opacity-90"
            />
            <span className="font-heading font-bold text-white/90 text-base">Orki</span>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {footerLinks.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="text-sm text-white/55 hover:text-white/90 transition-colors duration-150"
              >
                {label}
              </Link>
            ))}
          </nav>

          <p className="text-xs text-white/30">© 2026 Orki. All rights reserved.</p>
        </div>
      </div>
    </section>
  );
}
