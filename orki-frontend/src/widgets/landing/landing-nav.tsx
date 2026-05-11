import Image from "next/image";
import Link from "next/link";

import { routes } from "@/shared/config/routes";

export function LandingNav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-nav-bg border-b border-border/50 transition-colors duration-300">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3.5">
        {/* Logo */}
        <Link href={routes.home} className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center bg-primary/8">
            <Image
              src="/Logo/OrkiLogo.svg"
              alt="Orki logo"
              width={36}
              height={36}
              className="object-contain"
              priority
            />
          </div>
          <span className="font-heading text-xl font-bold text-foreground">Orki</span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-8">
          {[
            { label: "Features", href: "#features" },
            { label: "How It Works", href: "#showcase" },
            { label: "Results", href: "#results" },
          ].map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="text-sm font-medium text-muted hover:text-foreground transition-colors duration-150"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Auth actions */}
        <div className="flex items-center gap-3">
          <Link
            href={routes.login}
            className="text-sm font-medium text-foreground hover:text-primary transition-colors duration-150"
          >
            Sign in
          </Link>
          <Link
            href={routes.register}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </header>
  );
}
