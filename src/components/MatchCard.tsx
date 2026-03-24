import { TrendingUp } from "lucide-react";
import { useBetSlip } from "@/contexts/BetSlipContext";
import { useNavigate } from "react-router-dom";
import { generateMatchAnalysis } from "@/utils/matchAnalysis";

interface MatchProps {
  id: string;
  league: string;
  time: string;
  live?: boolean;
  teamA: string;
  teamB: string;
  scoreA?: number;
  scoreB?: number;
  odds: [number, number, number];
  sport?: string;
}

const InsightBar = ({ value, color }: { value: number; color: string }) => (
  <div className="insight-bar flex-1">
    <div className="insight-bar-fill" style={{ width: `${value}%`, background: `hsl(var(${color}))` }} />
  </div>
);

interface InsightItemProps {
  label: string;
  prediction: string;
  percentage: number;
  color: string;
}

const InsightItem = ({ label, prediction, percentage, color }: InsightItemProps) => (
  <div className="flex items-center gap-1.5">
    <div className="flex items-center gap-0.5 w-16 shrink-0">
      <span className="text-[9px] text-muted-foreground font-medium">{label}</span>
    </div>
    <InsightBar value={percentage} color={color} />
    <div className="flex flex-col items-end gap-0">
      <span className="text-[9px] font-semibold text-foreground leading-none\">{prediction}</span>
      <span className="text-[8px] text-muted-foreground leading-none\">{percentage}%</span>
    </div>
  </div>
);

const INSIGHT_COLORS = ["--insight-positive", "--insight-warning", "--insight-info"];

const MatchCard = ({ id, league, time, live, teamA, teamB, scoreA, scoreB, odds, sport }: MatchProps) => {
  const { addSelection, isSelected } = useBetSlip();
  const navigate = useNavigate();
  const matchId = `${teamA}-${teamB}`;

  // Sport-specific analysis
  const matchAnalysis = generateMatchAnalysis(time, scoreA, scoreB, odds, sport, live);

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

  const handleCardClick = () => {
    navigate(`/analises/${encodeURIComponent(id)}`);
  };

  return (
    <div className="match-card cursor-pointer hover:ring-1 hover:ring-primary/40 transition-all duration-200" onClick={handleCardClick}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] text-muted-foreground font-medium">{league}</span>
        <div className="flex items-center gap-1.5">
          {live && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-primary">
              <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
              AO VIVO
            </span>
          )}
          <span className="text-[11px] text-muted-foreground">{time}</span>
        </div>
      </div>

      {/* Teams */}
      <div className="space-y-1.5 mb-2">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-semibold text-foreground">{teamA}</span>
          {scoreA !== undefined && <span className="text-[12px] font-bold text-foreground">{scoreA}</span>}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-semibold text-foreground">{teamB}</span>
          {scoreB !== undefined && <span className="text-[12px] font-bold text-foreground">{scoreB}</span>}
        </div>
      </div>

      {/* Analysis Insights */}
      <div className="p-1.5 rounded-md space-y-1.5" style={{ background: "hsl(var(--surface-elevated))" }}>
        <div className="flex items-center gap-1 mb-1">
          <TrendingUp className="w-2.5 h-2.5 text-primary" />
          <span className="text-[9px] font-semibold uppercase tracking-wider text-primary">Análise</span>
        </div>

        {matchAnalysis.lines.map((line, i) => (
          <InsightItem
            key={line.label}
            label={line.label}
            prediction={line.prediction}
            percentage={line.percentage}
            color={INSIGHT_COLORS[i]}
          />
        ))}
      </div>

      {/* Win Probability */}
      <div className="mt-1.5 p-1.5 rounded-md" style={{ background: "hsl(var(--surface-elevated))" }}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9px] font-bold text-foreground truncate max-w-[35%]">{teamA}</span>
          <span className="text-[8px] text-muted-foreground font-medium">Prob. vitória</span>
          <span className="text-[9px] font-bold text-foreground truncate max-w-[35%] text-right">{teamB}</span>
        </div>
        {/* Split probability bar */}
        <div className="flex h-2 rounded-full overflow-hidden gap-px">
          <div
            className="rounded-l-full transition-all duration-500"
            style={{
              width: `${matchAnalysis.winProb.teamA}%`,
              background: "hsl(var(--insight-positive))",
            }}
          />
          {matchAnalysis.winProb.draw > 3 && (
            <div
              className="transition-all duration-500"
              style={{
                width: `${matchAnalysis.winProb.draw}%`,
                background: "hsl(var(--muted-foreground) / 0.4)",
              }}
            />
          )}
          <div
            className="rounded-r-full transition-all duration-500"
            style={{
              width: `${matchAnalysis.winProb.teamB}%`,
              background: "hsl(var(--insight-warning))",
            }}
          />
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-[9px] font-bold" style={{ color: "hsl(var(--insight-positive))" }}>
            {matchAnalysis.winProb.teamA}%
          </span>
          {matchAnalysis.winProb.draw > 3 && (
            <span className="text-[8px] text-muted-foreground">{matchAnalysis.winProb.draw}% X</span>
          )}
          <span className="text-[9px] font-bold" style={{ color: "hsl(var(--insight-warning))" }}>
            {matchAnalysis.winProb.teamB}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default MatchCard;
