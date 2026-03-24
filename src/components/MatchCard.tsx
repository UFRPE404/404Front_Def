import { TrendingUp } from "lucide-react";
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
  <div className="flex items-center gap-2">
    <div className="flex items-center gap-0.5 w-16 shrink-0">
      <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
    </div>
    <InsightBar value={percentage} color={color} />
    <div className="flex flex-col items-end gap-1 pl-2 min-w-12">
      <span className="text-[10px] font-semibold text-foreground leading-tight">{prediction}</span>
      <span className="text-[9px] text-muted-foreground leading-tight">{percentage}%</span>
    </div>
  </div>
);

const INSIGHT_COLORS = ["--insight-positive", "--insight-warning", "--insight-info"];

const MatchCard = ({ id, league, time, live, teamA, teamB, scoreA, scoreB, odds, sport }: MatchProps) => {
  const navigate = useNavigate();

  const matchAnalysis = generateMatchAnalysis(time, scoreA, scoreB, odds, sport, live);

  const handleCardClick = () => {
    navigate(`/analises/${encodeURIComponent(id)}`);
  };

  return (
    <div className="match-card group cursor-pointer" onClick={handleCardClick}>
      {/* Always visible content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] text-muted-foreground font-medium truncate max-w-[55%]">{league}</span>
          <div className="flex items-center gap-2">
            {live && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-primary">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                AO VIVO
              </span>
            )}
            <span className="text-[11px] text-muted-foreground font-medium">{time}</span>
          </div>
        </div>

        {/* Teams — fixed height so live and future cards match */}
        <div className="space-y-2 mb-2.5">
          <div className="flex items-center justify-between h-6">
            <span className="text-[13px] font-bold text-foreground">{teamA}</span>
            {scoreA !== undefined && (
              <span className="text-[15px] font-extrabold text-foreground tabular-nums">{scoreA}</span>
            )}
          </div>
          <div className="flex items-center justify-between h-6">
            <span className="text-[13px] font-bold text-foreground">{teamB}</span>
            {scoreB !== undefined && (
              <span className="text-[15px] font-extrabold text-foreground tabular-nums">{scoreB}</span>
            )}
          </div>
        </div>

        {/* Analysis Insights — always visible */}
        <div className="p-2 rounded-md space-y-1.5" style={{ background: "hsl(var(--surface-elevated))" }}>
          <div className="flex items-center gap-1.5 mb-0.5">
            <TrendingUp className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">Análise</span>
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
      </div>

      {/* Win probability — slides up on hover, always visible on touch */}
      <div className="match-card-stats">
        <div className="p-2 rounded-md" style={{ background: "hsl(var(--surface-elevated))" }}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-foreground truncate max-w-[35%]">{teamA}</span>
            <span className="text-[9px] text-muted-foreground font-medium">Prob. Vitória</span>
            <span className="text-[10px] font-bold text-foreground truncate max-w-[35%] text-right">{teamB}</span>
          </div>
          <div className="flex h-2 rounded-full overflow-hidden gap-px">
            <div
              className="rounded-l-full transition-all duration-500"
              style={{ width: `${matchAnalysis.winProb.teamA}%`, background: "hsl(var(--insight-positive))" }}
            />
            {matchAnalysis.winProb.draw > 3 && (
              <div
                className="transition-all duration-500"
                style={{ width: `${matchAnalysis.winProb.draw}%`, background: "hsl(var(--muted-foreground) / 0.4)" }}
              />
            )}
            <div
              className="rounded-r-full transition-all duration-500"
              style={{ width: `${matchAnalysis.winProb.teamB}%`, background: "hsl(var(--insight-warning))" }}
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] font-bold" style={{ color: "hsl(var(--insight-positive))" }}>
              {matchAnalysis.winProb.teamA}%
            </span>
            {matchAnalysis.winProb.draw > 3 && (
              <span className="text-[9px] text-muted-foreground">{matchAnalysis.winProb.draw}% X</span>
            )}
            <span className="text-[10px] font-bold" style={{ color: "hsl(var(--insight-warning))" }}>
              {matchAnalysis.winProb.teamB}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchCard;
