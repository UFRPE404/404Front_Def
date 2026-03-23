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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column - Informações da Aposta */}
          <div className="space-y-4">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-primary px-2 py-1 bg-primary/15 rounded">
                  {bet.theme === "dream" ? "💰 Para Sonhar" : "⭐ Melhores"}
                </span>
              </div>
              <h2 className="text-xl font-bold text-foreground">{bet.league}</h2>
            </div>

            {/* Confronto */}
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-2">Times</p>
              <div className="flex flex-col gap-1.5">
                <div className="p-2.5 rounded-lg font-semibold text-foreground" style={{ background: "hsl(var(--surface-elevated))" }}>
                  {bet.teamA}
                </div>
                <div className="text-center text-xs text-muted-foreground font-medium">vs</div>
                <div className="p-2.5 rounded-lg font-semibold text-foreground" style={{ background: "hsl(var(--surface-elevated))" }}>
                  {bet.teamB}
                </div>
              </div>
            </div>

            {/* Pick */}
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-2">Sua Aposta</p>
              <div className="p-3 rounded-lg border border-primary/50 bg-primary/5">
                <p className="font-bold text-primary text-base">{bet.pick}</p>
              </div>
            </div>

            {/* Stats: Odd e Probabilidade */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-lg" style={{ background: "hsl(var(--surface-elevated))" }}>
                <div className="flex items-center gap-1 mb-2">
                  <TrendingUp className="w-3.5 h-3.5 text-primary" />
                  <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Odd</p>
                </div>
                <p className="text-2xl font-bold text-primary">{bet.odds.toFixed(2)}</p>
              </div>

              <div className="p-3 rounded-lg" style={{ background: "hsl(var(--surface-elevated))" }}>
                <div className="flex items-center gap-1 mb-2">
                  <Percent className="w-3.5 h-3.5 text-primary" />
                  <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Chance</p>
                </div>
                <p className="text-2xl font-bold text-foreground">{actualProbability}%</p>
              </div>
            </div>
          </div>

          {/* Right Column - Explicação */}
          <div className="space-y-4">
            {/* Título */}
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground text-sm mb-3">Entenda melhor</h3>
              </div>
            </div>

            {/* Explicação sobre Odds */}
            <div className="p-3 rounded-lg border border-border/50" style={{ background: "hsl(var(--surface-elevated))" }}>
              <p className="text-[11px] uppercase font-bold text-primary tracking-wider mb-2">Como funciona a Odd</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Se você apostar <span className="font-semibold text-foreground">R$ 100</span>, o retorno total será de <span className="font-semibold text-primary">R$ {(100 * bet.odds).toFixed(0)}</span>, incluindo sua aposta.
              </p>
            </div>

            {/* Explicação sobre Probabilidade */}
            <div className="p-3 rounded-lg border border-border/50" style={{ background: "hsl(var(--surface-elevated))" }}>
              <p className="text-[11px] uppercase font-bold text-primary tracking-wider mb-2">Probabilidade</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">{actualProbability}%</span> é a chance estimada desta aposta acertar, conforme a odd oferecida.
              </p>
            </div>

            {/* Aviso sobre Risco */}
            <div className="p-3 rounded-lg border border-yellow-500/30 bg-yellow-500/5">
              <p className="text-[11px] uppercase font-bold text-yellow-600 dark:text-yellow-400 tracking-wider mb-2">⚠️ Risco</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Quanto maior a odd, menor a probabilidade. Apostas com odds altas são <span className="font-semibold">mais arriscadas</span>.
              </p>
            </div>

            {/* Dica */}
            <div className="p-3 rounded-lg" style={{ background: "hsl(var(--surface-elevated))" }}>
              <p className="text-[11px] uppercase font-bold text-primary tracking-wider mb-2">💡 Dica</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Combine apostas com diferentes odds para melhorar suas chances. Bilhetes com odds altas precisam de mais eventos certos.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button - Full Width */}
        <div className="pt-4 border-t" style={{ borderColor: "hsl(var(--border))" }}>
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
