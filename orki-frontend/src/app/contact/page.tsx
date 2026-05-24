import type { Metadata } from "next";

import { PublicLayout } from "@/widgets/landing/public-layout";
import { ContactForm } from "./_components/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with the Orki team for support, partnership inquiries, or any questions about our board exam preparation platform.",
};

const contactInfo = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3 9l9 6 9-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    label: "General Inquiries",
    value: "support@orki.cosedevs.com",
    href: "mailto:support@orki.cosedevs.com",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3 9l9 6 9-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    label: "Billing & Payments",
    value: "billing@orki.cosedevs.com",
    href: "mailto:billing@orki.cosedevs.com",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3 9l9 6 9-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    label: "Privacy & Data",
    value: "privacy@orki.cosedevs.com",
    href: "mailto:privacy@orki.cosedevs.com",
  },
];

export default function ContactPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <div className="bg-section-alt border-b border-border/50 py-14 sm:py-20 transition-colors duration-300">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Company</p>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-3 leading-tight">
            Get in Touch
          </h1>
          <p className="text-secondary max-w-lg">
            Have a question, feedback, or partnership inquiry? We'd love to hear from you. Our team
            typically responds within 1–2 business days.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-14">
          {/* Form — wider column */}
          <div className="lg:col-span-3">
            <h2 className="font-heading text-lg font-semibold text-foreground mb-6">
              Send us a message
            </h2>
            <ContactForm />
          </div>

          {/* Contact info — narrower column */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            <h2 className="font-heading text-lg font-semibold text-foreground">
              Contact details
            </h2>

            <div className="flex flex-col gap-3">
              {contactInfo.map((info) => (
                <a
                  key={info.label}
                  href={info.href}
                  className="group rounded-2xl border border-border bg-card-bg p-5 flex flex-col gap-1.5 hover:border-primary/30 hover:bg-primary/3 transition-all duration-150"
                >
                  <div className="flex items-center gap-2 text-muted group-hover:text-primary transition-colors">
                    {info.icon}
                    <span className="text-xs font-bold uppercase tracking-widest">
                      {info.label}
                    </span>
                  </div>
                  <p className="text-sm text-secondary group-hover:text-primary transition-colors">
                    {info.value}
                  </p>
                </a>
              ))}
            </div>

            <div className="rounded-2xl border border-border bg-card-bg p-5 flex flex-col gap-2 transition-colors duration-300">
              <p className="text-xs font-bold uppercase tracking-widest text-muted">
                Response Time
              </p>
              <p className="font-semibold text-foreground">1–2 business days</p>
              <p className="text-sm text-secondary">
                Monday to Friday, 9 AM – 6 PM PHT
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card-bg p-5 flex flex-col gap-2 transition-colors duration-300">
              <p className="text-xs font-bold uppercase tracking-widest text-muted">
                Based in
              </p>
              <p className="font-semibold text-foreground">Philippines 🇵🇭</p>
              <p className="text-sm text-secondary">
                Proudly serving Filipino professionals nationwide.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
