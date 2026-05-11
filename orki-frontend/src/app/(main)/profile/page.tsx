"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import { useExamType } from "@/hooks/useExamType";
import { useNotification } from "@/providers/notification-provider";
import { useTheme, type Theme } from "@/providers/theme-provider";
import { logoutFromBackend } from "@/shared/api/auth";
import { signOutFirebase } from "@/shared/firebase/auth";
import { routes } from "@/shared/config/routes";

// ─── Settings group ───────────────────────────────────────────────────────────

type SettingRowProps = {
  label: string;
  description?: string;
  control?: React.ReactNode;
  onClick?: () => void;
  destructive?: boolean;
};

function SettingRow({ label, description, control, onClick, destructive }: SettingRowProps) {
  return (
    <div
      className={[
        "flex items-center justify-between px-5 py-3.5 transition-colors duration-200",
        onClick ? "cursor-pointer hover:bg-overlay-hover" : "",
      ].join(" ")}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
    >
      <div className="space-y-0.5">
        <p className={`text-sm font-medium ${destructive ? "text-red-500" : "text-foreground"}`}>
          {label}
        </p>
        {description && <p className="text-xs text-muted">{description}</p>}
      </div>
      {control ?? (
        onClick && (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-muted">
            <path d="M5.25 2.917 9.333 7 5.25 11.083" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )
      )}
    </div>
  );
}

function SettingsGroup({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      {title && (
        <h3 className="px-1 text-xs font-semibold uppercase tracking-widest text-muted">{title}</h3>
      )}
      <div className="glass overflow-hidden rounded-2xl divide-y divide-divider">
        {children}
      </div>
    </div>
  );
}

// ─── Toggle ────────────────────────────────────────────────────────────────────

function Toggle({ checked }: { checked: boolean }) {
  return (
    <div
      className="relative h-6 w-11 rounded-full transition-colors duration-200"
      style={{ backgroundColor: checked ? "var(--primary)" : "var(--toggle-off)" }}
    >
      <div
        className="absolute top-0.5 h-5 w-5 rounded-full bg-toggle-knob shadow-sm transition-transform duration-200"
        style={{ transform: checked ? "translateX(20px)" : "translateX(2px)" }}
      />
    </div>
  );
}

// ─── Appearance ────────────────────────────────────────────────────────────────

const THEME_OPTIONS: {
  value: Theme;
  label: string;
  description: string;
  preview: { bg: string; surface: string; accent: string; text: string };
}[] = [
  {
    value: "light",
    label: "Light",
    description: "Clean & bright",
    preview: { bg: "#ffffff", surface: "rgba(255,255,255,0.75)", accent: "#2fa2e2", text: "#001a3b" },
  },
  {
    value: "dark",
    label: "Dark",
    description: "Easy on the eyes",
    preview: { bg: "#131313", surface: "rgba(255,255,255,0.07)", accent: "#38bdf8", text: "#e2e8f0" },
  },
  {
    value: "pink",
    label: "Pink",
    description: "Soft blush tone",
    preview: { bg: "#F8E8EE", surface: "rgba(255,255,255,0.65)", accent: "#c4758a", text: "#2d1020" },
  },
];

function ThemeCard({
  option,
  isActive,
  onClick,
}: {
  option: (typeof THEME_OPTIONS)[number];
  isActive: boolean;
  onClick: () => void;
}) {
  const { bg, surface, accent, text } = option.preview;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={[
        "group relative flex flex-col gap-3 rounded-2xl border-2 p-4 transition-all duration-200 text-left w-full",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isActive
          ? "border-primary shadow-md shadow-primary/10"
          : "border-border hover:border-primary/40 hover:bg-overlay-hover",
      ].join(" ")}
    >
      {/* Mini theme preview */}
      <div
        className="relative h-20 w-full overflow-hidden rounded-xl"
        style={{ background: bg }}
      >
        {/* Mock card */}
        <div
          className="absolute left-3 top-3 right-3 h-8 rounded-lg"
          style={{ background: surface, border: `1px solid ${accent}22` }}
        />
        {/* Mock accent bar */}
        <div
          className="absolute bottom-3 left-3 h-1.5 w-10 rounded-full"
          style={{ background: accent }}
        />
        {/* Mock text line */}
        <div
          className="absolute bottom-3 left-16 h-1.5 w-8 rounded-full opacity-30"
          style={{ background: text }}
        />
      </div>

      {/* Label */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">{option.label}</p>
          <p className="text-xs text-muted">{option.description}</p>
        </div>
        {/* Active check */}
        <div
          className={[
            "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all duration-200",
            isActive
              ? "border-primary bg-primary"
              : "border-border bg-transparent",
          ].join(" ")}
        >
          {isActive && (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path
                d="M2 5l2.5 2.5L8 3"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      </div>
    </button>
  );
}

function AppearanceSection() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-2">
      <h3 className="px-1 text-xs font-semibold uppercase tracking-widest text-muted">Appearance</h3>
      <div className="glass overflow-hidden rounded-2xl p-5 space-y-4">
        <div>
          <p className="text-sm font-medium text-foreground">Theme</p>
          <p className="text-xs text-muted mt-0.5">Choose how Orki looks to you</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {THEME_OPTIONS.map((opt) => (
            <ThemeCard
              key={opt.value}
              option={opt}
              isActive={theme === opt.value}
              onClick={() => setTheme(opt.value)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const { notify } = useNotification();
  const { professionalTitle, examFullName, examType } = useExamType();

  const displayName = user?.display_name || `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim() || "Orki User";
  const email = user?.email ?? "—";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = async () => {
    try {
      await logoutFromBackend();
      await signOutFirebase().catch(() => {});  // Best-effort Firebase sign-out
      setUser(null);
      notify("You've been logged out.", "success");
      router.replace(routes.login);
    } catch {
      notify("Logout failed. Please try again.", "error");
    }
  };

  return (
    <div className="animate-page-in mx-auto max-w-2xl space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground">Profile</h1>
        <p className="text-base text-muted">Manage your account and study preferences.</p>
      </div>

      {/* Profile card */}
      <div className="glass rounded-2xl p-6 flex items-center gap-5">
        {false ? ( // photoURL is managed by backend profile; placeholder for future
          <Image
            src=""
            alt={displayName}
            width={72}
            height={72}
            className="rounded-2xl object-cover shadow-md"
          />
        ) : (
          <div className="flex h-18 w-18 items-center justify-center rounded-2xl bg-primary/15 shadow-inner">
            <span className="font-heading text-2xl font-bold text-primary">{initials}</span>
          </div>
        )}
        <div className="flex-1 space-y-0.5">
          <p className="font-heading text-xl font-bold text-foreground">{displayName}</p>
          <p className="text-sm text-muted">{email}</p>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-[11px] font-semibold text-primary">Pro Plan</span>
          </div>
        </div>
        <button
          type="button"
          className="rounded-xl bg-overlay-hover-mid px-4 py-2 text-xs font-semibold text-secondary transition hover:bg-overlay-hover-strong"
        >
          Edit Profile
        </button>
      </div>

      {/* Exam Journey (view-only) */}
      {examType && (
        <div className="space-y-2">
          <p className="px-1 text-xs font-bold uppercase tracking-widest text-muted">
            Exam Journey
          </p>
          <div className="glass overflow-hidden rounded-2xl">
            <div
              className="px-5 py-4"
              style={{
                background:
                  "linear-gradient(135deg, rgba(47,162,226,0.07) 0%, rgba(139,92,246,0.05) 100%)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-foreground">{examFullName}</p>
                  <p className="text-xs text-muted">{examType}</p>
                </div>
                <span
                  className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                  style={{ background: "rgba(47,162,226,0.1)", color: "#2FA2E2" }}
                >
                  View Only
                </span>
              </div>
            </div>
            <div className="flex divide-x divide-border/50">
              <div className="flex-1 px-5 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">Professional Title</p>
                <p className="mt-1 font-heading text-lg font-bold text-foreground">
                  Future{" "}
                  <span
                    style={{
                      background: "linear-gradient(135deg, var(--primary) 0%, #8B5CF6 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {professionalTitle}
                  </span>
                </p>
              </div>
              {user?.exam_date && (
                <div className="flex-1 px-5 py-4">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">Target Exam Date</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {new Date(user.exam_date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              )}
            </div>
            <div className="px-5 py-3 border-t border-border/50">
              <p className="text-[11px] text-muted">
                🔒 Exam type is permanently set after onboarding and cannot be changed.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Account settings */}
      <AppearanceSection />

      {/* Account settings */}
      <SettingsGroup title="Account">
        <SettingRow label="Display Name" description={displayName} onClick={() => {}} />
        <SettingRow label="Email Address" description={email} onClick={() => {}} />
        <SettingRow label="Change Password" description="Update your login password" onClick={() => {}} />
      </SettingsGroup>

      {/* Preferences */}
      <SettingsGroup title="Preferences">
        <SettingRow
          label="Daily Study Reminders"
          description="Receive a nudge at your preferred study time"
          control={<Toggle checked={true} />}
        />
        <SettingRow
          label="Streak Protection"
          description="Get notified before your streak is at risk"
          control={<Toggle checked={true} />}
        />
        <SettingRow
          label="Show Mastery Progress"
          description="Display mastery % on flashcard decks"
          control={<Toggle checked={false} />}
        />
        <SettingRow
          label="Exam Countdown Alerts"
          description="Reminders 3 days before an upcoming exam"
          control={<Toggle checked={true} />}
        />
      </SettingsGroup>

      {/* Subscription */}
      <SettingsGroup title="Subscription">
        <div className="px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-foreground">Orki Pro</p>
              <p className="text-xs text-muted">Renews June 1, 2026 · $9.99/mo</p>
            </div>
            <span className="rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-semibold text-success">
              Active
            </span>
          </div>
        </div>
        <SettingRow label="Manage Subscription" onClick={() => {}} />
        <SettingRow label="Billing History" onClick={() => {}} />
      </SettingsGroup>

      {/* Danger zone */}
      <SettingsGroup title="Account Actions">
        <SettingRow
          label="Sign Out"
          description="You will be returned to the login screen"
          onClick={handleLogout}
          destructive
        />
        <SettingRow
          label="Delete Account"
          description="Permanently remove all data — cannot be undone"
          onClick={() => {}}
          destructive
        />
      </SettingsGroup>

      {/* Mascot footer */}
      <div className="flex flex-col items-center gap-2 pb-4 opacity-50">
        <Image
          src="/mascott/OrkiLogoFront.webp"
          alt="Orki"
          width={40}
          height={40}
          className="opacity-60"
        />
        <p className="text-[11px] text-muted">Orki · Version 0.1.0</p>
      </div>
    </div>
  );
}

