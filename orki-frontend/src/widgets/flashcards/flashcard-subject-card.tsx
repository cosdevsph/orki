"use client";

type FlashcardSubjectCardProps = {
  name: string;
  color: string;
  cardCount: number;
  onStudy: () => void;
  loading?: boolean;
  /** When true, the CTA shows "Resume Progress →" instead of "Study Now →". */
  hasProgress?: boolean;
};

const SUBJECT_ICONS: Record<string, string> = {
  English: "📝",
  Filipino: "🇵🇭",
  Mathematics: "📐",
  Science: "🔬",
  "Social Science": "🌐",
  "Verbal Ability": "💬",
  "Numerical Ability": "🔢",
  "Analytical Ability": "🧩",
  "General Information": "📚",
  "Abnormal Psychology": "🧠",
  "Developmental Psychology": "🌱",
  "Industrial Psychology": "🏢",
  "Psychological Assessment": "📋",
  "Criminal Law": "⚖️",
  Criminology: "🔍",
  "Forensic Science": "🧪",
  "Law Enforcement": "🛡️",
};

export function FlashcardSubjectCard({
  name,
  color,
  cardCount,
  onStudy,
  loading = false,
  hasProgress = false,
}: FlashcardSubjectCardProps) {
  const icon = SUBJECT_ICONS[name] ?? name.charAt(0);
  const isEmoji = SUBJECT_ICONS[name] !== undefined;

  return (
    <div className="glass card-hover group flex flex-col gap-4 rounded-2xl p-5 transition-all duration-200">
      {/* Icon + card count badge */}
      <div className="flex items-start justify-between">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-md"
          style={{ backgroundColor: color }}
        >
          {isEmoji ? (
            <span className="text-2xl leading-none">{icon}</span>
          ) : (
            <span className="text-xl font-bold text-white">{icon}</span>
          )}
        </div>
        <span
          className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
          style={{ backgroundColor: `${color}18`, color }}
        >
          {cardCount} cards
        </span>
      </div>

      {/* Title */}
      <div className="space-y-0.5">
        <h3 className="font-heading text-base font-bold text-foreground">{name}</h3>
        <p className="text-xs text-muted">Flashcard study deck</p>
      </div>

      {/* Accent bar */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-track">
        <div
          className="h-full w-full rounded-full opacity-40"
          style={{ backgroundColor: color }}
        />
      </div>

      {/* Study button */}
      <button
        type="button"
        onClick={onStudy}
        disabled={loading}
        className="w-full rounded-xl py-2.5 text-sm font-semibold transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        style={{
          backgroundColor: `${color}18`,
          color,
        }}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span
              className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-t-transparent"
              style={{ borderColor: `${color}40`, borderTopColor: "transparent" }}
            />
            Loading…
          </span>
        ) : hasProgress ? (
          "Resume Progress →"
        ) : (
          "Study Now →"
        )}
      </button>
    </div>
  );
}
