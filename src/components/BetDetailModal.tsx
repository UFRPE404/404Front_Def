import { X, TrendingUp, Percent, Info, AlertCircle } from "lucide-react";
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
  const riskLevel = bet.odds > 3 ? "Alto" : bet.odds > 2 ? "Médio" : "Baixo";
  const riskColor = bet.odds > 3 ? "#ff6b6b" : bet.odds > 2 ? "#ffd93d" : "#51cf66";

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

  // Determinar razões para a aposta baseado em odd e tema
  const getReasons = () => {
    const reasons = [];
    
    if (bet.theme === "dream") {
      reasons.push("Odd alta com grande potencial de retorno");
      reasons.push("Evento com baixa probabilidade de ocorrer");
    } else {
      reasons.push("Equilíbrio entre probabilidade e retorno");
      reasons.push("Odd competitiva conforme análise de mercado");
    }
    
    if (bet.odds > 2) {
      reasons.push("Bom valor para seu risco");
    }
    
    // Adicionar razão específica baseado na liga
    const leagueKeywords = bet.league.toLowerCase();
    if (leagueKeywords.includes("champions") || leagueKeywords.includes("premier")) {
      reasons.push("Liga de alto nível com maior previsibilidade");
    }
    
    return reasons.slice(0, 3);
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

          {/* Right Column - Estatísticas e Explicação */}
          <div className="space-y-4">
            {/* Estatísticas Visuais */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-foreground">Análise Visual</h3>

              {/* Barra de Probabilidade */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground font-medium">Probabilidade de Acerto</p>
                  <p className="text-xs font-bold text-foreground">{actualProbability}%</p>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "hsl(var(--border))" }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${actualProbability}%`, background: "#51cf66" }}
                  />
                </div>
              </div>

              {/* Retorno Potencial */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground font-medium">Retorno em R$ 100</p>
                  <p className="text-xs font-bold text-primary">+R$ {((bet.odds - 1) * 100).toFixed(0)}</p>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "hsl(var(--border))" }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: Math.min((bet.odds / 10) * 100, 100) + "%",
                      background: "#ffd93d"
                    }}
                  />
                </div>
              </div>

              {/* Nível de Risco */}
              <div className="space-y-1.5 p-2.5 rounded-lg border border-border/50" style={{ background: "hsl(var(--surface-elevated))" }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">Nível de Risco</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ color: riskColor, background: `${riskColor}15` }}>
                    {riskLevel}
                  </span>
                </div>
              </div>
            </div>

            {/* Por que essa aposta? */}
            <div className="space-y-2 p-3 rounded-lg border border-border/50" style={{ background: "hsl(var(--surface-elevated))" }}>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-primary shrink-0" />
                <p className="text-[10px] uppercase font-bold text-primary tracking-wider">Por que essa aposta?</p>
              </div>
              <ul className="space-y-1.5">
                {getReasons().map((reason, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-primary font-bold mt-0.5">→</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Market Context */}
            <div className="p-3 rounded-lg" style={{ background: "hsl(var(--surface-elevated))" }}>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-2">💭 Contexto</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Esta aposta combina uma {riskLevel.toLowerCase()} chance de acerto com um retorno {bet.odds > 2.5 ? "considerável" : "equilibrado"}. {
                  bet.odds > 3 
                    ? "Ideal para apostadores que buscam maior potencial de ganho com risco elevado."
                    : bet.odds > 1.5
                    ? "Recomendada para montar bilhetes combinados com outras apostas."
                    : "Segura para consolidar seus ganhos."
                }
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
