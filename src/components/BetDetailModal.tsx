import { TrendingUp, Percent, AlertCircle, Calendar, BarChart3 } from "lucide-react";
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
  if (isToday) return `Hoje às ${time}h`;
  if (isTomorrow) return `Amanhã às ${time}h`;
  return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")} às ${time}h`;
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        {/* === ROW 1: Header — badges + liga + confronto === */}
        <div className="px-6 pt-6 pb-4 border-b" style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--surface-elevated))" }}>
          <div className="flex items-center justify-between mb-3">
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
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border/50" style={{ background: "hsl(var(--card))" }}>
                <Calendar className="w-3 h-3 text-primary" />
                <span className="text-[11px] font-semibold text-primary">
                  {formatMatchDate(bet.matchDate)}
                </span>
              </div>
            )}
          </div>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">{bet.league}</p>
          <div className="flex items-center justify-center gap-4 py-1">
            <span className="text-xl font-bold text-foreground">{bet.teamA}</span>
            <span className="text-sm font-bold text-primary px-3 py-1 rounded-full bg-primary/10">VS</span>
            <span className="text-xl font-bold text-foreground">{bet.teamB}</span>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">

        {/* === ROW 2: Aposta Sugerida | Análise IA === */}
        <div className="grid grid-cols-5 gap-3">
          <div className="col-span-2 p-3 rounded-lg border border-primary/50 bg-primary/5 flex flex-col justify-center">
            <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Aposta sugerida</div>
            <p className="font-bold text-primary text-sm">{bet.pick}</p>
          </div>
          <div className="col-span-3 p-3 rounded-lg border border-primary/30 bg-primary/5">
            <div className="flex items-center gap-1.5 mb-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-primary shrink-0" />
              <p className="text-[10px] uppercase font-bold text-primary tracking-wider">Análise</p>
            </div>
            <p className="text-xs text-foreground leading-relaxed">
              {bet.reasoning || "Análise indisponível."}
            </p>
          </div>
        </div>

        {/* === ROW 3: ODD | Chance | Risco + Retorno === */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 rounded-lg" style={{ background: "hsl(var(--surface-elevated))" }}>
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
              <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Odd</p>
            </div>
            <p className="text-2xl font-bold text-primary">{bet.odds.toFixed(2)}</p>
          </div>
          <div className="p-3 rounded-lg" style={{ background: "hsl(var(--surface-elevated))" }}>
            <div className="flex items-center gap-1 mb-1">
              <Percent className="w-3.5 h-3.5 text-primary" />
              <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Chance</p>
            </div>
            <p className="text-2xl font-bold text-foreground">{actualProbability}%</p>
          </div>
          <div className="p-3 rounded-lg flex flex-col justify-between" style={{ background: "hsl(var(--surface-elevated))" }}>
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Risco</p>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ color: riskColor, background: `${riskColor}15` }}>{riskLevel}</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden mt-2" style={{ background: "hsl(var(--border))" }}>
                <div className="h-full rounded-full" style={{ width: Math.min((bet.odds / 10) * 100, 100) + "%", background: "#ffd93d" }} />
              </div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-[9px] text-muted-foreground">Retorno R$100</p>
              <p className="text-xs font-bold text-primary">+R$ {((bet.odds - 1) * 100).toFixed(0)}</p>
            </div>
          </div>
        </div>

        {/* === ROW 4: H2H Time 1 | H2H Time 2 === */}
        {hasContext && (
          <div className="grid grid-cols-2 gap-3">
            <TeamStats ctx={bet.homeContext!} label="Casa" />
            <TeamStats ctx={bet.awayContext!} label="Fora" />
          </div>
        )}

        {/* === ROW 5: Gráfico Comparativo === */}
        {hasContext && (
          <div className="p-3 rounded-lg border border-border/50" style={{ background: "hsl(var(--surface-elevated))" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-primary" />
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Comparativo</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: "#22c55e" }} />
                  <span className="text-[9px] text-muted-foreground font-medium">{bet.homeContext!.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: "#3b82f6" }} />
                  <span className="text-[9px] text-muted-foreground font-medium">{bet.awayContext!.name}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Win%", home: bet.homeContext!.winRate, away: bet.awayContext!.winRate, max: 100 },
                { label: "Gols", home: bet.homeContext!.avgGoalsScored, away: bet.awayContext!.avgGoalsScored, max: Math.max(bet.homeContext!.avgGoalsScored, bet.awayContext!.avgGoalsScored, 1) },
                { label: "Sofridos", home: bet.homeContext!.avgGoalsConceded, away: bet.awayContext!.avgGoalsConceded, max: Math.max(bet.homeContext!.avgGoalsConceded, bet.awayContext!.avgGoalsConceded, 1) },
                { label: "CS", home: bet.homeContext!.cleanSheets, away: bet.awayContext!.cleanSheets, max: Math.max(bet.homeContext!.cleanSheets, bet.awayContext!.cleanSheets, 1) },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col items-center gap-1">
                  <div className="flex items-end gap-1 h-12">
                    <div className="w-4 rounded-t-sm transition-all" style={{ height: `${Math.max((stat.home / stat.max) * 100, 10)}%`, background: "#22c55e" }} />
                    <div className="w-4 rounded-t-sm transition-all" style={{ height: `${Math.max((stat.away / stat.max) * 100, 10)}%`, background: "#3b82f6" }} />
                  </div>
                  <p className="text-[9px] text-muted-foreground font-bold">{stat.label}</p>
                  <p className="text-[9px] text-foreground font-semibold">{stat.home} / {stat.away}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        </div>

        {/* === Botão === */}
        <div className="px-6 pb-6">
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
