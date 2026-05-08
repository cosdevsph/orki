"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navItems } from "@/features/navigation/nav-items";
import { routes } from "@/shared/config/routes";

// ─── Nav Icons ───────────────────────────────────────────────────────────────

function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2.75 8.594 11 2.75l8.25 5.844V18.7a1.1 1.1 0 0 1-1.1 1.1H14.3a1.1 1.1 0 0 1-1.1-1.1v-3.85H8.8V18.7a1.1 1.1 0 0 1-1.1 1.1H3.85a1.1 1.1 0 0 1-1.1-1.1V8.594Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ExamsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3.667" y="2.75" width="14.667" height="16.5" rx="2.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7.333 7.333h7.334M7.333 11h7.334M7.333 14.667h4.584" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function FlashcardsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2.75" y="6.417" width="16.5" height="11" rx="2.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6.417 6.417V5.042a1.833 1.833 0 0 1 1.833-1.834h5.5A1.833 1.833 0 0 1 15.583 5.042v1.375" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M11 10.083v3.667M9.167 11.917h3.666" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function AnalyticsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3.667 18.333V13.75M7.333 18.333V9.167M11 18.333V11M14.667 18.333V6.417M18.333 18.333V3.667" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ProfileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="7.333" r="3.667" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.667 19.25c0-4.051 3.284-7.333 7.333-7.333s7.333 3.282 7.333 7.333" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  [routes.dashboard]: DashboardIcon,
  [routes.exams]: ExamsIcon,
  [routes.flashcards]: FlashcardsIcon,
  [routes.analytics]: AnalyticsIcon,
  [routes.profile]: ProfileIcon,
};

// ─── Component ───────────────────────────────────────────────────────────────

export function BottomDock() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2"
    >
      <div className="glass-dock flex items-center gap-1 rounded-2xl px-2.5 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = iconMap[item.href];

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={[
                "group relative flex flex-col items-center gap-1 rounded-xl px-5 py-2.5",
                "transition-all duration-200 ease-out select-none",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted hover:bg-overlay-hover-mid hover:text-foreground",
              ].join(" ")}
            >
              {/* Active indicator dot */}
              {isActive && (
                <span className="absolute -top-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
              )}

              {Icon && (
                <Icon
                  className={[
                    "h-5.5 w-5.5 transition-transform duration-200",
                    "group-hover:scale-110",
                    isActive ? "scale-110" : "",
                  ].join(" ")}
                />
              )}
              <span
                className={[
                  "text-[10.5px] font-medium leading-none tracking-tight",
                  isActive ? "text-primary" : "text-muted group-hover:text-foreground",
                ].join(" ")}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
