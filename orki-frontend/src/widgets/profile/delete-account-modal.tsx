"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import { useNotification } from "@/providers/notification-provider";
import { deleteAccount } from "@/shared/api/profile";
import { signOutFirebase } from "@/shared/firebase/auth";
import { routes } from "@/shared/config/routes";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function DeleteAccountModal({ open, onClose }: Props) {
  const { user, setUser } = useAuth();
  const { notify } = useNotification();
  const router = useRouter();
  const [confirmInput, setConfirmInput] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const isConfirmed = confirmInput.trim() === user?.email;

  const handleDelete = async () => {
    if (!isConfirmed) return;
    setLoading(true);
    try {
      await deleteAccount();
      await signOutFirebase().catch(() => {});
      setUser(null);
      notify("Your account has been permanently deleted.", "success");
      router.replace(routes.login);
    } catch {
      notify("Failed to delete account. Please try again.", "error");
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setConfirmInput("");
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative glass w-full max-w-sm rounded-2xl p-5 md:p-6 shadow-2xl">
        {/* Icon */}
        <div className="mb-4 flex justify-center">
          <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-red-500/10">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              className="text-red-500"
              aria-hidden="true"
            >
              <polyline
                points="3 6 5 6 21 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10 11v6M14 11v6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <h2
          id="delete-modal-title"
          className="mb-2 text-center font-heading text-base md:text-lg font-bold text-foreground"
        >
          Delete Account
        </h2>
        <p className="mb-4 text-center text-sm text-muted">
          Deleting your account is{" "}
          <strong className="font-semibold text-foreground">permanent</strong> and cannot be
          undone. All your data, progress, and payment history will be erased.
        </p>

        {/* Email confirmation */}
        <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/5 p-3">
          <p className="mb-1.5 text-xs font-medium text-red-600 dark:text-red-400">
            Type your email address to confirm:
          </p>
          <p className="mb-2 select-all font-mono text-xs text-muted">{user?.email}</p>
          <input
            type="email"
            value={confirmInput}
            onChange={(e) => setConfirmInput(e.target.value)}
            placeholder="Enter your email"
            autoComplete="off"
            className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-red-400 focus:outline-none transition"
          />
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleDelete}
            disabled={!isConfirmed || loading}
            className="w-full rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "Deleting…" : "Permanently Delete"}
          </button>
          <button
            type="button"
            onClick={handleClose}
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
