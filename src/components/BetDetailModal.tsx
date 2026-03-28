import { TrendingUp, Percent, AlertCircle, Shield, Swords, Calendar, BarChart3 } from "lucide-react";
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

function formatMatchDate(matchDate: string): string {
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
  if (isToday) return `Jogo hoje às ${time}h`;
  if (isTomorrow) return `Jogo amanhã às ${time}h`;
  return `Jogo ${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")} às ${time}h`;
}

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
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
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
          {bet.matchDate && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: "hsl(var(--surface-elevated))" }}>
              <Calendar className="w-3 h-3 text-primary" />
              <span className="text-[11px] font-semibold text-primary">
                {formatMatchDate(bet.matchDate)}
              </span>
            </div>
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

            {/* Retorno + Risco */}
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

            {/* Mini gráfico comparativo */}
            {hasContext && (
              <div className="p-2.5 rounded-lg border border-border/50" style={{ background: "hsl(var(--surface-elevated))" }}>
                <div className="flex items-center gap-1.5 mb-2">
                  <BarChart3 className="w-3 h-3 text-primary" />
                  <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Comparativo</p>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { label: "Win%", home: bet.homeContext!.winRate, away: bet.awayContext!.winRate, max: 100 },
                    { label: "Gols", home: bet.homeContext!.avgGoalsScored, away: bet.awayContext!.avgGoalsScored, max: Math.max(bet.homeContext!.avgGoalsScored, bet.awayContext!.avgGoalsScored, 1) },
                    { label: "Sofr.", home: bet.homeContext!.avgGoalsConceded, away: bet.awayContext!.avgGoalsConceded, max: Math.max(bet.homeContext!.avgGoalsConceded, bet.awayContext!.avgGoalsConceded, 1) },
                    { label: "CS", home: bet.homeContext!.cleanSheets, away: bet.awayContext!.cleanSheets, max: Math.max(bet.homeContext!.cleanSheets, bet.awayContext!.cleanSheets, 1) },
                  ].map((stat) => (
                    <div key={stat.label} className="flex flex-col items-center gap-1">
                      <div className="flex items-end gap-0.5 h-10">
                        <div className="w-3 rounded-t-sm" style={{ height: `${Math.max((stat.home / stat.max) * 100, 8)}%`, background: "#22c55e" }} />
                        <div className="w-3 rounded-t-sm" style={{ height: `${Math.max((stat.away / stat.max) * 100, 8)}%`, background: "#3b82f6" }} />
                      </div>
                      <p className="text-[8px] text-muted-foreground font-bold leading-none">{stat.label}</p>
                      <p className="text-[8px] text-muted-foreground leading-none">{stat.home} / {stat.away}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-3 mt-2">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#22c55e" }} />
                    <span className="text-[8px] text-muted-foreground">{bet.homeContext!.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#3b82f6" }} />
                    <span className="text-[8px] text-muted-foreground">{bet.awayContext!.name}</span>
                  </div>
                </div>
              </div>
            )}
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
