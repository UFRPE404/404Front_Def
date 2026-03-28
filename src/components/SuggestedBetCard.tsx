import { Plus, Clock } from "lucide-react";
import { useState } from "react";
import { useBetSlip } from "@/contexts/BetSlipContext";
import { SuggestedBet } from "@/data/matches";
import { Button } from "@/components/ui/button";
import BetDetailModal from "./BetDetailModal";

function formatMatchTime(matchDate: string): string {
  const [datePart, timePart] = matchDate.split(", ");
  if (!datePart || !timePart) return matchDate;
  const [day, month, year] = datePart.split("/").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const isToday =
    today.getDate() === day && today.getMonth() + 1 === month && today.getFullYear() === year;
  const isTomorrow =
    tomorrow.getDate() === day && tomorrow.getMonth() + 1 === month && tomorrow.getFullYear() === year;
  const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  if (isToday) return `Hoje às ${time}h`;
  if (isTomorrow) return `Amanhã às ${time}h`;
  return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")} às ${time}h`;
}

interface SuggestedBetCardProps extends SuggestedBet {
  theme?: "dream" | "best";
}

const confidenceColors: Record<string, { bg: string; text: string }> = {
  alta: { bg: "bg-green-500/15", text: "text-green-500" },
  media: { bg: "bg-yellow-500/15", text: "text-yellow-500" },
  baixa: { bg: "bg-red-500/15", text: "text-red-500" },
};

const formColors: Record<string, string> = {
  W: "bg-green-500",
  D: "bg-yellow-500",
  L: "bg-red-500",
};

const SuggestedBetCard = ({
  id, teamA, teamB, league, pick, odds, probability, confidence,
  reasoning, matchId, type, matchDate, homeContext, awayContext, theme = "best",
}: SuggestedBetCardProps) => {
  const { addSelection, isSelected } = useBetSlip();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isAdded = isSelected(`${matchId}-${pick}`);

  const handleAddBet = (e: React.MouseEvent) => {
    e.stopPropagation();
    addSelection({
      id: `${matchId}-${pick}`,
      league,
      teamA,
      teamB,
      pick,
      odds,
    });
  };

  const actualProbability = probability || Math.round((1 / odds) * 100);
  const confStyle = confidence ? confidenceColors[confidence] : null;

  const betData = {
    id, teamA, teamB, league, pick, odds, probability: actualProbability,
    confidence, reasoning, matchId, type, matchDate, homeContext, awayContext, theme,
  };

  // Mini form dots (5 últimos jogos)
  const homeForm = homeContext?.recentResults?.slice(0, 5) ?? [];
  const awayForm = awayContext?.recentResults?.slice(0, 5) ?? [];

  return (
    <>
      <div
        className="rounded-xl p-4 border transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer group h-full flex flex-col"
        style={{
          background: "hsl(var(--card))",
          borderColor: "hsl(var(--border))",
        }}
        onClick={() => setIsModalOpen(true)}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[11px] uppercase font-bold tracking-wider text-primary mb-0.5">
              {theme === "dream" ? "Para Sonhar" : "Melhores"}
            </p>
            <p className="text-xs text-muted-foreground">{league}</p>
            {matchDate && (
              <div className="flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <p className="text-[11px] text-muted-foreground">{formatMatchTime(matchDate)}</p>
              </div>
            )}
          </div>
          {confStyle && confidence && (
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${confStyle.bg} ${confStyle.text}`}>
              {confidence}
            </span>
          )}
        </div>

        {/* Times com forma */}
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">{teamA}</span>
            {homeForm.length > 0 && (
              <div className="flex gap-0.5">
                {homeForm.map((r, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full ${formColors[r] || "bg-muted"}`} />
                ))}
              </div>
            )}
          </div>
          <div className="text-xs text-muted-foreground px-2 py-0.5 bg-secondary rounded w-fit">vs</div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">{teamB}</span>
            {awayForm.length > 0 && (
              <div className="flex gap-0.5">
                {awayForm.map((r, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full ${formColors[r] || "bg-muted"}`} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pick */}
        <div className="mb-3 p-2.5 rounded-lg" style={{ background: "hsl(var(--surface-elevated))" }}>
          <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Aposta</div>
          <p className="text-sm font-semibold text-primary">{pick}</p>
        </div>

        {/* Reasoning preview */}
        <div className="flex-1">
          {reasoning && (
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{reasoning}</p>
          )}
        </div>

        {/* Odds + Probabilidade */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="p-2 rounded-lg border" style={{ borderColor: "hsl(var(--border))" }}>
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Odd</p>
            <p className="text-xl font-bold text-primary">{odds.toFixed(2)}</p>
          </div>
          <div className="p-2 rounded-lg border" style={{ borderColor: "hsl(var(--border))" }}>
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Chance</p>
            <p className="text-xl font-bold text-foreground">{actualProbability}%</p>
          </div>
        </div>

        {/* Botão */}
        <Button
          onClick={handleAddBet}
          variant={isAdded ? "outline" : "hero"}
          size="sm"
          className="w-full text-sm font-semibold"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          {isAdded ? "Adicionado" : "Adicionar ao Bilhete"}
        </Button>
      </div>

      <BetDetailModal bet={betData} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default SuggestedBetCard;
