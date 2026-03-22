import { Timer } from "lucide-react";

interface MatchProps {
  league: string;
  time: string;
  live?: boolean;
  teamA: string;
  teamB: string;
  scoreA?: number;
  scoreB?: number;
  odds: [number, number, number];
}

const MatchCard = ({ league, time, live, teamA, teamB, scoreA, scoreB, odds }: MatchProps) => {
  return (
    <div className="match-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground font-medium">{league}</span>
        <div className="flex items-center gap-1.5">
          {live && (
            <span className="flex items-center gap-1 text-xs font-semibold text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              AO VIVO
            </span>
          )}
          <span className="text-xs text-muted-foreground">{time}</span>
        </div>
      </div>

      {/* Teams */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">{teamA}</span>
          {scoreA !== undefined && (
            <span className="text-sm font-bold text-foreground">{scoreA}</span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">{teamB}</span>
          {scoreB !== undefined && (
            <span className="text-sm font-bold text-foreground">{scoreB}</span>
          )}
        </div>
      </div>

      {/* Odds */}
      <div className="grid grid-cols-3 gap-2">
        {(["1", "X", "2"] as const).map((label, i) => (
          <button key={label} className="odds-btn">
            <span className="text-[10px] uppercase tracking-wider">{label}</span>
            <span className="odds-value">{odds[i].toFixed(2)}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MatchCard;
