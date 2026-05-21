"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { routes } from "@/shared/config/routes";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#showcase" },
  { label: "Results", href: "#results" },
];

export function LandingNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-nav-bg border-b border-border/50 transition-colors duration-300">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 sm:px-6 py-3.5">
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

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                className="text-sm font-medium text-muted hover:text-foreground transition-colors duration-150"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Desktop auth actions */}
          <div className="hidden md:flex items-center gap-3">
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

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden flex flex-col items-center justify-center w-10 h-10 rounded-xl hover:bg-overlay-hover-mid transition-colors duration-150 gap-1.5"
          >
            <span
              className={`block w-5 h-0.5 bg-foreground rounded-full transition-all duration-200 ${menuOpen ? "rotate-45 translate-y-2" : ""}`}
            />
            <span
              className={`block w-5 h-0.5 bg-foreground rounded-full transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`block w-5 h-0.5 bg-foreground rounded-full transition-all duration-200 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
            />
          </button>
        </div>
      </header>

      {/* Mobile drawer overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile slide-in drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-72 max-w-[85vw] bg-nav-bg border-l border-border/50 shadow-2xl transition-transform duration-300 md:hidden ${menuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex flex-col h-full px-6 pt-20 pb-8 gap-8">
          {/* Nav links */}
          <nav className="flex flex-col gap-1">
            {navLinks.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="text-base font-medium text-foreground hover:text-primary hover:bg-overlay-hover-mid rounded-xl px-4 py-3 transition-colors duration-150"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Auth actions */}
          <div className="flex flex-col gap-3 mt-auto">
            <Link
              href={routes.login}
              onClick={() => setMenuOpen(false)}
              className="w-full rounded-xl border border-border bg-card-bg px-4 py-3 text-sm font-semibold text-foreground text-center hover:bg-overlay-hover-mid transition-all duration-200"
            >
              Sign in
            </Link>
            <Link
              href={routes.register}
              onClick={() => setMenuOpen(false)}
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm text-center hover:shadow-md transition-all duration-200"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
