/* ─── Stat Bar (horizontal comparison) ─── */
export const StatBar = ({ label, home, away, unit = "" }: { label: string; home: number; away: number; unit?: string }) => {
  const total = home + away || 1;
  const homePct = (home / total) * 100;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-semibold text-foreground">{home}{unit}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground">{away}{unit}</span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden gap-0.5">
        <div className="rounded-full transition-all duration-700" style={{ width: `${homePct}%`, background: "hsl(var(--primary))" }} />
        <div className="rounded-full flex-1 transition-all duration-700" style={{ background: "hsl(220, 20%, 45%)" }} />
      </div>
    </div>
  );
};
