type DeckCardProps = {
  name: string;
  cardCount: number;
  dueCount: number;
  lastStudied: string;
  color: string;
  onStudy: () => void;
};

export function DeckCard({ name, cardCount, dueCount, lastStudied, color, onStudy }: DeckCardProps) {
  const masteryPct = Math.round(((cardCount - dueCount) / cardCount) * 100);

  return (
    <div className="glass card-hover group flex flex-col gap-4 rounded-2xl p-5">
      {/* Icon + title */}
      <div className="flex items-start justify-between">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-md"
          style={{ backgroundColor: color }}
        >
          {name.charAt(0)}
        </div>
        {dueCount > 0 && (
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
            {dueCount} due
          </span>
        )}
      </div>

      <div className="space-y-0.5">
        <h3 className="font-heading text-base font-bold text-foreground">{name}</h3>
        <p className="text-xs text-muted">{cardCount} cards · Last studied {lastStudied}</p>
      </div>

      {/* Mastery bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-muted">Mastery</span>
          <span className="text-[11px] font-semibold" style={{ color }}>{masteryPct}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${masteryPct}%`, backgroundColor: color }}
          />
        </div>
      </div>

      {/* Study button */}
      <button
        type="button"
        onClick={onStudy}
        className="w-full rounded-xl py-2 text-sm font-semibold transition-all duration-150 hover:scale-[1.02]"
        style={{
          backgroundColor: `${color}18`,
          color,
        }}
      >
        Study Now →
      </button>
    </div>
  );
}
