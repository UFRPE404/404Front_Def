import { TrendingUp, Percent, AlertCircle, Shield, Swords } from "lucide-react";
import { SuggestedBet, TeamContext } from "@/data/matches";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useBetSlip } from "@/contexts/BetSlipContext";

interface BetDetailModalProps {
  bet: (SuggestedBet & { theme?: "dream" | "best" }) | null;
  isOpen: boolean;
  onClose: () => void;
}

const confidenceLabels: Record<string, { label: string; color: string }> = {
  alta: { label: "Confiança Alta", color: "#51cf66" },
  media: { label: "Confiança Média", color: "#ffd93d" },
  baixa: { label: "Confiança Baixa", color: "#ff6b6b" },
};

const FormBadge = ({ result }: { result: string }) => {
  const colors: Record<string, string> = {
    W: "bg-green-500 text-white",
    D: "bg-yellow-500 text-white",
    L: "bg-red-500 text-white",
  };
  const labels: Record<string, string> = { W: "V", D: "E", L: "D" };
  return (
    <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-[10px] font-bold ${colors[result] || "bg-muted text-muted-foreground"}`}>
      {labels[result] || result}
    </span>
  );
};

const TeamStats = ({ ctx, label }: { ctx: TeamContext; label: string }) => (
  <div className="space-y-2 p-3 rounded-lg border border-border/50" style={{ background: "hsl(var(--surface-elevated))" }}>
    <div className="flex items-center justify-between">
      <p className="text-xs font-bold text-foreground">{ctx.name}</p>
      <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">{label}</span>
    </div>

    {/* Forma recente */}
    {ctx.recentResults.length > 0 && (
      <div className="space-y-1">
        <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Forma recente</p>
        <div className="flex gap-1">
          {ctx.recentResults.slice(0, 5).map((r, i) => (
            <FormBadge key={i} result={r} />
          ))}
        </div>
      </div>
    )}

    {/* Stats grid */}
    <div className="grid grid-cols-2 gap-2 pt-1">
      <div>
        <p className="text-[9px] text-muted-foreground uppercase">Gols/jogo</p>
        <p className="text-sm font-bold text-foreground">{ctx.avgGoalsScored}</p>
      </div>
      <div>
        <p className="text-[9px] text-muted-foreground uppercase">Sofridos/jogo</p>
        <p className="text-sm font-bold text-foreground">{ctx.avgGoalsConceded}</p>
      </div>
      <div>
        <p className="text-[9px] text-muted-foreground uppercase">Win rate</p>
        <p className="text-sm font-bold text-foreground">{ctx.winRate}%</p>
      </div>
      <div>
        <p className="text-[9px] text-muted-foreground uppercase">Clean sheets</p>
        <p className="text-sm font-bold text-foreground">{ctx.cleanSheets}</p>
      </div>
    </div>
  </div>
);

const BetDetailModal = ({ bet, isOpen, onClose }: BetDetailModalProps) => {
  const { addSelection, isSelected } = useBetSlip();

  if (!bet) return null;

  const isAdded = isSelected(`${bet.matchId}-${bet.pick}`);
  const actualProbability = bet.probability || Math.round((1 / bet.odds) * 100);
  const riskLevel = bet.odds > 3 ? "Alto" : bet.odds > 2 ? "Médio" : "Baixo";
  const riskColor = bet.odds > 3 ? "#ff6b6b" : bet.odds > 2 ? "#ffd93d" : "#51cf66";
  const confInfo = bet.confidence ? confidenceLabels[bet.confidence] : null;
  const hasContext = bet.homeContext && bet.awayContext && bet.homeContext.recentResults.length > 0;

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
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-primary px-2 py-1 bg-primary/15 rounded">
            {bet.theme === "dream" ? "Para Sonhar" : "Melhores"}
          </span>
          {confInfo && (
            <span
              className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded"
              style={{ color: confInfo.color, background: `${confInfo.color}15` }}
            >
              {confInfo.label}
            </span>
          )}
        </div>

        <h2 className="text-lg font-bold text-foreground mb-4">{bet.league}</h2>

        <div className="grid grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Confronto */}
            <div className="flex flex-col gap-1.5">
              <div className="p-2.5 rounded-lg font-semibold text-foreground flex items-center gap-2" style={{ background: "hsl(var(--surface-elevated))" }}>
                <Shield className="w-3.5 h-3.5 text-primary" />
                {bet.teamA}
              </div>
              <div className="text-center text-xs text-muted-foreground font-medium">vs</div>
              <div className="p-2.5 rounded-lg font-semibold text-foreground flex items-center gap-2" style={{ background: "hsl(var(--surface-elevated))" }}>
                <Swords className="w-3.5 h-3.5 text-muted-foreground" />
                {bet.teamB}
              </div>
            </div>

            {/* Pick */}
            <div className="p-3 rounded-lg border border-primary/50 bg-primary/5">
              <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Aposta sugerida</div>
              <p className="font-bold text-primary text-base">{bet.pick}</p>
            </div>

            {/* Odds e Probabilidade */}
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

            {/* Barras */}
            <div className="space-y-2">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Retorno em R$ 100</p>
                  <p className="text-xs font-bold text-primary">+R$ {((bet.odds - 1) * 100).toFixed(0)}</p>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--border))" }}>
                  <div className="h-full rounded-full" style={{ width: Math.min((bet.odds / 10) * 100, 100) + "%", background: "#ffd93d" }} />
                </div>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg border border-border/50" style={{ background: "hsl(var(--surface-elevated))" }}>
                <span className="text-xs text-muted-foreground">Risco</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ color: riskColor, background: `${riskColor}15` }}>{riskLevel}</span>
              </div>
            </div>
          </div>

          {/* Right Column - Análise + Contexto */}
          <div className="space-y-4">
            {/* Análise IA */}
            <div className="space-y-2 p-3 rounded-lg border border-primary/30 bg-primary/5">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-primary shrink-0" />
                <p className="text-[10px] uppercase font-bold text-primary tracking-wider">Análise</p>
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                {bet.reasoning || "Análise indisponível."}
              </p>
            </div>

            {/* Contexto dos Times */}
            {hasContext && (
              <>
                <TeamStats ctx={bet.homeContext!} label="Casa" />
                <TeamStats ctx={bet.awayContext!} label="Fora" />
              </>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t" style={{ borderColor: "hsl(var(--border))" }}>
          <Button
            onClick={handleAddBet}
            variant={isAdded ? "outline" : "hero"}
            className="w-full text-base font-semibold"
          >
            {isAdded ? "Adicionado ao Bilhete" : "Adicionar ao Bilhete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BetDetailModal;
