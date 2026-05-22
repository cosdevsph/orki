"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import { useExamType } from "@/hooks/useExamType";
import { useNotification } from "@/providers/notification-provider";
import { useTheme, type Theme } from "@/providers/theme-provider";
import { logoutFromBackend } from "@/shared/api/auth";
import { signOutFirebase } from "@/shared/firebase/auth";
import { getUserAvatar, DEFAULT_AVATAR } from "@/shared/firebase/avatar";
import { routes } from "@/shared/config/routes";
import { NextPaymentCard } from "@/widgets/profile/next-payment-card";
import { SubscriptionHistoryCard } from "@/widgets/profile/subscription-history-card";
import { DeactivateAccountModal } from "@/widgets/profile/deactivate-account-modal";
import { DeleteAccountModal } from "@/widgets/profile/delete-account-modal";
import { PreferencesCard } from "@/widgets/profile/preferences-card";
import { AvatarSelectorModal } from "@/widgets/profile/avatar-selector-modal";

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
        "flex items-center justify-between px-4 py-3 md:px-5 md:py-3.5 transition-colors duration-200",
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

// ─── Appearance ────────────────────────────────────────────────────────────────

const THEME_OPTIONS: {
  value: Theme;
  label: string;
  description: string;
  preview: { bg: string; surface: string; accent: string; text: string };
}[] = [
  {
    value: "light",
    label: "Default",
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
    value: "blue",
    label: "Blue",
    description: "Ocean calm",
    preview: { bg: "#EEF3FB", surface: "rgba(255,255,255,0.72)", accent: "#2563eb", text: "#0f2044" },
  },
  {
    value: "purple",
    label: "Purple",
    description: "Deep twilight",
    preview: { bg: "#E8E0F8", surface: "rgba(255,255,255,0.60)", accent: "#6d28d9", text: "#15063a" },
  },
  {
    value: "pink",
    label: "Pink",
    description: "Soft blush tone",
    preview: { bg: "#F0D8E4", surface: "rgba(255,255,255,0.60)", accent: "#b05e74", text: "#26091a" },
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
        "group relative flex flex-col gap-2 md:gap-3 rounded-2xl border-2 p-2.5 md:p-4 transition-all duration-200 text-left w-full",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isActive
          ? "border-primary shadow-md shadow-primary/10"
          : "border-border hover:border-primary/40 hover:bg-overlay-hover",
      ].join(" ")}
    >
      {/* Mini theme preview */}
      <div
        className="relative h-14 md:h-20 w-full overflow-hidden rounded-xl"
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
          <p className="text-xs md:text-sm font-semibold text-foreground">{option.label}</p>
          <p className="text-[10px] md:text-xs text-muted">{option.description}</p>
        </div>
        {/* Active check */}
        <div
          className={[
            "flex h-4 w-4 md:h-5 md:w-5 items-center justify-center rounded-full border-2 transition-all duration-200",
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
        <div className="glass overflow-hidden rounded-2xl p-4 md:p-5 space-y-4">
        <div>
          <p className="text-sm font-medium text-foreground">Theme</p>
          <p className="text-xs text-muted mt-0.5">Choose how Orki looks to you</p>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 md:gap-3">
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

  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [avatar, setAvatar] = useState<string>(DEFAULT_AVATAR);

  // Load avatar from Firestore once the user is known
  useEffect(() => {
    if (!user?.uid) return;
    getUserAvatar(user.uid).then(setAvatar).catch(() => {});
  }, [user?.uid]);

  const displayName = user?.display_name || `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim() || "Orki User";
  const email = user?.email ?? "—";

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
    <div className="animate-page-in mx-auto max-w-2xl space-y-5 md:space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-heading text-2xl md:text-4xl font-bold tracking-tight text-foreground">Profile</h1>
        <p className="text-sm md:text-base text-muted">Manage your account and study preferences.</p>
      </div>

      {/* Profile card */}
      <div className="glass rounded-2xl p-4 md:p-6 flex items-center gap-3 md:gap-5">
        {/* Avatar — clickable to open selector */}
        <button
          type="button"
          onClick={() => setAvatarOpen(true)}
          className="relative shrink-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label="Change avatar"
        >
          <div className="flex h-18 w-18 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
            <Image
              src={avatar}
              alt={displayName}
              width={68}
              height={68}
              className="rounded-xl object-cover drop-shadow-sm"
            />
          </div>
          {/* Edit badge */}
          <span className="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary shadow-md">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
              <path
                d="M7.5 1.5l2 2-5.5 5.5H2v-2L7.5 1.5z"
                stroke="white"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>

        <div className="flex-1 space-y-0.5">
          <p className="font-heading text-base md:text-xl font-bold text-foreground">{displayName}</p>
          <p className="text-sm text-muted">{email}</p>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-[11px] font-semibold text-primary">Pro Plan</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setAvatarOpen(true)}
          className="hidden sm:block rounded-xl bg-overlay-hover-mid px-4 py-2 text-xs font-semibold text-secondary transition hover:bg-overlay-hover-strong"
        >
          Change Avatar
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
              className="px-4 py-3 md:px-5 md:py-4"
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
              <div className="flex-1 px-4 py-3 md:px-5 md:py-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">Professional Title</p>
                <p className="mt-1 font-heading text-base md:text-lg font-bold text-foreground">
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
                <div className="flex-1 px-4 py-3 md:px-5 md:py-4">
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
            <div className="px-4 py-2.5 md:px-5 md:py-3 border-t border-border/50">
              <p className="text-[11px] text-muted">
                Exam type is permanently set after onboarding and cannot be changed.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Account settings */}
      <AppearanceSection />

      {/* Account info — read-only */}
      <SettingsGroup title="Account">
        <SettingRow label="Display Name" description={displayName} />
        <SettingRow label="Email Address" description={email} />
      </SettingsGroup>

      {/* Preferences — fully functional, synced with Firestore + FCM */}
      <PreferencesCard />

      {/* Subscription — live data */}
      <NextPaymentCard />

      {/* Payment History — live data */}
      <SubscriptionHistoryCard />

      {/* Danger zone */}
      <SettingsGroup title="Account Actions">
        <SettingRow
          label="Sign Out"
          description="You will be returned to the login screen"
          onClick={handleLogout}
          destructive
        />
        <SettingRow
          label="Deactivate Account"
          description="Temporarily disable your account — reactivate by signing in"
          onClick={() => setDeactivateOpen(true)}
          destructive
        />
        <SettingRow
          label="Delete Account"
          description="Permanently remove all data — cannot be undone"
          onClick={() => setDeleteOpen(true)}
          destructive
        />
      </SettingsGroup>

      {/* Modals */}
      <AvatarSelectorModal
        open={avatarOpen}
        uid={user?.uid ?? ""}
        currentAvatar={avatar}
        onClose={() => setAvatarOpen(false)}
        onSave={(next) => {
          setAvatar(next);
          if (user) setUser({ ...user, avatar: next });
        }}
      />
      <DeactivateAccountModal
        open={deactivateOpen}
        onClose={() => setDeactivateOpen(false)}
      />
      <DeleteAccountModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
      />

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

