const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = [1.5, 2.0, 1.0, 2.5, 3.0, 1.5, 0.5];
const MAX_HOURS = Math.max(...HOURS);
const TODAY_IDX = 4; // Friday

export function DailyProgressWidget() {
  const totalWeek = HOURS.reduce((a, b) => a + b, 0).toFixed(1);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-foreground">Weekly Study Hours</h2>
        <span className="text-sm font-semibold text-primary">{totalWeek}h this week</span>
      </div>

      <div className="glass rounded-2xl p-3 md:p-5">
        <div className="flex items-end justify-between gap-2" style={{ height: 100 }}>
          {DAYS.map((day, i) => {
            const heightPct = (HOURS[i] / MAX_HOURS) * 100;
            const isToday = i === TODAY_IDX;

            return (
              <div key={day} className="group flex flex-1 flex-col items-center gap-2">
                {/* Tooltip */}
                <div className="mb-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="rounded-lg bg-foreground px-1.5 py-0.5 text-[10px] font-medium text-white">
                    {HOURS[i]}h
                  </span>
                </div>

                <div className="relative flex w-full items-end justify-center" style={{ height: 72 }}>
                  <div
                    className="w-full max-w-[28px] rounded-t-lg transition-all duration-500"
                    style={{
                      height: `${heightPct}%`,
                      background: isToday
                        ? "linear-gradient(to top, #2FA2E2, #60C3F0)"
                        : "rgba(47,162,226,0.18)",
                      boxShadow: isToday ? "0 4px 12px rgba(47,162,226,0.35)" : "none",
                    }}
                  />
                </div>

                <span
                  className="text-[11px] font-medium"
                  style={{ color: isToday ? "#2FA2E2" : "#94A3B8" }}
                >
                  {day}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
