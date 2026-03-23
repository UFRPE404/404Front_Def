import { X, TrendingUp, Percent, Info } from "lucide-react";
import { SuggestedBet } from "@/data/matches";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useBetSlip } from "@/contexts/BetSlipContext";

interface BetDetailModalProps {
  bet: (SuggestedBet & { theme?: "dream" | "best" }) | null;
  isOpen: boolean;
  onClose: () => void;
}

const BetDetailModal = ({ bet, isOpen, onClose }: BetDetailModalProps) => {
  const { addSelection, isSelected } = useBetSlip();

  if (!bet) return null;

  const isAdded = isSelected(`${bet.matchId}-${bet.pick}`);
  const actualProbability = bet.probability || Math.round((1 / bet.odds) * 100);

  const handleAddBet = (e: React.MouseEvent) => {
    e.stopPropagation();
    addSelection({
      id: `${bet.matchId}-${bet.pick}`,
      league: bet.league,
      teamA: bet.teamA,
      teamB: bet.teamB,
      pick: bet.pick,
      odds: bet.odds,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] uppercase font-bold tracking-wider text-primary px-2 py-1 bg-primary/15 rounded">
                {bet.theme === "dream" ? "💰 Para Sonhar" : "⭐ Melhores"}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-foreground">{bet.league}</h2>
          </div>

          {/* Confronto */}
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Times</p>
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: "hsl(var(--surface-elevated))" }}>
                <span className="font-semibold text-foreground">{bet.teamA}</span>
                <span className="text-xs text-muted-foreground">vs</span>
                <span className="font-semibold text-foreground">{bet.teamB}</span>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Sua Aposta</p>
              <div className="p-3 rounded-lg border border-primary/50 bg-primary/5">
                <p className="font-bold text-primary text-lg">{bet.pick}</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg" style={{ background: "hsl(var(--surface-elevated))" }}>
              <div className="flex items-center gap-1.5 mb-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Odd</p>
              </div>
              <p className="text-2xl font-bold text-primary">{bet.odds.toFixed(2)}</p>
            </div>

            <div className="p-3 rounded-lg" style={{ background: "hsl(var(--surface-elevated))" }}>
              <div className="flex items-center gap-1.5 mb-2">
                <Percent className="w-4 h-4 text-primary" />
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Chance</p>
              </div>
              <p className="text-2xl font-bold text-foreground">{actualProbability}%</p>
            </div>
          </div>

          {/* Explicação sobre Odds e Probabilidade */}
          <div className="space-y-3 p-4 rounded-lg border border-border/50" style={{ background: "hsl(var(--surface-elevated))" }}>
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-foreground">Como funciona</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    <span className="font-semibold text-foreground">Odd {bet.odds.toFixed(2)}</span> significa que se você apostar R$ 100, pode ganhar R$ {(100 * bet.odds).toFixed(0)} ao total (incluindo a aposta).
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">Chance {actualProbability}%</span> é a probabilidade estimada desta aposta acontecer, baseada na odd oferecida.
                  </p>
                  <p className="text-xs pt-2 border-t border-border/30">
                    Quanto maior a odd, menor a probabilidade, mas maior o ganho potencial. Apostas com odds altas são mais arriscadas!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Insights */}
          <div className="space-y-2 p-3 rounded-lg" style={{ background: "hsl(var(--surface-elevated))" }}>
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Análise</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>✓ Aposta com base em análise técnica</li>
              <li>✓ Odd competitiva no mercado</li>
              <li>✓ Recomendada para sua estratégia</li>
            </ul>
          </div>

          {/* Action Button */}
          <Button
            onClick={handleAddBet}
            variant={isAdded ? "outline" : "hero"}
            className="w-full text-base font-semibold"
          >
            {isAdded ? "✓ Adicionado ao Bilhete" : "Adicionar ao Bilhete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BetDetailModal;
