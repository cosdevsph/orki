"use client";

import { useEffect } from "react";

import { useFCM } from "@/hooks/useFCM";
import { usePreferences } from "@/hooks/usePreferences";
import { useNotification } from "@/providers/notification-provider";

// ─── Toggle ───────────────────────────────────────────────────────────────────
// Larger touch-target (28 px) with a smooth knob transition.

function PreferenceToggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="relative shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
      style={{
        width: 50,
        height: 28,
        backgroundColor: checked ? "var(--primary)" : "var(--toggle-off, #d1d5db)",
        transition: "background-color 0.2s ease",
      }}
    >
      <span className="sr-only">{checked ? "On" : "Off"}</span>
      <span
        className="absolute top-0.75 left-0.75 rounded-full bg-white shadow-md"
        style={{
          width: 22,
          height: 22,
          transform: checked ? "translateX(22px)" : "translateX(0px)",
          transition: "transform 0.2s ease",
          willChange: "transform",
        }}
      />
    </button>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────────
// Each row owns its own bottom-border so conditional siblings never cause
// double-borders or missing borders.

function PrefRow({
  label,
  description,
  control,
  sub,
}: {
  label: string;
  description?: string;
  control: React.ReactNode;
  /** True for indented sub-rows that appear beneath a parent toggle */
  sub?: boolean;
}) {
  return (
    <div
      className={[
        "flex min-h-14 items-center justify-between gap-4 border-b border-divider px-5 py-3.5",
        sub ? "bg-black/2.5 pl-10 dark:bg-white/2.5" : "",
      ].join(" ")}
    >
      <div className="min-w-0 flex-1 space-y-0.5">
        <p
          className={[
            "font-medium text-foreground",
            sub ? "text-[13px]" : "text-sm",
          ].join(" ")}
        >
          {label}
        </p>
        {description && (
          <p className={["leading-relaxed text-muted", sub ? "text-[11px]" : "text-xs"].join(" ")}>
            {description}
          </p>
        )}
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}

// ─── Animated sub-row wrapper ─────────────────────────────────────────────────
// Expands / collapses with a CSS grid trick so height animates from 0 → auto
// without JavaScript measurements. The wrapper is always in the DOM so
// surrounding borders are never affected by its presence.

function SubRowWrapper({
  open,
  children,
}: {
  open: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateRows: open ? "1fr" : "0fr",
        transition: "grid-template-rows 0.22s ease",
      }}
    >
      {/* overflow-hidden is required for the grid height trick */}
      <div style={{ overflow: "hidden" }}>{children}</div>
    </div>
  );
}

// ─── Study-time picker ────────────────────────────────────────────────────────
// Three native <select> elements (hour, minute, AM/PM) styled to match
// the design system. No invisible overlay tricks.

const selectCls =
  "cursor-pointer rounded-lg bg-primary/10 py-1.5 text-sm font-semibold " +
  "text-primary border-0 focus:outline-none focus:ring-2 focus:ring-primary/30 " +
  "transition hover:bg-primary/20 px-2";

function StudyTimePicker({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}) {
  const parts = value.split(":");
  const h24 = parseInt(parts[0] ?? "20", 10);
  const m = parseInt(parts[1] ?? "0", 10);

  const isPM = h24 >= 12;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;

  const setHour = (newH12: number) => {
    const newH24 = isPM
      ? newH12 === 12 ? 12 : newH12 + 12
      : newH12 === 12 ? 0 : newH12;
    onChange(`${String(newH24).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  };

  const setMinute = (newM: number) => {
    onChange(`${String(h24).padStart(2, "0")}:${String(newM).padStart(2, "0")}`);
  };

  const setAmPm = (ampm: "AM" | "PM") => {
    const newH24 =
      ampm === "AM"
        ? h12 === 12 ? 0 : h12
        : h12 === 12 ? 12 : h12 + 12;
    onChange(`${String(newH24).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  };

  return (
    <div className="flex items-center gap-1.5">
      {/* Hour */}
      <select
        value={h12}
        onChange={(e) => setHour(Number(e.target.value))}
        disabled={disabled}
        aria-label="Hour"
        className={selectCls}
      >
        {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((h) => (
          <option key={h} value={h}>{h}</option>
        ))}
      </select>

      <span className="text-sm font-bold text-primary select-none">:</span>

      {/* Minute */}
      <select
        value={m}
        onChange={(e) => setMinute(Number(e.target.value))}
        disabled={disabled}
        aria-label="Minute"
        className={selectCls}
      >
        {[0, 15, 30, 45].map((min) => (
          <option key={min} value={min}>{String(min).padStart(2, "0")}</option>
        ))}
      </select>

      {/* AM / PM */}
      <select
        value={isPM ? "PM" : "AM"}
        onChange={(e) => setAmPm(e.target.value as "AM" | "PM")}
        disabled={disabled}
        aria-label="AM or PM"
        className={selectCls}
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PrefRowSkeleton() {
  return (
    <div className="flex min-h-14 animate-pulse items-center justify-between gap-4 border-b border-divider px-5 py-3.5">
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-40 rounded-full bg-overlay-hover-mid" />
        <div className="h-2.5 w-56 rounded-full bg-overlay-hover-mid opacity-60" />
      </div>
      <div className="h-7 w-12.5 rounded-full bg-overlay-hover-mid" />
    </div>
  );
}

// ─── Notification permission banner ──────────────────────────────────────────
// Rendered OUTSIDE the rows container so it never interferes with borders.

function NotificationBanner({
  permission,
  onRequest,
  isLoading,
}: {
  permission: string;
  onRequest: () => void;
  isLoading: boolean;
}) {
  if (permission === "granted" || permission === "unsupported") return null;

  if (permission === "denied") {
    return (
      <div className="mb-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3">
        <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
          Notifications are blocked by your browser. Update your site permissions
          in browser settings to enable streak and exam alerts.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-2 flex items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
      <p className="flex-1 text-xs font-medium text-muted">
        Enable browser notifications for streak alerts and exam countdowns.
      </p>
      <button
        type="button"
        onClick={onRequest}
        disabled={isLoading}
        className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary/90 disabled:opacity-60"
      >
        {isLoading ? "Enabling…" : "Enable"}
      </button>
    </div>
  );
}

// ─── PreferencesCard ──────────────────────────────────────────────────────────

export function PreferencesCard() {
  const { preferences, isLoading, error, updatePreference } = usePreferences();
  const {
    permission,
    isLoading: fcmLoading,
    requestPermissionAndRegister,
    sendLocalNotification,
  } = useFCM();
  const { notify } = useNotification();

  useEffect(() => {
    if (error) notify(error, "error");
  }, [error, notify]);

  const handleToggle = async (key: keyof typeof preferences, value: boolean) => {
    await updatePreference(key, value as never);

    // Browser permission is only needed for streak / exam push notifications.
    // Daily reminders are email-based.
    if (
      value &&
      (key === "streak_protection" || key === "exam_countdown_alerts") &&
      permission !== "granted"
    ) {
      await requestPermissionAndRegister();
    }

    if (value && permission === "granted") {
      const previews: Partial<Record<keyof typeof preferences, { title: string; body: string }>> = {
        streak_protection: {
          title: "Streak Protection",
          body: "Your study streak is at risk — we'll remind you in time.",
        },
        streak_risk_notifications: {
          title: "Streak Risk Notifications",
          body: "We'll alert you when your streak is about to break.",
        },
        exam_countdown_alerts: {
          title: "Exam Countdown Alerts",
          body: "Your exam is in 3 days. Keep reviewing!",
        },
      };
      const msg = previews[key];
      if (msg) sendLocalNotification(msg.title, msg.body);
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="px-1 text-xs font-semibold uppercase tracking-widest text-muted">
        Preferences
      </h3>

      {/* Banner sits above the card — never inside the bordered rows container */}
      <NotificationBanner
        permission={permission}
        onRequest={requestPermissionAndRegister}
        isLoading={fcmLoading}
      />

      {/*
        No divide-y on this container — each PrefRow owns its own border-b.
        The last <div> child (always "Exam Countdown Alerts") loses its
        border via [&>div:last-child]:border-b-0.
        SubRowWrapper divs are always in the DOM but expand to 0 height when
        their parent toggle is off, so they never affect surrounding borders.
      */}
      <div className="glass overflow-hidden rounded-2xl [&>div:last-child]:border-b-0">
        {isLoading ? (
          <>
            <PrefRowSkeleton />
            <PrefRowSkeleton />
            <PrefRowSkeleton />
            <PrefRowSkeleton />
          </>
        ) : (
          <>
            {/* ── Daily Study Reminders ──────────────────────────────── */}
            <PrefRow
              label="Daily Study Reminders"
              description="Get a daily email with a motivational quote and a link to your study session"
              control={
                <PreferenceToggle
                  checked={preferences.daily_study_reminders}
                  onChange={(v) => handleToggle("daily_study_reminders", v)}
                />
              }
            />

            {/* Sub-row: preferred send time (animated reveal) */}
            <SubRowWrapper open={preferences.daily_study_reminders}>
              <PrefRow
                sub
                label="Preferred Send Time"
                description="We'll email you at this time every day"
                control={
                  <StudyTimePicker
                    value={preferences.preferred_study_time}
                    onChange={(v) => updatePreference("preferred_study_time", v)}
                  />
                }
              />
            </SubRowWrapper>

            {/* ── Streak Protection ──────────────────────────────────── */}
            <PrefRow
              label="Streak Protection"
              description="Get notified before your streak is at risk"
              control={
                <PreferenceToggle
                  checked={preferences.streak_protection}
                  onChange={(v) => handleToggle("streak_protection", v)}
                />
              }
            />

            {/* Sub-row: streak risk notifications (animated reveal) */}
            <SubRowWrapper open={preferences.streak_protection}>
              <PrefRow
                sub
                label="Streak Risk Notifications"
                description="Alert when no activity detected and streak may break"
                control={
                  <PreferenceToggle
                    checked={preferences.streak_risk_notifications}
                    onChange={(v) => handleToggle("streak_risk_notifications", v)}
                  />
                }
              />
            </SubRowWrapper>

            {/* ── Show Mastery Progress ──────────────────────────────── */}
            <PrefRow
              label="Show Mastery Progress"
              description="Display mastery % on flashcard decks"
              control={
                <PreferenceToggle
                  checked={preferences.show_mastery_progress}
                  onChange={(v) => handleToggle("show_mastery_progress", v)}
                />
              }
            />

            {/* ── Exam Countdown Alerts ──────────────────────────────── */}
            <PrefRow
              label="Exam Countdown Alerts"
              description="Reminders 3 days, 1 day before — and on exam day"
              control={
                <PreferenceToggle
                  checked={preferences.exam_countdown_alerts}
                  onChange={(v) => handleToggle("exam_countdown_alerts", v)}
                />
              }
            />
          </>
        )}
      </div>
    </div>
  );
}


