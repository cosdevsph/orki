"use client";

type ExitConfirmationModalProps = {
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Confirmation overlay shown when the user attempts to leave an active exam.
 * "Yes, leave" triggers auto-save + pause before navigation.
 * "No, continue" dismisses the modal.
 */
export function ExitConfirmationModal({
  onConfirm,
  onCancel,
}: ExitConfirmationModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative glass rounded-2xl p-8 max-w-sm w-full mx-4 space-y-5 shadow-xl">
        {/* Icon */}
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
          <svg
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            className="text-amber-600"
          >
            <path
              d="M11 8.25v4.583M11 14.667v.916"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <path
              d="M9.135 3.482 1.918 16.5A2.063 2.063 0 0 0 3.783 19.5h14.434a2.063 2.063 0 0 0 1.865-3L12.865 3.482a2.063 2.063 0 0 0-3.73 0Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="space-y-1.5">
          <h3 className="font-heading text-xl font-bold text-foreground">
            Leave Exam?
          </h3>
          <p className="text-sm text-muted leading-relaxed">
            Are you sure you want to leave? Your progress will be saved and you
            can resume this exam later.
          </p>
        </div>

        <div className="flex flex-col gap-2.5 pt-1">
          <button
            type="button"
            onClick={onConfirm}
            className="w-full rounded-xl bg-foreground px-5 py-3 text-sm font-bold text-background transition-all hover:opacity-90"
          >
            Yes, save &amp; leave
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full rounded-xl border border-border/70 bg-card-bg px-5 py-3 text-sm font-semibold text-foreground transition-all hover:bg-surface"
          >
            No, continue exam
          </button>
        </div>
      </div>
    </div>
  );
}
