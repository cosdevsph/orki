"use client";

import Image from "next/image";
import { useState } from "react";
import { createPortal } from "react-dom";

import { useNotification } from "@/providers/notification-provider";
import { saveUserAvatar } from "@/shared/firebase/avatar";

const AVATARS = [
  { src: "/avatars/avatar-1.webp", label: "Avatar 1" },
  { src: "/avatars/avatar-2.webp", label: "Avatar 2" },
  { src: "/avatars/avatar-3.webp", label: "Avatar 3" },
  { src: "/avatars/avatar-4.webp", label: "Avatar 4" },
];

type Props = {
  open: boolean;
  uid: string;
  currentAvatar: string;
  onClose: () => void;
  onSave: (avatar: string) => void;
};

export function AvatarSelectorModal({ open, uid, currentAvatar, onClose, onSave }: Props) {
  const { notify } = useNotification();
  const [selected, setSelected] = useState(currentAvatar);
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleSave = async () => {
    if (selected === currentAvatar) {
      onClose();
      return;
    }
    setSaving(true);
    try {
      await saveUserAvatar(uid, selected);
      onSave(selected);
      notify("Avatar updated.", "success");
      onClose();
    } catch {
      notify("Failed to save avatar. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="avatar-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative glass w-full max-w-sm rounded-2xl p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2
              id="avatar-modal-title"
              className="font-heading text-lg font-bold text-foreground"
            >
              Choose Avatar
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              Select your profile picture
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-overlay-hover text-muted transition hover:bg-overlay-hover-mid"
            aria-label="Close"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path
                d="M1 1l10 10M11 1L1 11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Avatar grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {AVATARS.map((av) => {
            const isSelected = selected === av.src;
            return (
              <button
                key={av.src}
                type="button"
                onClick={() => setSelected(av.src)}
                aria-pressed={isSelected}
                className={[
                  "relative flex items-center justify-center rounded-2xl border-2 p-3 transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                    : "border-border hover:border-primary/40 hover:bg-overlay-hover",
                ].join(" ")}
              >
                <div className="flex h-22 w-22 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                  <Image
                    src={av.src}
                    alt={av.label}
                    width={82}
                    height={82}
                    className="rounded-lg object-cover drop-shadow-sm"
                  />
                </div>
                {isSelected && (
                  <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                      <path
                        d="M2 5l2.5 2.5L8 3"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-border py-2.5 text-sm font-semibold text-muted transition hover:bg-overlay-hover"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
