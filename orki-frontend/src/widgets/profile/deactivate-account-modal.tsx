"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import { useNotification } from "@/providers/notification-provider";
import { deactivateAccount } from "@/shared/api/profile";
import { signOutFirebase } from "@/shared/firebase/auth";
import { routes } from "@/shared/config/routes";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function DeactivateAccountModal({ open, onClose }: Props) {
  const { setUser } = useAuth();
  const { notify } = useNotification();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleDeactivate = async () => {
    setLoading(true);
    try {
      await deactivateAccount();
      await signOutFirebase().catch(() => {});
      setUser(null);
      notify("Your account has been deactivated. Sign in again to reactivate.", "success");
      router.replace(routes.login);
    } catch {
      notify("Failed to deactivate account. Please try again.", "error");
      setLoading(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="deactivate-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative glass w-full max-w-sm rounded-2xl p-5 md:p-6 shadow-2xl">
        {/* Icon */}
        <div className="mb-4 flex justify-center">
          <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-amber-500/10">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              className="text-amber-500"
              aria-hidden="true"
            >
              <path
                d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <h2
          id="deactivate-modal-title"
          className="mb-2 text-center font-heading text-base md:text-lg font-bold text-foreground"
        >
          Deactivate Account
        </h2>
        <p className="mb-6 text-center text-sm text-muted">
          Are you sure you want to deactivate your account?
          <br />
          You can reactivate it later by signing in again.
        </p>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleDeactivate}
            disabled={loading}
            className="w-full rounded-xl bg-amber-500 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Deactivating…" : "Deactivate"}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-full rounded-xl bg-overlay-hover py-2.5 text-sm font-semibold text-foreground transition hover:bg-overlay-hover-mid"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
