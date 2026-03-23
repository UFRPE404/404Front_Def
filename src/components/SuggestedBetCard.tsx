import { Plus } from "lucide-react";
import { useState } from "react";
import { useBetSlip } from "@/contexts/BetSlipContext";
import { SuggestedBet } from "@/data/matches";
import { Button } from "@/components/ui/button";
import BetDetailModal from "./BetDetailModal";

interface SuggestedBetCardProps extends SuggestedBet {
  theme?: "dream" | "best";
}

const SuggestedBetCard = ({ id, teamA, teamB, league, pick, odds, probability, matchId, theme = "best" }: SuggestedBetCardProps) => {
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

  const betData = { id, teamA, teamB, league, pick, odds, probability: actualProbability, matchId, theme };

  return (
    <>
      <div
        className="rounded-xl p-4 border transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer group"
        style={{
          background: "hsl(var(--card))",
          borderColor: "hsl(var(--border))",
        }}
        onClick={() => setIsModalOpen(true)}
      >
        {/* Header com tema */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[11px] uppercase font-bold tracking-wider text-primary mb-0.5">
              {theme === "dream" ? "💰 Para Sonhar" : "⭐ Melhores"}
            </p>
            <p className="text-xs text-muted-foreground">{league}</p>
          </div>
        </div>

        {/* Confronto */}
        <div className="space-y-1.5 mb-3">
          <div className="text-sm font-semibold text-foreground">{teamA}</div>
          <div className="text-xs text-muted-foreground px-2 py-1 bg-secondary rounded w-fit">vs</div>
          <div className="text-sm font-semibold text-foreground">{teamB}</div>
        </div>

        {/* Pick */}
        <div className="mb-3 p-2.5 rounded-lg" style={{ background: "hsl(var(--surface-elevated))" }}>
          <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Sua aposta</div>
          <p className="text-sm font-semibold text-primary">{pick}</p>
        </div>

        {/* Stats: Odd e Probabilidade */}
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

        {/* Botão Adicionar */}
        <Button
          onClick={handleAddBet}
          variant={isAdded ? "outline" : "hero"}
          size="sm"
          className="w-full text-sm font-semibold"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          {isAdded ? "Adicionado ✓" : "Adicionar ao Bilhete"}
        </Button>
      </div>

      <BetDetailModal bet={betData} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default SuggestedBetCard;
