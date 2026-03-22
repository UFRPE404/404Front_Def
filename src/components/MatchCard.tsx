import { TrendingUp, AlertTriangle, Target, Shield } from "lucide-react";
import { useBetSlip } from "@/contexts/BetSlipContext";

interface InsightData {
  goalChance: number;
  cardChance: number;
  penaltyChance: number;
}

interface MatchProps {
  league: string;
  time: string;
  live?: boolean;
  teamA: string;
  teamB: string;
  scoreA?: number;
  scoreB?: number;
  odds: [number, number, number];
  insights?: InsightData;
}

const InsightBar = ({ value, color }: { value: number; color: string }) => (
  <div className="insight-bar flex-1">
    <div className="insight-bar-fill" style={{ width: `${value}%`, background: `hsl(var(${color}))` }} />
  </div>
);

const MatchCard = ({ league, time, live, teamA, teamB, scoreA, scoreB, odds, insights }: MatchProps) => {
  const { addSelection, isSelected } = useBetSlip();
  const matchId = `${teamA}-${teamB}`;

  const handleOddsClick = (pick: string, oddValue: number) => {
    addSelection({
      id: `${matchId}-${pick}`,
      league,
      teamA,
      teamB,
      pick,
      odds: oddValue,
    });
  };

  // Generate deterministic insights if not provided
  const matchInsights = insights || {
    goalChance: Math.round(((odds[0] * 17 + odds[1] * 13) % 60) + 30),
    cardChance: Math.round(((odds[1] * 23 + odds[2] * 11) % 50) + 20),
    penaltyChance: Math.round(((odds[2] * 19 + odds[0] * 7) % 25) + 5),
  };

  // Determine predicted winner
  const minOdd = Math.min(...odds);
  const favIndex = odds.indexOf(minOdd);
  const favLabel = favIndex === 0 ? teamA : favIndex === 2 ? teamB : "Empate";
  const winProb = Math.round((1 / minOdd) * 100);

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
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">{teamA}</span>
          {scoreA !== undefined && <span className="text-sm font-bold text-foreground">{scoreA}</span>}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">{teamB}</span>
          {scoreB !== undefined && <span className="text-sm font-bold text-foreground">{scoreB}</span>}
        </div>
      </div>

      {/* Analysis Insights */}
      <div className="mb-3 p-2.5 rounded-lg space-y-2" style={{ background: "hsl(var(--surface-elevated))" }}>
        <div className="flex items-center gap-1.5 mb-1.5">
          <TrendingUp className="w-3 h-3 text-primary" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">Análise</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 w-16 shrink-0">
            <Target className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Gol</span>
          </div>
          <InsightBar value={matchInsights.goalChance} color="--insight-positive" />
          <span className="text-[10px] font-bold text-foreground w-8 text-right">{matchInsights.goalChance}%</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 w-16 shrink-0">
            <AlertTriangle className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Cartão</span>
          </div>
          <InsightBar value={matchInsights.cardChance} color="--insight-warning" />
          <span className="text-[10px] font-bold text-foreground w-8 text-right">{matchInsights.cardChance}%</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 w-16 shrink-0">
            <Shield className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Pênalti</span>
          </div>
          <InsightBar value={matchInsights.penaltyChance} color="--insight-danger" />
          <span className="text-[10px] font-bold text-foreground w-8 text-right">{matchInsights.penaltyChance}%</span>
        </div>

        <div className="flex items-center justify-between pt-1 border-t" style={{ borderColor: "hsl(var(--border))" }}>
          <span className="text-[10px] text-muted-foreground">Favorito</span>
          <span className="text-[10px] font-bold text-primary">{favLabel} ({winProb}%)</span>
        </div>
      </div>
    </div>
  );
};

export default MatchCard;
