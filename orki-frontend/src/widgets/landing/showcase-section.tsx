const examChoices = ["Troponin I", "CK-MB", "AST", "LDH"];
const chartBars = [42, 58, 50, 74, 68, 82, 94];

export function ShowcaseSection() {
  return (
    <section id="showcase" className="bg-section-alt py-28 overflow-hidden transition-colors duration-300">
      <div className="mx-auto w-full max-w-6xl px-6 grid grid-cols-2 gap-20 items-center">
        {/* ── Left column: copy ── */}
        <div className="flex flex-col gap-8">
          <span className="inline-flex items-center gap-2 self-start rounded-full border border-primary/25 bg-primary/8 px-4 py-1.5 text-sm font-medium text-primary">
            The Study Experience
          </span>

          <div className="flex flex-col gap-5">
            <h2 className="font-heading text-5xl font-bold text-foreground leading-tight">
              Built for focused,{" "}
              <span className="bg-linear-to-r from-[var(--heading-from)] to-[var(--heading-to)] bg-clip-text text-transparent">
                motivated learners.
              </span>
            </h2>
            <p className="text-lg text-secondary leading-relaxed">
              Orki combines the best study science with beautiful design — giving you a calm,
              organized environment to prepare for what matters most.
            </p>
          </div>

          {/* Bullet points */}
          <div className="flex flex-col gap-4">
            {[
              {
                icon: "🎯",
                title: "Adaptive mock exams",
                body: "Questions that calibrate to your knowledge level in real time.",
              },
              {
                icon: "🃏",
                title: "Spaced repetition flashcards",
                body: "Science-backed review intervals that lock content into long-term memory.",
              },
              {
                icon: "📊",
                title: "Progress analytics",
                body: "Instant visibility into your strongest and weakest subject areas.",
              },
            ].map(({ icon, title, body }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-card-bg border border-border flex items-center justify-center text-lg shrink-0 shadow-sm">
                  {icon}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-[15px]">{title}</p>
                  <p className="text-sm text-secondary mt-0.5 leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right column: app mockup ── */}
        <div className="relative">
          {/* Floating analytics panel */}
          <div className="absolute -top-5 -right-5 z-20 w-48 rounded-2xl bg-card-bg border border-border shadow-xl p-4">
            <p className="text-xs font-semibold text-foreground mb-3">Weekly Progress</p>
            <div className="flex items-end gap-1 h-14">
              {chartBars.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm"
                  style={{
                    height: `${(h / 100) * 56}px`,
                    background: i === chartBars.length - 1 ? "#10B981" : "#2FA2E2",
                    opacity: i === chartBars.length - 1 ? 1 : 0.28 + i * 0.1,
                  }}
                />
              ))}
            </div>
            <p className="text-[10px] text-success mt-2 font-semibold">↑ 14% from last week</p>
          </div>

          {/* Floating flashcard panel */}
          <div className="absolute -bottom-5 -left-5 z-20 w-52 rounded-2xl bg-card-bg border border-border shadow-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-primary uppercase tracking-wide">
                Flashcard
              </span>
              <span className="text-[11px] text-muted">1 / 24</span>
            </div>
            <p className="text-sm font-medium text-foreground leading-snug">
              Normal saline osmolarity?
            </p>
            <div className="mt-3 rounded-xl bg-success/10 p-2.5 text-xs font-bold text-success text-center">
              308 mOsm/L ✓
            </div>
          </div>

          {/* Main browser window */}
          <div className="relative z-10 rounded-3xl border border-border bg-card-bg shadow-2xl overflow-hidden">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-surface">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="rounded-full bg-card-bg border border-border px-5 py-1 text-[11px] text-muted">
                  app.orki.study
                </div>
              </div>
            </div>

            {/* App UI */}
            <div className="p-5 bg-surface space-y-4">
              {/* Mini top nav */}
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-primary text-sm">Orki</span>
                <div className="flex gap-1.5">
                  {["Exam", "Flashcards", "Analytics"].map((tab, i) => (
                    <span
                      key={tab}
                      className={`text-[11px] px-3 py-1.5 rounded-lg font-medium ${
                        i === 0 ? "bg-primary text-white" : "bg-card-bg border border-border text-muted"
                      }`}
                    >
                      {tab}
                    </span>
                  ))}
                </div>
              </div>

              {/* Exam card */}
              <div className="rounded-2xl bg-card-bg border border-border/50 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-medium text-muted">Question 23 of 50</span>
                  <span className="text-[11px] font-semibold text-primary">23:45 remaining</span>
                </div>
                <p className="text-sm font-medium text-foreground leading-relaxed mb-4">
                  Which cardiac enzyme is most specific for myocardial infarction and remains
                  elevated the longest after an acute event?
                </p>
                <div className="space-y-2">
                  {examChoices.map((choice, i) => (
                    <div
                      key={choice}
                      className={`flex items-center gap-3 rounded-xl p-3 text-xs font-medium ${
                        i === 0
                          ? "bg-primary text-white"
                          : "bg-surface text-muted border border-border/50"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          i === 0
                            ? "border-white/40 bg-white/20 text-white"
                            : "border-border text-muted"
                        }`}
                      >
                        {["A", "B", "C", "D"][i]}
                      </div>
                      {choice}
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress bar */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-track">
                  <div
                    className="h-2 rounded-full bg-linear-to-r from-[var(--heading-from)] to-[var(--heading-to)]"
                    style={{ width: "46%" }}
                  />
                </div>
                <span className="text-[11px] text-muted font-medium shrink-0">46% complete</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
