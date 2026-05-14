"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

// ─── Types ──────────────────────────────────────────────────────────────────

export type NotificationType = "success" | "error" | "info";

interface NotificationItem {
  id: string;
  type: NotificationType;
  message: string;
}

interface NotificationContextValue {
  notify: (message: string, type?: NotificationType) => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function useNotification(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return ctx;
}

// ─── Individual Toast ─────────────────────────────────────────────────────────

function NotificationToast({
  item,
  onDismiss,
}: {
  item: NotificationItem;
  onDismiss: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Small delay so the entrance transition is visible
    const entranceId = setTimeout(() => setVisible(true), 16);

    // Auto-dismiss after 3.5 s
    timerRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 350);
    }, 3500);

    return () => {
      clearTimeout(entranceId);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [onDismiss]);

  const handleManualDismiss = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
    setTimeout(onDismiss, 350);
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center gap-3 rounded-2xl px-5 py-4 shadow-2xl shadow-slate-900/12 ring-1 backdrop-blur-xl transition-all duration-300 ease-out ${
        visible ? "translate-y-0 opacity-100 scale-100" : "-translate-y-2 opacity-0 scale-95"
      }`}
      style={{
        background: "var(--toast-bg)",
        borderColor: "var(--toast-border)",
        border: "1px solid var(--toast-border)",
      }}
    >
      {/* Icon */}
      {item.type === "success" && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path
              d="M2.5 7l3 3 6-6"
              stroke="#10B981"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}

      {item.type === "error" && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path
              d="M3.5 3.5l7 7M10.5 3.5l-7 7"
              stroke="#EF4444"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}

      {item.type === "info" && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-100">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="5.5" stroke="#2FA2E2" strokeWidth="1.5" />
            <path d="M7 6.5v3.5M7 4.5v.5" stroke="#2FA2E2" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </div>
      )}

      {/* Message */}
      <p className="text-sm font-medium text-foreground">{item.message}</p>

      {/* Dismiss button */}
      <button
        type="button"
        onClick={handleManualDismiss}
        className="ml-1 rounded-lg p-1 text-muted/50 transition-colors duration-150 hover:bg-overlay-hover-mid hover:text-muted"
        aria-label="Dismiss notification"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path
            d="M2.5 2.5l7 7M9.5 2.5l-7 7"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const notify = useCallback((message: string, type: NotificationType = "info") => {
    const id = Math.random().toString(36).slice(2, 9);
    setNotifications((prev) => [...prev, { id, type, message }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      {mounted &&
        createPortal(
          <div
            aria-label="Notifications"
            className="pointer-events-none fixed right-6 top-6 z-9999 flex flex-col gap-2.5"
          >
            {notifications.map((item) => (
              <div key={item.id} className="pointer-events-auto">
                <NotificationToast item={item} onDismiss={() => dismiss(item.id)} />
              </div>
            ))}
          </div>,
          document.body,
        )}
    </NotificationContext.Provider>
  );
}
