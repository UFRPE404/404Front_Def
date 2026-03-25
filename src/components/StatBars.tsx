/* ─── Professional Stat Bar — Sofascore/Flashscore inspired ─── */

/** Full-width comparison bar: value A | label | value B with dual-sided fill */
export const StatBar = ({ label, home, away, unit = "" }: { label: string; home: number; away: number; unit?: string }) => {
  const total = home + away || 1;
  const homePct = (home / total) * 100;
  const awayPct = (away / total) * 100;
  const homeWins = home > away;
  const awayWins = away > home;
  const tied = home === away;

  return (
    <div className="py-2">
      {/* Values + Label */}
      <div className="flex items-center justify-between mb-1.5">
        <span className={`text-sm tabular-nums font-bold w-16 text-left transition-colors ${
          homeWins ? "text-primary" : "text-foreground/70"
        }`}>
          {home}{unit}
        </span>
        <span className="text-[11px] text-muted-foreground font-medium text-center flex-1 uppercase tracking-wider">
          {label}
        </span>
        <span className={`text-sm tabular-nums font-bold w-16 text-right transition-colors ${
          awayWins ? "text-primary" : "text-foreground/70"
        }`}>
          {away}{unit}
        </span>
      </div>

      {/* Dual bar */}
      <div className="flex gap-1 items-center h-[6px]">
        {/* Home bar — fills from right to left */}
        <div className="flex-1 h-full rounded-full overflow-hidden bg-muted/30 flex justify-end">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${homePct}%`,
              background: homeWins || tied
                ? "hsl(var(--primary))"
                : "hsl(var(--muted-foreground) / 0.3)",
            }}
          />
        </div>
        {/* Away bar — fills from left to right */}
        <div className="flex-1 h-full rounded-full overflow-hidden bg-muted/30">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${awayPct}%`,
              background: awayWins || tied
                ? "hsl(var(--primary))"
                : "hsl(var(--muted-foreground) / 0.3)",
            }}
          />
        </div>
      </div>
    </div>
  );
};

/** Compact single-line stat for use in tight spaces */
export const StatBarCompact = ({ label, home, away, unit = "" }: { label: string; home: number; away: number; unit?: string }) => {
  const total = home + away || 1;
  const homePct = (home / total) * 100;
  const homeWins = home > away;
  const awayWins = away > home;

  return (
    <div className="flex items-center gap-3 py-1">
      <span className={`text-xs tabular-nums font-semibold w-10 text-right ${homeWins ? "text-primary" : "text-foreground/60"}`}>
        {home}{unit}
      </span>
      <div className="flex-1 relative">
        <div className="flex h-1 rounded-full overflow-hidden bg-muted/20 gap-px">
          <div className="h-full rounded-full transition-all duration-500" style={{
            width: `${homePct}%`,
            background: homeWins ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.25)",
          }} />
          <div className="h-full rounded-full flex-1 transition-all duration-500" style={{
            background: awayWins ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.25)",
          }} />
        </div>
        <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] text-muted-foreground/60 font-medium uppercase tracking-wider whitespace-nowrap">
          {label}
        </span>
      </div>
      <span className={`text-xs tabular-nums font-semibold w-10 text-left ${awayWins ? "text-primary" : "text-foreground/60"}`}>
        {away}{unit}
      </span>
    </div>
  );
};
