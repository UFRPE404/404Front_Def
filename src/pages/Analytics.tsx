import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BetSlip from "@/components/BetSlip";
import {
  TrendingUp, TrendingDown, Target, Zap, ArrowLeft,
  MapPin, User, Users, Shirt, ArrowRightLeft, Star,
  Circle, Clock, Trophy, Info, Shield, AlertTriangle,
  CheckCircle2, BarChart3, History, LineChart, Swords,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
} from "recharts";
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import type { MatchData } from "@/data/matches";
import { getMatchById, getMatchLineups, getMatchEvents, getFullOddsForMatch, getMatchH2H, getMatchHistoric, getMatchLiveStats, type FullOddsData, type H2HApiData, type MatchHistoricData, type MatchLiveStats } from "@/services/matchesService";
import { getMatchDetails, type Player, type MatchEvent } from "@/data/matchDetails";
import { StatBar } from "@/components/StatBars";
import { FootballStatsView, BasketballStatsView, TennisStatsView, VolleyballStatsView } from "@/components/SportStatsViews";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useBetSlip } from "@/contexts/BetSlipContext";


/* --- Reveal animation --- */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function RevealSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(12px)",
      transition: `opacity 0.4s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.4s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

/* --- Tooltip --- */
interface TooltipPayloadEntry {
  name: string;
  value: number | string;
  color: string;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipPayloadEntry[]; label?: string }) => {
  if (!active || !payload) return null;
  return (
    <div className="rounded-lg border border-border bg-card p-3 text-xs shadow-lg space-y-1">
      <p className="font-semibold text-foreground">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: <span className="font-bold">{p.value}</span></p>
      ))}
    </div>
  );
};

/* --- Event Icon --- */
const EventIcon = ({ type }: { type: MatchEvent["type"] }) => {
  switch (type) {
    case "goal": return <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"><Target className="w-3 h-3 text-primary-foreground" /></div>;
    case "yellow": return <div className="w-4 h-5 rounded-sm" style={{ background: "hsl(48, 96%, 53%)" }} />;
    case "red": return <div className="w-4 h-5 rounded-sm bg-destructive" />;
    case "substitution": return <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />;
    case "var": return <div className="w-5 h-5 rounded bg-blue-500/20 flex items-center justify-center text-[8px] font-bold text-blue-400">VAR</div>;
    default: return <Circle className="w-3 h-3 text-muted-foreground" />;
  }
};

/* --- Player Card --- */
const PlayerCard = ({ player, compact }: { player: Player; compact?: boolean }) => {
  const ratingColor = player.rating >= 8 ? "text-primary" : player.rating >= 7 ? "text-foreground" : "text-muted-foreground";
  if (compact) {
    return (
      <div className="flex items-center gap-2 py-2 px-2 rounded-lg hover:bg-secondary/50 transition-colors">
        <span className="text-xs text-muted-foreground w-5 text-center font-mono tabular-nums">{player.number}</span>
        <span className="text-sm text-foreground flex-1 truncate">{player.name}</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{player.position}</span>
        <span className={`text-xs font-bold ${ratingColor} w-7 text-right tabular-nums`}>{player.rating}</span>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-border/50 p-3 flex items-center gap-3 hover:border-primary/30 transition-all bg-card">
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 bg-primary/10 text-primary">
        {player.number}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground truncate">{player.name}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground shrink-0">{player.position}</span>
        </div>
        <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
          <span>{player.age} anos</span>
          <span>{player.goals}g</span>
          <span>{player.assists}a</span>
          {player.yellowCards > 0 && <span className="text-yellow-400">{player.yellowCards}am</span>}
          {player.redCards > 0 && <span className="text-destructive">{player.redCards}vm</span>}
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className={`text-lg font-bold tabular-nums ${ratingColor}`}>{player.rating}</div>
        <div className="text-[9px] text-muted-foreground tabular-nums">{player.minutesPlayed}'</div>
      </div>
    </div>
  );
};

/* --- Section helpers --- */
const SectionCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-xl border border-border/50 bg-card p-5 ${className}`}>
    {children}
  </div>
);

const SectionTitle = ({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) => (
  <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
    <Icon className="w-4 h-4 text-primary" />
    {children}
  </h2>
);

/* --- OddPopoverButton --- */
function OddPopoverButton({ label, odd, match, onNavigate }: {
  label: string;
  odd: string;
  match: MatchData;
  onNavigate: () => void;
}) {
  const { addSelection, isSelected } = useBetSlip();
  const betId = `pattern-${match.id}-${label}`;
  const selected = isSelected(betId);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 px-2.5 py-1 rounded-full transition-colors"
        >
          <TrendingUp className="w-3 h-3" />
          Ver odd
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" align="end" className="p-0 w-auto border-0 shadow-xl bg-transparent">
        <div className="rounded-xl overflow-hidden border border-amber-500/30 bg-card shadow-lg shadow-black/30 min-w-[200px]">
          {/* Header */}
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-600/20 to-transparent border-b border-amber-500/20">
            <div className="w-5 h-5 rounded bg-amber-500/20 flex items-center justify-center text-[10px] font-black text-amber-400">E</div>
            <span className="text-[11px] font-bold text-foreground">Esportes da Sorte</span>
          </div>
          {/* Body */}
          <div className="px-3 py-2.5 space-y-2.5">
            <p className="text-[10px] text-muted-foreground leading-snug">{label}</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black tabular-nums text-amber-400">{odd}</span>
              <span className="text-[10px] text-muted-foreground font-medium">odds</span>
            </div>
            <button
              onClick={() => addSelection({
                id: betId,
                matchId: match.id,
                league: match.league,
                teamA: match.teamA,
                teamB: match.teamB,
                pick: label,
                odds: parseFloat(odd),
              })}
              className={`w-full flex items-center justify-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors ${
                selected
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
              }`}
            >
              {selected ? <CheckCircle2 className="w-3 h-3" /> : <Star className="w-3 h-3" />}
              {selected ? "Adicionado ao bilhete" : "Adicionar ao bilhete"}
            </button>
            <button
              onClick={onNavigate}
              className="w-full flex items-center justify-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors py-1"
            >
              Ver todas as odds <ArrowRightLeft className="w-3 h-3" />
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* --- Common Stats Generator --- */
function generateCommonStats(match: MatchData) {
  const sport = match.sport || "Futebol";
  const seed = match.odds[0] * 37 + match.odds[1] * 13 + match.odds[2] * 7;
  const r = (off: number, min: number, max: number) => Math.round(((seed * (off + 1) * 23) % (max - min + 1)) + min);
  switch (sport) {
    case "Basquete": {
      const o = (pct: number) => (Math.round((100 / pct) * 1.06 * 100) / 100).toFixed(2);
      const ps = [
        { icon: "B", label: "Mais de 200.5 pontos", record: `${r(1,5,8)}/10`, pct: r(1,50,80) },
        { icon: "R", label: "Mais de 40 rebotes", record: `${r(2,6,9)}/10`, pct: r(2,60,90) },
        { icon: "A", label: "Mais de 22 assistencias", record: `${r(3,5,8)}/10`, pct: r(3,50,80) },
        { icon: "T", label: "Menos de 15 turnovers", record: `${r(4,4,7)}/10`, pct: r(4,40,70) },
        { icon: "Q", label: `${match.teamA} venceu 1o quarto`, record: `${r(5,4,8)}/10`, pct: r(5,40,80) },
        { icon: "Q", label: `${match.teamB} venceu 1o quarto`, record: `${r(6,3,7)}/10`, pct: r(6,30,70) },
        { icon: "M", label: "Margem > 10 pts", record: `${r(7,3,6)}/10`, pct: r(7,30,60) },
        { icon: "F", label: "FG% acima de 45%", record: `${r(8,5,8)}/10`, pct: r(8,50,80) },
      ];
      return ps.map(p => ({ ...p, odd: o(p.pct) }));
    }
    case "Tenis": {
      const o = (pct: number) => (Math.round((100 / pct) * 1.06 * 100) / 100).toFixed(2);
      const ps = [
        { icon: "G", label: "Mais de 20.5 games", record: `${r(1,6,9)}/10`, pct: r(1,60,90) },
        { icon: "A", label: "Mais de 8 aces", record: `${r(2,4,7)}/10`, pct: r(2,40,70) },
        { icon: "S", label: `${match.teamA} venceu 1o set`, record: `${r(3,5,9)}/10`, pct: r(3,50,90) },
        { icon: "S", label: `${match.teamB} venceu 1o set`, record: `${r(4,4,7)}/10`, pct: r(4,40,70) },
        { icon: "T", label: "Tie-break em algum set", record: `${r(5,3,6)}/10`, pct: r(5,30,60) },
        { icon: "1", label: "1o saque acima de 65%", record: `${r(6,5,8)}/10`, pct: r(6,50,80) },
        { icon: "B", label: "Quebra de saque no 1o set", record: `${r(7,5,8)}/10`, pct: r(7,50,80) },
        { icon: "D", label: "Partida com mais de 2h", record: `${r(8,4,7)}/10`, pct: r(8,40,70) },
      ];
      return ps.map(p => ({ ...p, odd: o(p.pct) }));
    }
    case "Volei": {
      const o = (pct: number) => (Math.round((100 / pct) * 1.06 * 100) / 100).toFixed(2);
      const ps = [
        { icon: "S", label: "Mais de 3.5 sets", record: `${r(1,4,7)}/10`, pct: r(1,40,70) },
        { icon: "A", label: "Mais de 5 aces", record: `${r(2,4,8)}/10`, pct: r(2,40,80) },
        { icon: "1", label: `${match.teamA} venceu 1o set`, record: `${r(3,5,8)}/10`, pct: r(3,50,80) },
        { icon: "1", label: `${match.teamB} venceu 1o set`, record: `${r(4,4,7)}/10`, pct: r(4,40,70) },
        { icon: "P", label: "Mais de 180 pts totais", record: `${r(5,5,8)}/10`, pct: r(5,50,80) },
        { icon: "B", label: "Mais de 10 bloqueios", record: `${r(6,4,7)}/10`, pct: r(6,40,70) },
        { icon: "E", label: "Eficiencia de ataque > 45%", record: `${r(7,5,8)}/10`, pct: r(7,50,80) },
        { icon: "X", label: "Menos de 20 erros", record: `${r(8,3,6)}/10`, pct: r(8,30,60) },
      ];
      return ps.map(p => ({ ...p, odd: o(p.pct) }));
    }
    default: {
      const o = (pct: number) => (Math.round((100 / pct) * 1.06 * 100) / 100).toFixed(2);
      const ps = [
        { icon: "G", label: "Mais de 2.5 gols", record: `${r(1,4,8)}/10`, pct: r(1,40,80) },
        { icon: "G", label: "Ambas marcaram", record: `${r(2,5,8)}/10`, pct: r(2,50,80) },
        { icon: "C", label: "Mais de 3.5 cartoes", record: `${r(3,5,8)}/10`, pct: r(3,50,80) },
        { icon: "C", label: "Menos de 4.5 cartoes", record: `${r(9,5,9)}/10`, pct: r(9,50,90) },
        { icon: "E", label: "Menos de 10.5 escanteios", record: `${r(4,4,7)}/10`, pct: r(4,40,70) },
        { icon: "E", label: "Mais de 8.5 escanteios", record: `${r(10,4,8)}/10`, pct: r(10,40,80) },
        { icon: "V", label: `${match.teamA} venceu 1T`, record: `${r(5,3,7)}/10`, pct: r(5,30,70) },
        { icon: "V", label: `${match.teamB} venceu 1T`, record: `${r(6,3,6)}/10`, pct: r(6,30,60) },
        { icon: "D", label: "Sem sofrer gols", record: `${r(7,2,5)}/10`, pct: r(7,20,50) },
        { icon: "P", label: `${match.teamA} primeiro a marcar`, record: `${r(8,5,9)}/10`, pct: r(8,50,90) },
        { icon: "P", label: `${match.teamB} primeiro a marcar`, record: `${r(11,4,7)}/10`, pct: r(11,40,70) },
      ];
      return ps.map(p => ({ ...p, odd: o(p.pct) }));
    }
  }
}

/* --- Average Stats Generator --- */
function generateAvgStats(match: MatchData) {
  const sport = match.sport || "Futebol";
  const seed = match.odds[0] * 53 + match.odds[1] * 29 + match.odds[2] * 11;
  const r = (off: number, min: number, max: number) => {
    const v = ((seed * (off + 1) * 19) % ((max - min) * 10 + 1)) / 10 + min;
    return Math.round(v * 10) / 10;
  };
  switch (sport) {
    case "Basquete":
      return [
        { label: "Pontos por Jogo", home: r(1,95,120), away: r(2,95,120) },
        { label: "Rebotes por Jogo", home: r(3,38,50), away: r(4,38,50) },
        { label: "Assistencias por Jogo", home: r(5,20,30), away: r(6,20,30) },
        { label: "Roubos de Bola", home: r(7,5,10), away: r(8,5,10) },
        { label: "Bloqueios", home: r(9,3,7), away: r(10,3,7) },
        { label: "Turnovers", home: r(11,10,17), away: r(12,10,17) },
        { label: "FG%", home: r(13,42,50), away: r(14,42,50), unit: "%" },
        { label: "3P%", home: r(15,30,42), away: r(16,30,42), unit: "%" },
        { label: "FT%", home: r(17,72,88), away: r(18,72,88), unit: "%" },
        { label: "Rebotes Ofensivos", home: r(19,8,14), away: r(20,8,14) },
        { label: "Rebotes Defensivos", home: r(21,28,38), away: r(22,28,38) },
        { label: "Faltas por Jogo", home: r(23,18,24), away: r(24,18,24) },
      ];
    case "Tenis":
      return [
        { label: "Aces por Partida", home: r(1,4,14), away: r(2,4,14) },
        { label: "Duplas Faltas", home: r(3,1,5), away: r(4,1,5) },
        { label: "1o Saque %", home: r(5,58,72), away: r(6,58,72), unit: "%" },
        { label: "Pontos no 1o Saque %", home: r(7,68,82), away: r(8,68,82), unit: "%" },
        { label: "Pontos no 2o Saque %", home: r(9,45,58), away: r(10,45,58), unit: "%" },
        { label: "Break Points Salvos %", home: r(11,55,75), away: r(12,55,75), unit: "%" },
        { label: "Break Points Conv. %", home: r(13,35,55), away: r(14,35,55), unit: "%" },
        { label: "Winners por Partida", home: r(15,20,42), away: r(16,20,42) },
        { label: "Erros nao Forcados", home: r(17,15,35), away: r(18,15,35) },
        { label: "Veloc. Media Saque", home: r(19,180,215), away: r(20,180,215) },
        { label: "Games Vencidos %", home: r(21,55,72), away: r(22,55,72), unit: "%" },
        { label: "Tie-breaks Vencidos %", home: r(23,45,70), away: r(24,45,70), unit: "%" },
      ];
    case "Volei":
      return [
        { label: "Pontos por Set", home: r(1,22,26), away: r(2,22,26) },
        { label: "Ataques por Jogo", home: r(3,45,65), away: r(4,45,65) },
        { label: "Eficiencia Ataque %", home: r(5,40,55), away: r(6,40,55), unit: "%" },
        { label: "Aces por Jogo", home: r(7,3,8), away: r(8,3,8) },
        { label: "Bloqueios por Jogo", home: r(9,6,14), away: r(10,6,14) },
        { label: "Erros por Jogo", home: r(11,12,22), away: r(12,12,22) },
        { label: "Recepcao Positiva %", home: r(13,50,70), away: r(14,50,70), unit: "%" },
        { label: "Defesas por Jogo", home: r(15,10,18), away: r(16,10,18) },
        { label: "Pontos de Saque", home: r(17,4,9), away: r(18,4,9) },
        { label: "Sets Vencidos %", home: r(19,55,75), away: r(20,55,75), unit: "%" },
      ];
    default:
      return [
        { label: "Gols Marcados", home: r(1,0.8,2.5), away: r(2,0.8,2.5) },
        { label: "Gols Sofridos", home: r(3,0.5,1.8), away: r(4,0.5,1.8) },
        { label: "Posse de Bola %", home: r(5,45,62), away: r(6,45,62), unit: "%" },
        { label: "Finalizacoes", home: r(7,10,18), away: r(8,10,18) },
        { label: "Chutes no Alvo", home: r(9,3,7), away: r(10,3,7) },
        { label: "Escanteios", home: r(11,4,8), away: r(12,4,8) },
        { label: "Faltas Cometidas", home: r(13,10,16), away: r(14,10,16) },
        { label: "Cartoes Amarelos", home: r(15,1.5,3.5), away: r(16,1.5,3.5) },
        { label: "Impedimentos", home: r(19,1,4), away: r(20,1,4) },
        { label: "Passes por Jogo", home: r(23,350,550), away: r(24,350,550) },
        { label: "Precisao Passe %", home: r(25,78,90), away: r(26,78,90), unit: "%" },
        { label: "Desarmes", home: r(27,14,22), away: r(28,14,22) },
        { label: "Defesas Goleiro", home: r(31,2,6), away: r(32,2,6) },
      ];
  }
}

/* --- Odds Movement Generator --- */
function generateOddsData(match: MatchData) {
  const a = match.odds[0];
  const d = match.odds[1];
  const b = match.odds[2];
  return [
    { time: "10h", home: +(a + 0.10).toFixed(2), draw: +(d + 0.05).toFixed(2), away: +(b - 0.05).toFixed(2) },
    { time: "12h", home: +(a + 0.07).toFixed(2), draw: +(d + 0.02).toFixed(2), away: +(b).toFixed(2) },
    { time: "14h", home: +(a + 0.03).toFixed(2), draw: +(d).toFixed(2), away: +(b + 0.07).toFixed(2) },
    { time: "16h", home: +(a + 0.05).toFixed(2), draw: +(d - 0.03).toFixed(2), away: +(b + 0.03).toFixed(2) },
    { time: "18h", home: +(a).toFixed(2), draw: +(d + 0.01).toFixed(2), away: +(b + 0.10).toFixed(2) },
    { time: "20h", home: +(a - 0.03).toFixed(2), draw: +(d - 0.02).toFixed(2), away: +(b + 0.15).toFixed(2) },
  ];
}

/* ===== MAIN COMPONENT ===== */
type TabKey = "resumo" | "estatisticas" | "escalacoes" | "confrontos" | "odds" | "jogadores";

const getTabsForSport = (sport?: string): { key: TabKey; label: string; icon: React.ElementType }[] => {
  const base: { key: TabKey; label: string; icon: React.ElementType }[] = [
    { key: "resumo", label: "Resumo", icon: Info },
    { key: "estatisticas", label: "Estatisticas", icon: BarChart3 },
  ];
  switch (sport) {
    case "Basquete":
      return [...base, { key: "confrontos", label: "Confrontos", icon: Swords }, { key: "odds", label: "Odds", icon: LineChart }, { key: "jogadores", label: "Elenco", icon: Users }];
    case "Tenis":
      return [...base, { key: "confrontos", label: "Historico", icon: History }, { key: "odds", label: "Odds", icon: LineChart }];
    case "Volei":
      return [...base, { key: "escalacoes", label: "Escalacao", icon: Shirt }, { key: "confrontos", label: "Confrontos", icon: Swords }, { key: "odds", label: "Odds", icon: LineChart }, { key: "jogadores", label: "Elenco", icon: Users }];
    default:
      return [...base, { key: "escalacoes", label: "Escalacoes", icon: Shirt }, { key: "confrontos", label: "Confrontos", icon: Swords }, { key: "odds", label: "Odds", icon: LineChart }, { key: "jogadores", label: "Jogadores", icon: Users }];
  }
};

const Analytics = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const [match, setMatch] = useState<MatchData | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [apiLineup, setApiLineup] = useState<any>(null);
  const [lineupLoading, setLineupLoading] = useState(false);
  const [apiEvents, setApiEvents] = useState<MatchEvent[] | null>(null);
  const [fullOdds, setFullOdds] = useState<FullOddsData | null>(null);
  const [h2hApiData, setH2hApiData] = useState<H2HApiData | null>(null);
  const [historicData, setHistoricData] = useState<MatchHistoricData | null>(null);
  const [historicLoading, setHistoricLoading] = useState(false);
  const [liveStats, setLiveStats] = useState<MatchLiveStats | null>(null);
  const [liveStatsFailed, setLiveStatsFailed] = useState(false);
  const [oddsLoading, setOddsLoading] = useState(false);
  const [h2hLoading, setH2hLoading] = useState(false);
  const availableTabs = getTabsForSport(match?.sport);
  const [activeTab, setActiveTab] = useState<TabKey>("resumo");
  const [selectedTeam, setSelectedTeam] = useState<"home" | "away">("home");
  const { addSelection, isSelected } = useBetSlip();

  useEffect(() => {
    if (!matchId) { setLoading(false); return; }
    setLoading(true);
    getMatchById(decodeURIComponent(matchId))
      .then(setMatch)
      .catch(() => setMatch(undefined))
      .finally(() => setLoading(false));
  }, [matchId]);

  // Auto-refresh live match data every 15s
  useEffect(() => {
    if (!match?.live || !matchId) return;
    const interval = setInterval(() => {
      getMatchById(decodeURIComponent(matchId))
        .then((updated) => { if (updated) setMatch(updated); })
        .catch(() => {});
    }, 15_000);
    return () => clearInterval(interval);
  }, [match?.live, matchId]);

  // Fetch real lineup for all matches (live and pre-match)
  useEffect(() => {
    if (!match?.id) return;
    setLineupLoading(true);
    setApiLineup(null);
    getMatchLineups(match.id)
      .then(setApiLineup)
      .catch(() => setApiLineup(null))
      .finally(() => setLineupLoading(false));
  }, [match?.id]);

  // Fetch match events from event/view; poll every 30s for live matches
  useEffect(() => {
    if (!match?.id) return;
    const fetchEvents = () =>
      getMatchEvents(match.id).then(res => {
        if (res?.events) setApiEvents(res.events);
      }).catch(() => {});
    fetchEvents();
    if (!match.live) return;
    const interval = setInterval(fetchEvents, 30_000);
    return () => clearInterval(interval);
  }, [match?.id, match?.live]);

  // Fetch real odds and H2H from backend
  useEffect(() => {
    if (!match?.id) return;
    setOddsLoading(true);
    getFullOddsForMatch(match.id)
      .then(setFullOdds)
      .finally(() => setOddsLoading(false));
    setH2hLoading(true);
    getMatchH2H(match.id).then(setH2hApiData).finally(() => setH2hLoading(false));
    if (!match?.live) {
      setHistoricLoading(true);
      getMatchHistoric(match.id, 10).then(setHistoricData).catch(() => setHistoricData(null)).finally(() => setHistoricLoading(false));
    }
  }, [match?.id]);

  // Fetch live stats para jogos ao vivo (com refresh a cada 30s)
  useEffect(() => {
    if (!match?.live || !match?.id) return;
    setLiveStatsFailed(false);
    const fetchLive = () => {
      getMatchLiveStats(match.id)
        .then(data => { setLiveStats(data); if (!data) setLiveStatsFailed(true); })
        .catch(() => { setLiveStats(null); setLiveStatsFailed(true); });
    };
    fetchLive();
    const interval = setInterval(fetchLive, 30_000);
    return () => clearInterval(interval);
  }, [match?.id, match?.live]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 py-16 text-center space-y-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-secondary rounded mx-auto" />
            <div className="h-4 w-64 bg-secondary rounded mx-auto" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 py-16 text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Partida nao encontrada</h1>
          <p className="text-muted-foreground">A partida que voce procura nao existe ou foi removida.</p>
          <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline font-medium"><ArrowLeft className="w-4 h-4" /> Voltar ao inicio</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const details = getMatchDetails(match.teamA, match.teamB, match.scoreA, match.scoreB, match.odds, match.sport || "Futebol");
  const displayH2H = h2hApiData?.h2h?.length ? h2hApiData.h2h.map(r => ({ date: r.date, home: r.home, away: r.away, score: r.score, winner: r.winner as "home" | "away" | "draw", league: r.league })) : [];
  const homeLastMatches = h2hApiData?.homeLastMatches ?? [];
  const awayLastMatches = h2hApiData?.awayLastMatches ?? [];
  const commonStats = generateCommonStats(match);
  const avgStats = generateAvgStats(match);
  // Use real 1X2 odds when available, fall back to match.odds
  const isPlaceholderOdds = match.odds[0] === 1.50 && match.odds[1] === 3.50 && match.odds[2] === 4.00;
  const hasRealOdds = !!fullOdds?.resultado;
  const realHomeOdd = fullOdds?.resultado?.home ?? match.odds[0];
  const realDrawOdd = fullOdds?.resultado?.draw ?? match.odds[1];
  const realAwayOdd = fullOdds?.resultado?.away ?? match.odds[2];
  const realOdds: [number, number, number] = [realHomeOdd, realDrawOdd, realAwayOdd];
  const minOdd = Math.min(...realOdds);
  const favIndex = realOdds.indexOf(minOdd);
  const favLabel = favIndex === 0 ? match.teamA : favIndex === 2 ? match.teamB : "Empate";
  const winProb = Math.round((1 / minOdd) * 100);
  const probA = Math.round((1 / realHomeOdd) * 100);
  const probDraw = Math.round((1 / realDrawOdd) * 100);
  const probB = Math.round((1 / realAwayOdd) * 100);
  const totalProb = probA + probDraw + probB;
  const normA = Math.round((probA / totalProb) * 100);
  const normDraw = Math.round((probDraw / totalProb) * 100);
  const normB = 100 - normA - normDraw;

  const handleOdd = (betId: string, pick: string, odd: number) => {
    addSelection({ id: betId, matchId: match.id, league: match.league, teamA: match.teamA, teamB: match.teamB, pick, odds: odd });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="w-4 h-4" /> Voltar</button>

        {/* ====== MATCH HEADER ====== */}
        <RevealSection>
          <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
            <div className="px-5 py-2.5 border-b border-border/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">{match.league}</span>
                {match.sport && <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 rounded bg-secondary ml-1">{match.sport}</span>}
              </div>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                {details.stadium && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {details.stadium}</span>}
              </div>
            </div>
            <div className="px-5 py-6 sm:py-8">
              <div className="flex items-center justify-center gap-6 sm:gap-10">
                <div className="flex flex-col items-center gap-2.5 flex-1">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold bg-primary/10 text-primary">{match.teamA.charAt(0)}</div>
                  <span className="text-sm sm:text-base font-bold text-foreground text-center leading-tight">{match.teamA}</span>
                  {details.homeLineup.formation && <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{details.homeLineup.formation}</span>}
                </div>
                <div className="flex flex-col items-center gap-1.5 min-w-[100px]">
                  {match.live && <span className="flex items-center gap-1.5 text-[10px] font-bold text-destructive mb-1"><span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />AO VIVO</span>}
                  {match.scoreA !== undefined ? (
                    <div className="flex items-center gap-3">
                      <span className="text-4xl sm:text-5xl font-black text-foreground tabular-nums">{match.scoreA}</span>
                      <span className="text-xl text-muted-foreground/40 font-light">-</span>
                      <span className="text-4xl sm:text-5xl font-black text-foreground tabular-nums">{match.scoreB}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      {match.date && <span className="text-xs text-muted-foreground">{match.date}</span>}
                      <span className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums">{match.time}</span>
                    </div>
                  )}
                  {match.live && <span className="text-xs text-muted-foreground tabular-nums">{match.time}</span>}
                </div>
                <div className="flex flex-col items-center gap-2.5 flex-1">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold" style={{ background: "hsl(220, 20%, 45% / 0.15)", color: "hsl(220, 20%, 65%)" }}>{match.teamB.charAt(0)}</div>
                  <span className="text-sm sm:text-base font-bold text-foreground text-center leading-tight">{match.teamB}</span>
                  {details.awayLineup.formation && <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{details.awayLineup.formation}</span>}
                </div>
              </div>
              <div className="mt-6 max-w-md mx-auto">
                <div className="flex items-center justify-between mb-1.5 text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-primary">{normA}%</span>
                  <span className="text-muted-foreground">{normDraw}%</span>
                  <span className="text-foreground/70">{normB}%</span>
                </div>
                <div className="flex h-2 rounded-full overflow-hidden gap-px">
                  <div className="h-full rounded-l-full transition-all duration-700 bg-primary" style={{ width: `${normA}%` }} />
                  <div className="h-full transition-all duration-700 bg-muted-foreground/30" style={{ width: `${normDraw}%` }} />
                  <div className="h-full rounded-r-full transition-all duration-700" style={{ width: `${normB}%`, background: "hsl(220, 20%, 55%)" }} />
                </div>
                <div className="flex items-center justify-between mt-1.5 text-[9px] text-muted-foreground">
                  <span>{match.teamA}</span><span>Empate</span><span>{match.teamB}</span>
                </div>
              </div>
            </div>
            {(!isPlaceholderOdds || hasRealOdds) && (
              <div className="px-5 py-3 border-t border-border/30 flex items-center justify-center gap-3 bg-secondary/20">
                <div className="flex items-center gap-1.5 mr-2">
                  <div className="w-5 h-5 rounded bg-amber-500/20 flex items-center justify-center"><span className="text-[9px] font-black text-amber-400">E</span></div>
                  <span className="text-[9px] text-muted-foreground font-medium hidden sm:inline">Esportes da Sorte</span>
                </div>
                {[{ label: "1", value: realHomeOdd }, { label: "X", value: realDrawOdd }, { label: "2", value: realAwayOdd }].map((o) => (
                  <div key={o.label} className="flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer border border-transparent hover:border-primary/30 transition-all bg-card">
                    <span className="text-[10px] font-bold text-muted-foreground">{o.label}</span>
                    <span className="text-sm font-bold text-foreground tabular-nums">{o.value.toFixed(2)}</span>
                    <span className="text-[9px] text-muted-foreground tabular-nums">({Math.round((1 / o.value) * 100)}%)</span>
                  </div>
                ))}
              </div>
            )}
            <div className="px-5 py-2 border-t border-border/30 flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><User className="w-3 h-3" /> {details.referee}</span>
            </div>
          </div>
        </RevealSection>

        {/* ====== TAB BAR ====== */}
        <RevealSection delay={40}>
          <div className="flex gap-1 p-1 rounded-xl bg-secondary/50 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {availableTabs.map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setActiveTab(key)} className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 ${activeTab === key ? "bg-card text-foreground shadow-sm border border-border/50" : "text-muted-foreground hover:text-foreground"}`}>
                <Icon className="w-3.5 h-3.5" />{label}
              </button>
            ))}
          </div>
        </RevealSection>

        {/* ====== TAB: RESUMO ====== */}
        {activeTab === "resumo" && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            <div className="lg:col-span-3 space-y-5">
              <RevealSection>
                <SectionCard>
                  <SectionTitle icon={Info}>Informacoes da Partida</SectionTitle>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: Trophy, label: "Competicao", value: match.league },
                      { icon: Clock, label: "Horario", value: `${match.date ? `${match.date} - ` : ""}${match.time}` },
                      { icon: MapPin, label: "Local", value: details.stadium },
                      { icon: User, label: "Arbitro", value: details.referee },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-secondary/30">
                        <item.icon className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5">{item.label}</p>
                          <p className="text-xs font-semibold text-foreground leading-tight">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {(details.homeLineup.coach || details.awayLineup.coach) && (
                    <div className="mt-4 pt-3 border-t border-border/30">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5"><Shield className="w-3 h-3" /> Treinadores</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-2.5 rounded-lg bg-secondary/30">
                          <p className="text-[10px] text-muted-foreground mb-0.5">{match.teamA}</p>
                          <p className="text-xs font-semibold text-foreground">{details.homeLineup.coach || "�"}</p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-secondary/30">
                          <p className="text-[10px] text-muted-foreground mb-0.5">{match.teamB}</p>
                          <p className="text-xs font-semibold text-foreground">{details.awayLineup.coach || "�"}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </SectionCard>
              </RevealSection>
              {(match.live || (match.scoreA !== undefined && match.scoreB !== undefined)) && (
                <RevealSection delay={60}>
                  <SectionCard>
                    <SectionTitle icon={Clock}>Eventos da Partida</SectionTitle>
                    <div className="space-y-0">
                      {(apiEvents ?? details.events).length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">Aguardando inicio da partida...</p>
                      ) : (apiEvents ?? details.events).map((ev, i) => (
                        <div key={i} className={`flex items-center gap-3 py-2.5 ${i > 0 ? "border-t border-border/30" : ""}`}>
                          {ev.team === "home" ? (
                            <><span className="text-sm text-foreground flex-1 text-right truncate">{ev.player}</span><EventIcon type={ev.type} /><span className="text-xs font-mono text-muted-foreground w-10 text-center tabular-nums">{ev.minute}'</span><div className="flex-1" /></>
                          ) : (
                            <><div className="flex-1" /><span className="text-xs font-mono text-muted-foreground w-10 text-center tabular-nums">{ev.minute}'</span><EventIcon type={ev.type} /><span className="text-sm text-foreground flex-1 truncate">{ev.player}</span></>
                          )}
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                </RevealSection>
              )}
              <RevealSection delay={80}>
                <SectionCard>
                  <SectionTitle icon={BarChart3}>Estatisticas Rapidas</SectionTitle>
                  <div className="flex items-center justify-between px-1 mb-1">
                    <span className="text-xs font-bold text-primary">{match.teamA}</span>
                    <span className="text-xs font-bold text-foreground/70">{match.teamB}</span>
                  </div>
                  {match.live ? (
                    <>
                      {match.sport === "Basquete" && details.basketballStats && (<><StatBar label="Pontos" home={details.basketballStats.points[0]} away={details.basketballStats.points[1]} /><StatBar label="FG %" home={details.basketballStats.fieldGoalPercentage[0]} away={details.basketballStats.fieldGoalPercentage[1]} unit="%" /><StatBar label="Rebotes" home={details.basketballStats.rebounds[0]} away={details.basketballStats.rebounds[1]} /><StatBar label="Assistencias" home={details.basketballStats.assists[0]} away={details.basketballStats.assists[1]} /></>)}
                      {match.sport === "Tenis" && details.tennisStats && (<><StatBar label="Aces" home={details.tennisStats.aces[0]} away={details.tennisStats.aces[1]} /><StatBar label="1o Saque %" home={details.tennisStats.firstServePercentage[0]} away={details.tennisStats.firstServePercentage[1]} unit="%" /><StatBar label="Break Points" home={details.tennisStats.breakPointsWon[0]} away={details.tennisStats.breakPointsWon[1]} /><StatBar label="Vencedoras" home={details.tennisStats.winners[0]} away={details.tennisStats.winners[1]} /></>)}
                      {match.sport === "Volei" && details.volleyballStats && (<><StatBar label="Pontos" home={details.volleyballStats.points[0]} away={details.volleyballStats.points[1]} /><StatBar label="Kills" home={details.volleyballStats.kills[0]} away={details.volleyballStats.kills[1]} /><StatBar label="Aces" home={details.volleyballStats.aces[0]} away={details.volleyballStats.aces[1]} /><StatBar label="Bloqueios" home={details.volleyballStats.blockingPoints[0]} away={details.volleyballStats.blockingPoints[1]} /></>)}
                      {(!match.sport || match.sport === "Futebol") && (<><StatBar label="Posse de Bola" home={details.stats.possession[0]} away={details.stats.possession[1]} unit="%" /><StatBar label="Finalizacoes" home={details.stats.shots[0]} away={details.stats.shots[1]} /><StatBar label="Chutes no Alvo" home={details.stats.shotsOnTarget[0]} away={details.stats.shotsOnTarget[1]} /><StatBar label="Escanteios" home={details.stats.corners[0]} away={details.stats.corners[1]} /></>)}
                    </>
                  ) : (
                    <>{avgStats.slice(0, 5).map((stat, i) => (<StatBar key={i} label={stat.label} home={stat.home} away={stat.away} unit={(stat as { unit?: string }).unit} />))}</>
                  )}
                </SectionCard>
              </RevealSection>
            </div>
            <div className="lg:col-span-2 space-y-5">
              <RevealSection delay={60}>
                <SectionCard>
                  <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2"><LineChart className="w-3.5 h-3.5 text-primary" /> Odds Atuais</h3>
                  {isPlaceholderOdds && !hasRealOdds ? (
                    <div className="flex flex-col items-center gap-2 py-4 text-center">
                      <p className="text-xs font-semibold text-amber-600">Não foi possível encontrar as odds dessa partida.</p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {[{ label: match.teamA, odds: realHomeOdd, highlight: realHomeOdd === minOdd }, { label: "Empate", odds: realDrawOdd, highlight: realDrawOdd === minOdd }, { label: match.teamB, odds: realAwayOdd, highlight: realAwayOdd === minOdd }].map((o, idx) => (
                        <div key={idx} className={`flex items-center justify-between p-2.5 rounded-lg transition-colors ${o.highlight ? "bg-primary/5 border border-primary/20" : "bg-secondary/30"}`}>
                          <span className={`text-xs ${o.highlight ? "text-primary font-semibold" : "text-muted-foreground"}`}>{o.label}</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold tabular-nums ${o.highlight ? "text-primary" : "text-foreground"}`}>{o.odds.toFixed(2)}</span>
                            <span className="text-[10px] text-muted-foreground tabular-nums">{Math.round((1 / o.odds) * 100)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </SectionCard>
              </RevealSection>
              <RevealSection delay={100}>
                <div className="rounded-xl border border-primary/20 bg-primary/[0.03] p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-primary/10"><Zap className="w-4 h-4 text-primary" /></div>
                    <div>
                      <h4 className="text-xs font-semibold text-foreground mb-1.5">Analise IA</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Favorito: <strong className="text-primary">{favLabel}</strong> com <strong className="text-primary">{winProb}%</strong> de probabilidade implicita.
                        {(!match.sport || match.sport === "Futebol") && details.stats.possession[0] > 50 ? ` ${match.teamA} domina a posse de bola e estatisticas ofensivas.` : " A analise estatistica favorece a consistencia recente."}
                      </p>
                    </div>
                  </div>
                </div>
              </RevealSection>
              <RevealSection delay={140}>
                <SectionCard>
                  <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2"><Target className="w-3.5 h-3.5 text-primary" /> Padroes - Ultimos 10 Jogos</h3>
                  <div className="space-y-2">
                    {commonStats.slice(0, 5).map((cs, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <span className="text-xs font-bold text-primary w-5 h-5 rounded flex items-center justify-center bg-primary/10 shrink-0">{cs.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-foreground truncate">{cs.label}</p>
                          <div className="flex items-center gap-2 mt-1"><div className="flex-1 h-1 rounded-full bg-muted/30 overflow-hidden"><div className="h-full rounded-full bg-primary/60 transition-all duration-700" style={{ width: `${cs.pct}%` }} /></div></div>
                        </div>
                        <span className="text-xs font-bold text-primary shrink-0 tabular-nums">{cs.record}</span>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </RevealSection>
              <RevealSection delay={180}>
                <SectionCard>
                  <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2"><History className="w-3.5 h-3.5 text-primary" /> Ultimo Confronto</h3>
                  {displayH2H.length > 0 ? (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                      <div className="text-center flex-1"><p className="text-sm font-bold text-foreground">{displayH2H[0].home}</p></div>
                      <div className="text-center px-3"><p className="text-lg font-bold text-foreground">{displayH2H[0].score}</p><p className="text-[9px] text-muted-foreground">{displayH2H[0].date}</p></div>
                      <div className="text-center flex-1"><p className="text-sm font-bold text-foreground">{displayH2H[0].away}</p></div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-3">Sem confrontos diretos recentes</p>
                  )}
                </SectionCard>
              </RevealSection>
            </div>
          </div>
        )}

        {/* ====== TAB: ESTATISTICAS ====== */}
        {activeTab === "estatisticas" && (
          <div className="space-y-5">
            {/* Live stats block � Bet365/Sofascore-style with real-time badge */}
            {match.live && (
              <RevealSection>
                <SectionCard>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-destructive" /></span>
                      <h2 className="text-sm font-semibold text-foreground">Estatisticas ao Vivo</h2>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-bold uppercase tracking-wider">{match.time}</span>
                  </div>
                  <div className="flex items-center justify-between px-1 pb-3 border-b border-border/30 mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">{match.teamA.charAt(0)}</div>
                      <span className="text-xs font-bold text-primary">{match.teamA}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground/70">{match.teamB}</span>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: "hsl(220, 20%, 45% / 0.15)", color: "hsl(220, 20%, 65%)" }}>{match.teamB.charAt(0)}</div>
                    </div>
                  </div>
                  {match.sport === "Basquete" && details.basketballStats && <BasketballStatsView teamA={match.teamA} teamB={match.teamB} stats={details.basketballStats} />}
                  {match.sport === "Tenis" && details.tennisStats && <TennisStatsView teamA={match.teamA} teamB={match.teamB} stats={details.tennisStats} />}
                  {match.sport === "Volei" && details.volleyballStats && <VolleyballStatsView teamA={match.teamA} teamB={match.teamB} stats={details.volleyballStats} />}
                  {(!match.sport || match.sport === "Futebol") && (() => {
                    if (liveStatsFailed || (!liveStats && !liveStatsFailed)) {
                      return liveStatsFailed
                        ? <p className="text-xs text-muted-foreground text-center py-4">Nao foi possivel obter dados das estatisticas da partida</p>
                        : <p className="text-xs text-muted-foreground text-center py-4 animate-pulse">A carregar estatisticas...</p>;
                    }
                    if (!liveStats) return null;
                    const h = liveStats.home;
                    const a = liveStats.away;
                    const sections = [
                      { title: "Ataque", rows: [
                        ...(h.possession != null || a.possession != null ? [{ label: "Posse de Bola", home: h.possession ?? 0, away: a.possession ?? 0, unit: "%" }] : []),
                        ...(h.shots != null || a.shots != null ? [{ label: "Finalizacoes", home: h.shots ?? 0, away: a.shots ?? 0 }] : []),
                        ...(h.shotsOnTarget != null || a.shotsOnTarget != null ? [{ label: "Chutes no Alvo", home: h.shotsOnTarget ?? 0, away: a.shotsOnTarget ?? 0 }] : []),
                        ...(h.attacks != null || a.attacks != null ? [{ label: "Ataques", home: h.attacks ?? 0, away: a.attacks ?? 0 }] : []),
                        ...(h.dangerousAttacks != null || a.dangerousAttacks != null ? [{ label: "Ataques Perigosos", home: h.dangerousAttacks ?? 0, away: a.dangerousAttacks ?? 0 }] : []),
                      ]},
                      { title: "Defesa", rows: [
                        ...(h.saves != null || a.saves != null ? [{ label: "Defesas do Goleiro", home: h.saves ?? 0, away: a.saves ?? 0 }] : []),
                      ]},
                      { title: "Disciplina & Outros", rows: [
                        ...(h.corners != null || a.corners != null ? [{ label: "Escanteios", home: h.corners ?? 0, away: a.corners ?? 0 }] : []),
                        ...(h.yellowCards != null || a.yellowCards != null ? [{ label: "Cartoes Amarelos", home: h.yellowCards ?? 0, away: a.yellowCards ?? 0 }] : []),
                        ...(h.redCards != null || a.redCards != null ? [{ label: "Cartoes Vermelhos", home: h.redCards ?? 0, away: a.redCards ?? 0 }] : []),
                      ]},
                    ].filter(s => s.rows.length > 0);
                    return (
                      <div className="space-y-3 mt-1">
                        {sections.map((sec, si) => (
                          <div key={si}>
                            <div className="flex items-center gap-2 mb-1 mt-2">
                              <div className="w-1 h-4 rounded-full bg-primary/60" />
                              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{sec.title}</h4>
                            </div>
                            <div className="divide-y divide-border/30">
                              {sec.rows.map((row, ri) => (
                                <StatBar key={ri} label={row.label} home={row.home} away={row.away} unit={(row as any).unit} />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </SectionCard>
              </RevealSection>
            )}

            {/* Season / Last 10 stats ou Live Stats */}
            <RevealSection delay={match.live ? 40 : 0}>
              <SectionCard>
                <div className="flex items-center justify-between mb-1">
                  <SectionTitle icon={BarChart3}>
                    {match.live ? `Estatisticas ao Vivo${liveStats?.minute ? ` — ${liveStats.minute}'` : ""}` : "Media - Ultimos 10 Jogos"}
                  </SectionTitle>
                  <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{match.sport || "Futebol"}</span>
                </div>
                {/* Team header strip � Bet365 style */}
                <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-secondary/40 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{match.teamA.charAt(0)}</div>
                    <span className="text-xs font-bold text-foreground">{match.teamA}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">vs</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">{match.teamB}</span>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "hsl(220, 20%, 45% / 0.15)", color: "hsl(220, 20%, 65%)" }}>{match.teamB.charAt(0)}</div>
                  </div>
                </div>
                {/* Stats grouped by category */}
                {(() => {
                  const sport = match.sport || "Futebol";

                  // ── Jogo ao vivo: estatísticas em tempo real ──
                  if (match.live) {
                    if (liveStatsFailed || !liveStats) {
                      return (
                        <p className="text-xs text-muted-foreground text-center py-6">
                          Nao foi possivel obter dados das estatisticas da partida
                        </p>
                      );
                    }
                    const h = liveStats.home;
                    const a = liveStats.away;
                    const liveCategories = [
                      {
                        title: "Ataque",
                        rows: [
                          ...(h.shots != null || a.shots != null ? [{ label: "Finalizacoes", home: h.shots ?? 0, away: a.shots ?? 0, unit: undefined }] : []),
                          ...(h.shotsOnTarget != null || a.shotsOnTarget != null ? [{ label: "Chutes no Alvo", home: h.shotsOnTarget ?? 0, away: a.shotsOnTarget ?? 0, unit: undefined }] : []),
                          ...(h.attacks != null || a.attacks != null ? [{ label: "Ataques", home: h.attacks ?? 0, away: a.attacks ?? 0, unit: undefined }] : []),
                          ...(h.dangerousAttacks != null || a.dangerousAttacks != null ? [{ label: "Ataques Perigosos", home: h.dangerousAttacks ?? 0, away: a.dangerousAttacks ?? 0, unit: undefined }] : []),
                        ],
                      },
                      {
                        title: "Posse",
                        rows: [
                          ...(h.possession != null || a.possession != null ? [{ label: "Posse de Bola %", home: h.possession ?? 0, away: a.possession ?? 0, unit: "%" }] : []),
                        ],
                      },
                      {
                        title: "Defesa",
                        rows: [
                          ...(h.saves != null || a.saves != null ? [{ label: "Defesas Goleiro", home: h.saves ?? 0, away: a.saves ?? 0, unit: undefined }] : []),
                        ],
                      },
                      {
                        title: "Disciplina & Outros",
                        rows: [
                          ...(h.corners != null || a.corners != null ? [{ label: "Escanteios", home: h.corners ?? 0, away: a.corners ?? 0, unit: undefined }] : []),
                          ...(h.yellowCards != null || a.yellowCards != null ? [{ label: "Cartoes Amarelos", home: h.yellowCards ?? 0, away: a.yellowCards ?? 0, unit: undefined }] : []),
                          ...(h.redCards != null || a.redCards != null ? [{ label: "Cartoes Vermelhos", home: h.redCards ?? 0, away: a.redCards ?? 0, unit: undefined }] : []),
                        ],
                      },
                    ].filter(cat => cat.rows.length > 0);

                    return liveCategories.map((cat, ci) => (
                      <div key={ci} className={ci > 0 ? "mt-4" : ""}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-1 h-3.5 rounded-full bg-primary" />
                          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{cat.title}</span>
                        </div>
                        <div className="space-y-0">
                          {cat.rows.map((stat, i) => (
                            <StatBar key={i} label={stat.label} home={stat.home} away={stat.away} unit={stat.unit} />
                          ))}
                        </div>
                      </div>
                    ));
                  }

                  // ── Loading historicData ──
                  if (!match.live && historicLoading) {
                    return (
                      <div className="flex flex-col items-center justify-center py-10 gap-4">
                        <div className="relative">
                          <div className="w-14 h-14 rounded-full border-4 border-secondary" />
                          <div className="absolute inset-0 w-14 h-14 rounded-full border-4 border-transparent border-t-primary animate-spin" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-lg">📊</span>
                          </div>
                        </div>
                        <div className="text-center space-y-1">
                          <p className="text-sm font-semibold text-foreground">Carregando estatísticas</p>
                          <p className="text-xs text-muted-foreground">Buscando dados dos últimos 10 jogos...</p>
                        </div>
                        <div className="w-full space-y-2 px-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <div className="h-4 rounded bg-secondary/60 animate-pulse" style={{ width: `${30 + (i * 13) % 25}%` }} />
                              <div className="flex-1 h-2 rounded-full bg-secondary/40 animate-pulse" />
                              <div className="h-4 rounded bg-secondary/60 animate-pulse" style={{ width: `${25 + (i * 17) % 20}%` }} />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  // ── Futebol com dados reais da API (histórico) ──
                  if (sport === "Futebol" && historicData) {
                    const h = historicData.home.avg;
                    const a = historicData.away.avg;
                    const realCategories = [
                      {
                        title: "Ataque",
                        rows: [
                          { label: "Gols Marcados", home: h.avgGoalsScored, away: a.avgGoalsScored, unit: undefined },
                          ...(h.avgShots != null || a.avgShots != null ? [{ label: "Finalizacoes", home: h.avgShots ?? 0, away: a.avgShots ?? 0, unit: undefined }] : []),
                          ...(h.avgShotsOnTarget != null || a.avgShotsOnTarget != null ? [{ label: "Chutes no Alvo", home: h.avgShotsOnTarget ?? 0, away: a.avgShotsOnTarget ?? 0, unit: undefined }] : []),
                        ],
                      },
                      {
                        title: "Posse & Passes",
                        rows: [
                          ...(h.avgPossession != null || a.avgPossession != null ? [{ label: "Posse de Bola %", home: h.avgPossession ?? 0, away: a.avgPossession ?? 0, unit: "%" }] : []),
                        ],
                      },
                      {
                        title: "Defesa",
                        rows: [
                          { label: "Gols Sofridos", home: h.avgGoalsConceded, away: a.avgGoalsConceded, unit: undefined },
                          ...(h.avgSaves != null || a.avgSaves != null ? [{ label: "Defesas Goleiro", home: h.avgSaves ?? 0, away: a.avgSaves ?? 0, unit: undefined }] : []),
                        ],
                      },
                      {
                        title: "Disciplina & Outros",
                        rows: [
                          ...(h.avgCorners != null || a.avgCorners != null ? [{ label: "Escanteios", home: h.avgCorners ?? 0, away: a.avgCorners ?? 0, unit: undefined }] : []),
                          ...(h.avgYellowCards != null || a.avgYellowCards != null ? [{ label: "Cartoes Amarelos", home: h.avgYellowCards ?? 0, away: a.avgYellowCards ?? 0, unit: undefined }] : []),
                        ],
                      },
                    ].filter(cat => cat.rows.length > 0);

                    return realCategories.map((cat, ci) => (
                      <div key={ci} className={ci > 0 ? "mt-4" : ""}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-1 h-3.5 rounded-full bg-primary" />
                          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{cat.title}</span>
                        </div>
                        <div className="space-y-0">
                          {cat.rows.map((stat, i) => (
                            <StatBar key={i} label={stat.label} home={stat.home} away={stat.away} unit={stat.unit} />
                          ))}
                        </div>
                      </div>
                    ));
                  }

                  // ── Dados não disponíveis (histórico ausente, esporte sem suporte) ──
                  return (
                    <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                      <span className="text-3xl">📉</span>
                      <p className="text-sm font-semibold text-foreground">Dados históricos indisponíveis</p>
                      <p className="text-xs text-muted-foreground max-w-xs">
                        Não encontramos estatísticas dos últimos jogos desta partida. Tente novamente em instantes.
                      </p>
                    </div>
                  );
                })()}
              </SectionCard>
            </RevealSection>

            {/* Form guide — Bet365 last 5 results style */}
            <RevealSection delay={match.live ? 80 : 40}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[{ team: match.teamA, isHome: true }, { team: match.teamB, isHome: false }].map(({ team, isHome }) => {
                  const historicTeam = historicData ? (isHome ? historicData.home : historicData.away) : null;
                  const results: ("W" | "D" | "L")[] = historicTeam
                    ? (historicTeam.totals.form.slice(0, 5).split("") as ("W" | "D" | "L")[])
                    : (() => {
                        const seed = match.odds[0] * 37 + match.odds[isHome ? 0 : 2] * 13;
                        return Array.from({ length: 5 }, (_, i) => {
                          const v = Math.round(((seed * (i + 1) * 23) % 3));
                          return (v === 0 ? "W" : v === 1 ? "D" : "L") as "W" | "D" | "L";
                        });
                      })();
                  const wCount = results.filter(r => r === "W").length;
                  const dCount = results.filter(r => r === "D").length;
                  const lCount = results.filter(r => r === "L").length;
                  return (
                    <SectionCard key={team}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${isHome ? "bg-primary/10 text-primary" : ""}`} style={!isHome ? { background: "hsl(220, 20%, 45% / 0.15)", color: "hsl(220, 20%, 65%)" } : {}}>
                          {team.charAt(0)}
                        </div>
                        <span className="text-xs font-semibold text-foreground">{team}</span>
                        <span className="text-[10px] text-muted-foreground ml-auto">Ultimos 5</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {results.map((r, i) => (
                          <div key={i} className={`flex-1 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                            r === "W" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" :
                            r === "D" ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" :
                            "bg-destructive/10 text-destructive border border-destructive/20"
                          }`}>
                            {r === "W" ? "V" : r === "D" ? "E" : "D"}
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
                        <span>{wCount}V {dCount}E {lCount}D</span>
                        <span className={`font-semibold ${wCount >= 3 ? "text-emerald-400" : lCount >= 3 ? "text-destructive" : "text-yellow-400"}`}>
                          {wCount >= 3 ? "Boa fase" : lCount >= 3 ? "Fase ruim" : "Irregular"}
                        </span>
                      </div>
                    </SectionCard>
                  );
                })}
              </div>
            </RevealSection>
          </div>
        )}

        {/* ====== TAB: ESCALACOES ====== */}
        {activeTab === "escalacoes" && (match?.sport === "Futebol" || match?.sport === "Volei" || !match?.sport) && (
          <div className="space-y-5">
            {lineupLoading && (
              <div className="flex flex-col items-center py-12 gap-3">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-muted-foreground">A carregar escalação...</p>
              </div>
            )}
            {!lineupLoading && apiLineup && (
              <RevealSection>
                {(apiLineup.homeFallback || apiLineup.awayFallback) ? (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium w-fit bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                    <AlertTriangle className="w-3.5 h-3.5" /> Elenco atual — escalação oficial ainda não anunciada
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium w-fit bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {match.live ? "Escalação oficial (ao vivo)" : "Escalação oficial"}
                  </div>
                )}
              </RevealSection>
            )}
            {/* Real API lineup section */}
            {!lineupLoading && apiLineup && (
              <RevealSection delay={20}>
                <div className="flex gap-1.5 p-1 rounded-xl bg-secondary/40 mb-4">
                  <button onClick={() => setSelectedTeam("home")} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${selectedTeam === "home" ? "bg-card text-foreground shadow-sm border border-border/50" : "text-muted-foreground hover:text-foreground"}`}>{match.teamA}</button>
                  <button onClick={() => setSelectedTeam("away")} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${selectedTeam === "away" ? "bg-card text-foreground shadow-sm border border-border/50" : "text-muted-foreground hover:text-foreground"}`}>{match.teamB}</button>
                </div>
                <SectionCard>
                  <SectionTitle icon={Shirt}>
                    {selectedTeam === "home"
                      ? (apiLineup.homeFallback ? "Elenco Registrado" : "Escalação Oficial")
                      : (apiLineup.awayFallback ? "Elenco Registrado" : "Escalação Oficial")}
                  </SectionTitle>
                  {(() => {
                    const teamData = selectedTeam === "home" ? apiLineup.home : apiLineup.away;
                    if (!teamData) return <p className="text-sm text-muted-foreground py-4 text-center">Escalação não disponível para este time.</p>;
                    const players = teamData.players || teamData.lineup || [];
                    const subs = teamData.substitutes || teamData.subs || [];
                    return (
                      <div className="space-y-4">
                        {players.length > 0 && (
                          <div>
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{(selectedTeam === "home" ? apiLineup.homeFallback : apiLineup.awayFallback) ? `Elenco (${players.length})` : `Titulares (${players.length})`}</h3>
                            <div className="space-y-1">
                              {players.map((p: any, i: number) => (
                                <div key={p.id || i} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-secondary/30 transition-colors">
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${i === 0 ? "bg-amber-500/20 text-amber-400" : "bg-primary/10 text-primary"}`}>
                                    {p.shirt_number || p.number || i + 1}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-foreground truncate">{p.name}</p>
                                    {p.position && <p className="text-[10px] text-muted-foreground">{p.position}</p>}
                                  </div>
                                  {p.id && <span className="text-[9px] text-muted-foreground/50 font-mono">#{p.id}</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {subs.length > 0 && (
                          <div className="pt-3 border-t border-border/30">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5"><ArrowRightLeft className="w-3 h-3" /> Reservas ({subs.length})</h3>
                            <div className="space-y-1">
                              {subs.map((p: any, i: number) => (
                                <div key={p.id || i} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-secondary/30 transition-colors">
                                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 bg-secondary/60 text-muted-foreground">
                                    {p.shirt_number || p.number || "-"}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-foreground truncate">{p.name}</p>
                                    {p.position && <p className="text-[10px] text-muted-foreground">{p.position}</p>}
                                  </div>
                                  {p.id && <span className="text-[9px] text-muted-foreground/50 font-mono">#{p.id}</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </SectionCard>
              </RevealSection>
            )}
            {/* Escalação indisponível */}
            {!lineupLoading && !apiLineup && (
              <RevealSection>
                <div className="flex flex-col items-center py-16 gap-3">
                  <Shirt className="w-10 h-10 text-muted-foreground/30" />
                  <p className="text-sm font-semibold text-muted-foreground">Escalação indisponível</p>
                  <p className="text-xs text-muted-foreground/60 text-center max-w-xs">A escalação desta partida ainda não foi divulgada ou não está disponível neste momento.</p>
                </div>
              </RevealSection>
            )}
          </div>
        )}

        {/* ====== TAB: CONFRONTOS ====== */}
        {activeTab === "confrontos" && (
          <div className="space-y-5">
            {/* Loading state */}
            {h2hLoading && (
              <div className="flex flex-col items-center py-12 gap-3">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-muted-foreground">A carregar historico...</p>
              </div>
            )}

            {/* Empty state */}
            {!h2hLoading && !h2hApiData && (
              <div className="flex flex-col items-center py-16 gap-3">
                <Swords className="w-10 h-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">Historico de confrontos nao disponivel</p>
              </div>
            )}

            {!h2hLoading && h2hApiData && (
              <>
                {/* H2H Summary strip — only when direct H2H matches exist */}
                {displayH2H.length > 0 && (
                  <RevealSection>
                    <SectionCard>
                      <div className="flex items-center gap-3 mb-4">
                        <Swords className="w-4 h-4 text-primary" />
                        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Historico Direto</h3>
                        <span className="text-[10px] text-muted-foreground ml-auto">{displayH2H.length} jogos</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        {[
                          { label: match.teamA.split(" ").pop(), count: h2hApiData.stats.homeWins, bg: "bg-primary/10 border-primary/20" },
                          { label: "Empates", count: h2hApiData.stats.draws, bg: "bg-secondary/30 border-border/30" },
                          { label: match.teamB.split(" ").pop(), count: h2hApiData.stats.awayWins, bg: "bg-secondary/30 border-border/30" },
                        ].map((item, i) => (
                          <div key={i} className={`text-center py-3 rounded-xl border ${item.bg}`}>
                            <span className={`block text-3xl font-black tabular-nums ${i === 0 ? "text-primary" : i === 2 ? "text-foreground/70" : "text-muted-foreground"}`}>{item.count}</span>
                            <span className="text-[10px] text-muted-foreground font-medium">{item.label}</span>
                          </div>
                        ))}
                      </div>
                      {/* Win distribution bar */}
                      {(() => {
                        const homeW = h2hApiData.stats.homeWins;
                        const draws = h2hApiData.stats.draws;
                        const awayW = h2hApiData.stats.awayWins;
                        const total = homeW + draws + awayW || 1;
                        return (
                          <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5">
                            <div className="bg-primary rounded-l-full transition-all" style={{ width: `${(homeW/total)*100}%` }} />
                            <div className="bg-muted-foreground/30 transition-all" style={{ width: `${(draws/total)*100}%` }} />
                            <div className="bg-foreground/40 rounded-r-full transition-all" style={{ width: `${(awayW/total)*100}%` }} />
                          </div>
                        );
                      })()}
                      {/* Stats row */}
                      <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-border/20">
                        <div className="text-center">
                          <span className="block text-lg font-black text-foreground tabular-nums">{h2hApiData.stats.avgGoals}</span>
                          <span className="text-[9px] text-muted-foreground">Media gols</span>
                        </div>
                        <div className="text-center">
                          <span className="block text-lg font-black text-foreground tabular-nums">{h2hApiData.stats.bttsPercentage}%</span>
                          <span className="text-[9px] text-muted-foreground">Ambos marcam</span>
                        </div>
                        <div className="text-center">
                          <span className="block text-lg font-black text-foreground tabular-nums">{h2hApiData.stats.totalMatches}</span>
                          <span className="text-[9px] text-muted-foreground">Total jogos</span>
                        </div>
                      </div>
                    </SectionCard>
                  </RevealSection>
                )}

                {/* No direct H2H matches */}
                {displayH2H.length === 0 && (
                  <RevealSection>
                    <SectionCard>
                      <div className="flex items-center gap-3 mb-3">
                        <Swords className="w-4 h-4 text-muted-foreground/50" />
                        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Historico Direto</h3>
                      </div>
                      <p className="text-xs text-muted-foreground text-center py-4">Nenhum confronto direto encontrado no historico recente</p>
                    </SectionCard>
                  </RevealSection>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* H2H results list */}
                  {displayH2H.length > 0 && (
                    <RevealSection delay={20}>
                      <SectionCard>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-1 h-4 rounded-full bg-primary" />
                          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Confrontos Diretos</h3>
                        </div>
                        <div className="space-y-2 max-h-[360px] overflow-y-auto thin-scrollbar pr-1">
                          {displayH2H.map((r, i) => (
                            <div key={i} className="relative rounded-xl overflow-hidden border border-border/20 hover:border-primary/20 transition-all">
                              <div className={`absolute inset-y-0 left-0 w-1 ${r.winner === "home" ? "bg-emerald-500" : r.winner === "away" ? "bg-red-500" : "bg-muted-foreground/40"}`} />
                              <div className="flex items-center gap-3 p-3 pl-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded ${r.winner === "home" ? "bg-emerald-500/10 text-emerald-400" : r.winner === "away" ? "bg-red-500/10 text-red-400" : "bg-muted text-muted-foreground"}`}>
                                      {r.winner === "home" ? "VIT" : r.winner === "away" ? "DER" : "EMP"}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground tabular-nums">{r.date}</span>
                                    {r.league && <span className="text-[9px] text-muted-foreground/60 ml-auto truncate max-w-[120px]">{r.league}</span>}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-xs font-semibold ${r.winner === "home" ? "text-foreground" : "text-muted-foreground"}`}>{r.home}</span>
                                    <span className="text-sm font-black text-foreground tabular-nums bg-secondary/50 px-2.5 py-0.5 rounded-lg">{r.score}</span>
                                    <span className={`text-xs font-semibold ${r.winner === "away" ? "text-foreground" : "text-muted-foreground"}`}>{r.away}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </SectionCard>
                    </RevealSection>
                  )}

                  {/* Recent matches per team */}
                  <RevealSection delay={displayH2H.length > 0 ? 40 : 20}>
                    <SectionCard>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1 h-4 rounded-full bg-primary" />
                        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Ultimos Jogos</h3>
                      </div>
                      {/* Team selector */}
                      <div className="flex gap-2 mb-3">
                        <button onClick={() => setSelectedTeam("home")} className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-colors ${selectedTeam === "home" ? "bg-primary/10 text-primary border border-primary/20" : "bg-secondary/30 text-muted-foreground border border-transparent hover:bg-secondary/50"}`}>{match.teamA}</button>
                        <button onClick={() => setSelectedTeam("away")} className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-colors ${selectedTeam === "away" ? "bg-primary/10 text-primary border border-primary/20" : "bg-secondary/30 text-muted-foreground border border-transparent hover:bg-secondary/50"}`}>{match.teamB}</button>
                      </div>
                      <div className="space-y-2 max-h-[300px] overflow-y-auto thin-scrollbar pr-1">
                        {(selectedTeam === "home" ? homeLastMatches : awayLastMatches).length === 0 && (
                          <p className="text-xs text-muted-foreground text-center py-4">Sem jogos recentes</p>
                        )}
                        {(selectedTeam === "home" ? homeLastMatches : awayLastMatches).map((r, i) => (
                          <div key={i} className="relative rounded-xl overflow-hidden border border-border/20 hover:border-primary/20 transition-all">
                            <div className={`absolute inset-y-0 left-0 w-1 ${r.winner === "home" ? "bg-emerald-500" : r.winner === "away" ? "bg-red-500" : "bg-muted-foreground/40"}`} />
                            <div className="flex items-center gap-3 p-3 pl-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`text-[10px] font-black px-2 py-0.5 rounded ${r.winner === "home" ? "bg-emerald-500/10 text-emerald-400" : r.winner === "away" ? "bg-red-500/10 text-red-400" : "bg-muted text-muted-foreground"}`}>
                                    {r.winner === "home" ? "VIT" : r.winner === "away" ? "DER" : "EMP"}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground tabular-nums">{r.date}</span>
                                  {r.league && <span className="text-[9px] text-muted-foreground/60 ml-auto truncate max-w-[120px]">{r.league}</span>}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs font-semibold ${r.winner === "home" ? "text-foreground" : "text-muted-foreground"}`}>{r.home}</span>
                                  <span className="text-sm font-black text-foreground tabular-nums bg-secondary/50 px-2.5 py-0.5 rounded-lg">{r.score}</span>
                                  <span className={`text-xs font-semibold ${r.winner === "away" ? "text-foreground" : "text-muted-foreground"}`}>{r.away}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </SectionCard>
                  </RevealSection>
                </div>
              </>
            )}
          </div>
        )}

        {/* ====== TAB: ODDS ====== */}
        {activeTab === "odds" && (
          <div className="space-y-5">
            {/* Loading state */}
            {oddsLoading && (
              <div className="space-y-5">
                {/* Header skeleton */}
                <div className="flex items-center gap-3 py-4 px-1">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-semibold text-foreground">Buscando as melhores odds...</span>
                    <span className="text-xs text-muted-foreground">Consultando casas de apostas em tempo real</span>
                  </div>
                </div>

                {/* 1X2 skeleton */}
                <div className="rounded-xl border border-border/40 bg-card p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-3 w-28 rounded-full bg-secondary animate-pulse" />
                    <div className="h-4 w-8 rounded-full bg-secondary animate-pulse" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="flex flex-col items-center gap-2 py-4 px-2 rounded-xl border-2 border-border/20 bg-secondary/20"
                        style={{ animationDelay: `${i * 80}ms` }}>
                        <div className="h-2.5 w-16 rounded-full bg-secondary animate-pulse" />
                        <div className="h-7 w-12 rounded-lg bg-secondary animate-pulse" />
                        <div className="h-2 w-8 rounded-full bg-secondary animate-pulse" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Over/Under skeleton */}
                <div className="rounded-xl border border-border/40 bg-card p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 rounded-full bg-secondary animate-pulse" />
                    <div className="h-3 w-32 rounded-full bg-secondary animate-pulse" />
                  </div>
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-secondary/20 border border-border/20"
                      style={{ animationDelay: `${i * 60}ms` }}>
                      <div className="h-3 w-20 rounded-full bg-secondary animate-pulse" />
                      <div className="flex gap-2">
                        <div className="h-7 w-14 rounded-lg bg-secondary animate-pulse" />
                        <div className="h-7 w-14 rounded-lg bg-secondary animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* BTTS / DC skeleton */}
                <div className="grid grid-cols-2 gap-4">
                  {[0, 1].map((i) => (
                    <div key={i} className="rounded-xl border border-border/40 bg-card p-4 space-y-3">
                      <div className="h-3 w-24 rounded-full bg-secondary animate-pulse" />
                      <div className="grid grid-cols-2 gap-2">
                        {[0, 1].map((j) => (
                          <div key={j} className="flex flex-col items-center gap-1.5 py-3 rounded-xl border border-border/20 bg-secondary/20">
                            <div className="h-2.5 w-10 rounded-full bg-secondary animate-pulse" />
                            <div className="h-6 w-12 rounded-lg bg-secondary animate-pulse" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!oddsLoading && (
              <>
                {/* Resultado Final 1X2 — sempre disponível */}
                <RevealSection delay={0}>
                  <SectionCard>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Resultado Final</h3>
                      <span className="text-[9px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">1X2</span>
                    </div>

                    {/* Fallback: odds não encontradas */}
                    {isPlaceholderOdds && !hasRealOdds && !oddsLoading && (
                      <div className="flex flex-col items-center gap-2 py-6 text-center bg-amber-500/10 border border-amber-500/30 rounded-xl">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-amber-500">
                          <path d="M10 2.5L2.5 16.25h15L10 2.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                          <path d="M10 8.75v3.125" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          <circle cx="10" cy="13.75" r="0.625" fill="currentColor"/>
                        </svg>
                        <p className="text-sm font-semibold text-amber-600">Não foi possível encontrar as odds dessa partida.</p>
                        <p className="text-xs text-muted-foreground">Tente novamente mais perto do início do jogo.</p>
                      </div>
                    )}

                    {/* Odds reais ou não-placeholder */}
                    {(!isPlaceholderOdds || hasRealOdds) && (
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: match.teamA, sub: "1", odd: realHomeOdd, active: realHomeOdd === Math.min(...realOdds) },
                          { label: "Empate", sub: "X", odd: realDrawOdd, active: realDrawOdd === Math.min(...realOdds) },
                          { label: match.teamB, sub: "2", odd: realAwayOdd, active: realAwayOdd === Math.min(...realOdds) },
                        ].map((m, i) => {
                          const betId = `${match.id}-odds-1x2-${m.sub}`;
                          const sel = isSelected(betId);
                          return (
                            <button key={i} onClick={() => handleOdd(betId, m.label, m.odd)} className={`relative flex flex-col items-center gap-1.5 pt-4 pb-4 px-2 w-full rounded-xl transition-all border-2 ${sel ? "border-emerald-500 bg-emerald-500/10 shadow-sm shadow-emerald-500/20" : m.active ? "border-primary bg-primary/5 shadow-sm shadow-primary/10" : "border-border/30 bg-secondary/20 hover:border-primary/30 hover:bg-primary/5"}`}>
                              {m.active && !sel && <div className="absolute top-1.5 left-1/2 -translate-x-1/2 text-[8px] font-bold text-primary bg-primary/15 px-2 py-0.5 rounded-full">Favorito</div>}
                              {sel && <div className="absolute top-1.5 left-1/2 -translate-x-1/2 text-[8px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full">No bilhete</div>}
                              <span className={`text-[10px] font-medium truncate w-full text-center ${(m.active || sel) ? "mt-4" : ""} ${sel ? "text-emerald-400" : "text-muted-foreground"}`}>{m.label}</span>
                              <span className={`text-2xl font-black tabular-nums ${sel ? "text-emerald-400" : m.active ? "text-primary" : "text-foreground"}`}>{m.odd.toFixed(2)}</span>
                              <span className="text-[9px] text-muted-foreground tabular-nums">{Math.round((1 / m.odd) * 100)}%</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </SectionCard>
                </RevealSection>

                {/* Gols Over/Under — só se tiver dados reais */}
                {!!fullOdds?.goalsOverUnder?.length && (
                  <RevealSection delay={20}>
                    <SectionCard>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1 h-4 rounded-full bg-emerald-500" />
                        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Gols Over/Under</h3>
                      </div>
                      <div className="space-y-1.5">
                        {fullOdds.goalsOverUnder.map((g, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-[11px] text-foreground flex-1">Mais/Menos {g.line}</span>
                            <div className="flex gap-1.5">
                              <button onClick={() => handleOdd(`${match.id}-gols-o-${i}`, `Mais ${g.line} Gols`, +g.over.toFixed(2))} className={`w-16 text-center py-1.5 rounded-lg border transition-colors ${isSelected(`${match.id}-gols-o-${i}`) ? "bg-emerald-500/20 border-emerald-500/40" : "bg-emerald-500/5 border-emerald-500/15 hover:bg-emerald-500/10"}`}><span className={`text-xs font-bold tabular-nums ${isSelected(`${match.id}-gols-o-${i}`) ? "text-emerald-300" : "text-emerald-400"}`}>{g.over.toFixed(2)}</span></button>
                              <button onClick={() => handleOdd(`${match.id}-gols-u-${i}`, `Menos ${g.line} Gols`, +g.under.toFixed(2))} className={`w-16 text-center py-1.5 rounded-lg border transition-colors ${isSelected(`${match.id}-gols-u-${i}`) ? "bg-emerald-500/20 border-emerald-500/40" : "bg-destructive/5 border-destructive/15 hover:bg-destructive/10"}`}><span className={`text-xs font-bold tabular-nums ${isSelected(`${match.id}-gols-u-${i}`) ? "text-emerald-300" : "text-destructive"}`}>{g.under.toFixed(2)}</span></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </SectionCard>
                  </RevealSection>
                )}

                {/* Handicap — só se tiver dados reais */}
                {!!fullOdds?.handicap?.length && (
                  <RevealSection delay={30}>
                    <SectionCard>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1 h-4 rounded-full bg-blue-500" />
                        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Handicap Asiático</h3>
                      </div>
                      <div className="space-y-1.5">
                        {fullOdds.handicap.map((h, i) => (
                          <button key={i} onClick={() => handleOdd(`${match.id}-hcp-${i}`, h.label, +h.odd.toFixed(2))} className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-colors ${isSelected(`${match.id}-hcp-${i}`) ? "bg-emerald-500/10 border-emerald-500/30" : "bg-blue-500/5 border-blue-500/10 hover:bg-blue-500/10"}`}>
                            <span className="text-[11px] text-foreground font-medium">{h.label}</span>
                            <span className={`text-sm font-bold tabular-nums ${isSelected(`${match.id}-hcp-${i}`) ? "text-emerald-400" : "text-blue-400"}`}>{h.odd.toFixed(2)}</span>
                          </button>
                        ))}
                      </div>
                    </SectionCard>
                  </RevealSection>
                )}

                {/* Dupla Chance — só se tiver dados reais */}
                {!!fullOdds?.doubleChance && (
                  <RevealSection delay={40}>
                    <SectionCard>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1 h-4 rounded-full bg-violet-500" />
                        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Dupla Chance</h3>
                      </div>
                      <div className="space-y-1.5">
                        {[
                          { l: `${match.teamA} ou Empate`, o: fullOdds.doubleChance.homeOrDraw },
                          { l: `${match.teamA} ou ${match.teamB}`, o: fullOdds.doubleChance.homeOrAway },
                          { l: `Empate ou ${match.teamB}`, o: fullOdds.doubleChance.drawOrAway },
                        ].map((d, i) => (
                          <button key={i} onClick={() => handleOdd(`${match.id}-dc-${i}`, d.l, +d.o.toFixed(2))} className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-colors ${isSelected(`${match.id}-dc-${i}`) ? "bg-emerald-500/10 border-emerald-500/30" : "bg-violet-500/5 border-violet-500/10 hover:bg-violet-500/10"}`}>
                            <span className="text-[11px] text-foreground font-medium">{d.l}</span>
                            <span className={`text-sm font-bold tabular-nums ${isSelected(`${match.id}-dc-${i}`) ? "text-emerald-400" : "text-violet-400"}`}>{d.o.toFixed(2)}</span>
                          </button>
                        ))}
                      </div>
                    </SectionCard>
                  </RevealSection>
                )}

                {/* 1º Tempo — só se tiver dados reais */}
                {!!fullOdds?.halfTime && (
                  <RevealSection delay={50}>
                    <SectionCard>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1 h-4 rounded-full bg-cyan-500" />
                        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">1º Tempo</h3>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: match.teamA, sub: "1T-1", odd: fullOdds.halfTime.home },
                          ...(fullOdds.halfTime.draw ? [{ label: "Empate", sub: "1T-X", odd: fullOdds.halfTime.draw }] : []),
                          { label: match.teamB, sub: "1T-2", odd: fullOdds.halfTime.away },
                        ].map((m, i) => {
                          if (!m.odd) return null;
                          const betId = `${match.id}-ht-${m.sub}`;
                          const sel = isSelected(betId);
                          return (
                            <button key={i} onClick={() => handleOdd(betId, `1T ${m.label}`, +m.odd.toFixed(2))} className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 transition-all ${sel ? "border-emerald-500 bg-emerald-500/10" : "border-border/30 bg-secondary/20 hover:border-primary/30 hover:bg-primary/5"}`}>
                              <span className={`text-[10px] font-medium truncate w-full text-center ${sel ? "text-emerald-400" : "text-muted-foreground"}`}>{m.label}</span>
                              <span className={`text-xl font-black tabular-nums ${sel ? "text-emerald-400" : "text-foreground"}`}>{m.odd.toFixed(2)}</span>
                              <span className="text-[9px] text-muted-foreground">{Math.round((1 / m.odd) * 100)}%</span>
                            </button>
                          );
                        })}
                      </div>
                    </SectionCard>
                  </RevealSection>
                )}

                {/* Escanteios — só se tiver dados reais */}
                {!!fullOdds?.corners?.length && (
                  <RevealSection delay={55}>
                    <SectionCard>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1 h-4 rounded-full bg-violet-500" />
                        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Escanteios</h3>
                      </div>
                      <div className="space-y-1.5">
                        {fullOdds.corners.map((c, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-[11px] text-foreground flex-1">Mais/Menos {c.line}</span>
                            <div className="flex gap-1.5">
                              <button onClick={() => handleOdd(`${match.id}-esc-o-${i}`, `Escanteios +${c.line}`, +c.over.toFixed(2))} className={`w-16 text-center py-1.5 rounded-lg border transition-colors ${isSelected(`${match.id}-esc-o-${i}`) ? "bg-emerald-500/20 border-emerald-500/40" : "bg-violet-500/5 border-violet-500/15 hover:bg-violet-500/10"}`}><span className={`text-xs font-bold tabular-nums ${isSelected(`${match.id}-esc-o-${i}`) ? "text-emerald-300" : "text-violet-400"}`}>{c.over.toFixed(2)}</span></button>
                              <button onClick={() => handleOdd(`${match.id}-esc-u-${i}`, `Escanteios -${c.line}`, +c.under.toFixed(2))} className={`w-16 text-center py-1.5 rounded-lg border transition-colors ${isSelected(`${match.id}-esc-u-${i}`) ? "bg-emerald-500/20 border-emerald-500/40" : "bg-violet-500/5 border-violet-500/15 hover:bg-violet-500/10"}`}><span className={`text-xs font-bold tabular-nums ${isSelected(`${match.id}-esc-u-${i}`) ? "text-emerald-300" : "text-violet-400"}`}>{c.under.toFixed(2)}</span></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </SectionCard>
                  </RevealSection>
                )}

                {/* Cartões — só se tiver dados reais */}
                {!!fullOdds?.cards?.length && (
                  <RevealSection delay={60}>
                    <SectionCard>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1 h-4 rounded-full bg-yellow-500" />
                        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Cartões</h3>
                      </div>
                      <div className="space-y-1.5">
                        {fullOdds.cards.map((c, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-[11px] text-foreground flex-1">Mais/Menos {c.line}</span>
                            <div className="flex gap-1.5">
                              <button onClick={() => handleOdd(`${match.id}-cart-o-${i}`, `Cartões +${c.line}`, +c.over.toFixed(2))} className={`w-16 text-center py-1.5 rounded-lg border transition-colors ${isSelected(`${match.id}-cart-o-${i}`) ? "bg-emerald-500/20 border-emerald-500/40" : "bg-yellow-500/5 border-yellow-500/15 hover:bg-yellow-500/10"}`}><span className={`text-xs font-bold tabular-nums ${isSelected(`${match.id}-cart-o-${i}`) ? "text-emerald-300" : "text-yellow-400"}`}>{c.over.toFixed(2)}</span></button>
                              <button onClick={() => handleOdd(`${match.id}-cart-u-${i}`, `Cartões -${c.line}`, +c.under.toFixed(2))} className={`w-16 text-center py-1.5 rounded-lg border transition-colors ${isSelected(`${match.id}-cart-u-${i}`) ? "bg-emerald-500/20 border-emerald-500/40" : "bg-yellow-500/5 border-yellow-500/15 hover:bg-yellow-500/10"}`}><span className={`text-xs font-bold tabular-nums ${isSelected(`${match.id}-cart-u-${i}`) ? "text-emerald-300" : "text-yellow-400"}`}>{c.under.toFixed(2)}</span></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </SectionCard>
                  </RevealSection>
                )}

                {/* Resultado Exato — só se tiver dados reais */}
                {(!!(fullOdds?.correctScore?.homeScores?.length || fullOdds?.correctScore?.draws?.length || fullOdds?.correctScore?.awayScores?.length)) && (
                  <RevealSection delay={65}>
                    <SectionCard>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1 h-4 rounded-full bg-cyan-500" />
                        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Resultado Exato</h3>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2">{match.teamA}</p>
                          <div className="space-y-1.5">
                            {fullOdds.correctScore.homeScores.map((r, i) => (
                              <button key={i} onClick={() => handleOdd(`${match.id}-exact-a-${i}`, `${match.teamA} ${r.s}`, +r.o.toFixed(2))} className={`w-full flex items-center justify-between p-2 rounded-lg border transition-all ${isSelected(`${match.id}-exact-a-${i}`) ? "bg-emerald-500/10 border-emerald-500/30" : "bg-secondary/20 border-border/15 hover:border-primary/20 hover:bg-primary/5"}`}>
                                <span className="text-xs text-foreground font-medium tabular-nums">{r.s}</span>
                                <span className={`text-xs font-bold tabular-nums ${isSelected(`${match.id}-exact-a-${i}`) ? "text-emerald-400" : "text-primary"}`}>{r.o.toFixed(2)}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Empate</p>
                          <div className="space-y-1.5">
                            {fullOdds.correctScore.draws.map((r, i) => (
                              <button key={i} onClick={() => handleOdd(`${match.id}-exact-e-${i}`, `Empate ${r.s}`, +r.o.toFixed(2))} className={`w-full flex items-center justify-between p-2 rounded-lg border transition-all ${isSelected(`${match.id}-exact-e-${i}`) ? "bg-emerald-500/10 border-emerald-500/30" : "bg-secondary/20 border-border/15 hover:border-primary/20 hover:bg-primary/5"}`}>
                                <span className="text-xs text-foreground font-medium tabular-nums">{r.s}</span>
                                <span className={`text-xs font-bold tabular-nums ${isSelected(`${match.id}-exact-e-${i}`) ? "text-emerald-400" : "text-foreground"}`}>{r.o.toFixed(2)}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-foreground/60 uppercase tracking-wider mb-2">{match.teamB}</p>
                          <div className="space-y-1.5">
                            {fullOdds.correctScore.awayScores.map((r, i) => (
                              <button key={i} onClick={() => handleOdd(`${match.id}-exact-b-${i}`, `${match.teamB} ${r.s}`, +r.o.toFixed(2))} className={`w-full flex items-center justify-between p-2 rounded-lg border transition-all ${isSelected(`${match.id}-exact-b-${i}`) ? "bg-emerald-500/10 border-emerald-500/30" : "bg-secondary/20 border-border/15 hover:border-primary/20 hover:bg-primary/5"}`}>
                                <span className="text-xs text-foreground font-medium tabular-nums">{r.s}</span>
                                <span className={`text-xs font-bold tabular-nums ${isSelected(`${match.id}-exact-b-${i}`) ? "text-emerald-400" : "text-foreground/70"}`}>{r.o.toFixed(2)}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </SectionCard>
                  </RevealSection>
                )}

                {/* Movimentação de Odds — só se tiver histórico real */}
                {!!fullOdds?.oddsHistory?.length && (
                  <RevealSection delay={70}>
                    <SectionCard>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-4 rounded-full bg-primary" />
                          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Movimentação de Odds</h3>
                        </div>
                        <span className="text-[9px] text-muted-foreground">{fullOdds.oddsHistory.length} registos</span>
                      </div>
                      <div className="h-[160px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={fullOdds.oddsHistory} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                            <defs>
                              <linearGradient id="oddsHome" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} /><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} /></linearGradient>
                              <linearGradient id="oddsAway" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f97316" stopOpacity={0.15} /><stop offset="95%" stopColor="#f97316" stopOpacity={0} /></linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.1)" />
                            <XAxis dataKey="time" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                            <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} domain={["auto", "auto"]} />
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="home" stroke="hsl(var(--primary))" fill="url(#oddsHome)" strokeWidth={2} name={match.teamA} />
                            <Area type="monotone" dataKey="draw" stroke="#a78bfa" fill="none" strokeWidth={1.5} strokeDasharray="4 2" name="Empate" />
                            <Area type="monotone" dataKey="away" stroke="#f97316" fill="url(#oddsAway)" strokeWidth={2} name={match.teamB} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex justify-center gap-5 mt-1">
                        <span className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground"><span className="w-2 h-2 rounded-full bg-primary" />{match.teamA}</span>
                        <span className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground"><span className="w-2 h-2 rounded-full bg-violet-400" />Empate</span>
                        <span className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground"><span className="w-2 h-2 rounded-full bg-orange-500" />{match.teamB}</span>
                      </div>
                    </SectionCard>
                  </RevealSection>
                )}

                {/* Sem odds disponíveis para esta partida */}
                {!fullOdds && (
                  <RevealSection delay={10}>
                    <div className="flex flex-col items-center py-12 gap-3 text-center">
                      <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center">
                        <LineChart className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium text-foreground">Odds não disponíveis</p>
                      <p className="text-xs text-muted-foreground max-w-[240px]">Esta partida ainda não tem odds registadas. Tente novamente mais perto do início do jogo.</p>
                    </div>
                  </RevealSection>
                )}
              </>
            )}
          </div>
        )}

        {/* ====== TAB: JOGADORES ====== */}
        {activeTab === "jogadores" && (
          <div className="space-y-5">
            <RevealSection>
              <div className="flex gap-1.5 p-1 rounded-xl bg-secondary/40">
                <button onClick={() => setSelectedTeam("home")} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${selectedTeam === "home" ? "bg-card text-foreground shadow-sm border border-border/50" : "text-muted-foreground hover:text-foreground"}`}>{match.teamA}</button>
                <button onClick={() => setSelectedTeam("away")} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${selectedTeam === "away" ? "bg-card text-foreground shadow-sm border border-border/50" : "text-muted-foreground hover:text-foreground"}`}>{match.teamB}</button>
              </div>
            </RevealSection>
            {(() => {
              const lineup = selectedTeam === "home" ? details.homeLineup : details.awayLineup;
              const allPlayers = [...lineup.players, ...lineup.substitutes];
              const topRated = [...allPlayers].sort((a, b) => b.rating - a.rating).slice(0, 3);
              const posFullName: Record<string, string> = {
                "GOL": "Goleiros", "LD": "Laterais Direitos", "LE": "Laterais Esquerdos", "ZAG": "Zagueiros",
                "VOL": "Volantes", "MC": "Meias Centrais", "MEI": "Meias", "PD": "Pontas Direita",
                "PE": "Pontas Esquerda", "CA": "Centroavantes", "ATA": "Atacantes",
                "ARM": "Armadores", "ALA": "Alas", "PIV": "Piv�s", "LIB": "L�beros",
                "Goleiro": "Goleiros", "Zagueiro": "Zagueiros", "Lateral": "Laterais",
                "Volante": "Volantes", "Meia": "Meias", "Atacante": "Atacantes",
                "Armador": "Armadores", "Ala": "Alas", "Pivo": "Piv�s",
              };
              const posSingular: Record<string, string> = {
                "GOL": "Goleiro", "LD": "Lateral Direito", "LE": "Lateral Esquerdo", "ZAG": "Zagueiro",
                "VOL": "Volante", "MC": "Meia Central", "MEI": "Meia", "PD": "Ponta Direita",
                "PE": "Ponta Esquerda", "CA": "Centroavante", "ATA": "Atacante",
                "ARM": "Armador", "ALA": "Ala", "PIV": "Piv�", "LIB": "L�bero",
              };
              const posOrder = ["GOL", "ZAG", "LD", "LE", "VOL", "MC", "MEI", "PD", "PE", "CA", "ATA", "ARM", "ALA", "PIV", "LIB", "Goleiro", "Zagueiro", "Lateral", "Volante", "Meia", "Atacante", "Armador", "Ala", "Pivo"];
              const byPosition: Record<string, Player[]> = {};
              allPlayers.forEach(p => {
                const pos = p.position || "Outros";
                if (!byPosition[pos]) byPosition[pos] = [];
                byPosition[pos].push(p);
              });
              const sortedPositions = Object.keys(byPosition).sort((a, b) => {
                const ai = posOrder.indexOf(a);
                const bi = posOrder.indexOf(b);
                return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
              });
              return (
                <div className="space-y-5">
                  {/* Top 3 highlight */}
                  <RevealSection delay={20}>
                    <div className="grid grid-cols-3 gap-3">
                      {topRated.map((p, i) => {
                        const ratingVal = p.rating;
                        const ratingColor = ratingVal >= 7.5 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : ratingVal >= 6.5 ? "text-amber-400 bg-amber-500/10 border-amber-500/20" : "text-red-400 bg-red-500/10 border-red-500/20";
                        const rankColors = ["bg-amber-500", "bg-slate-400", "bg-amber-700"];
                        return (
                          <SectionCard key={i}>
                            <div className="text-center py-2">
                              <div className={`w-7 h-7 rounded-full mx-auto flex items-center justify-center text-[10px] font-black text-white mb-2 ${rankColors[i]}`}>{i + 1}</div>
                              <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center text-lg font-bold bg-primary text-primary-foreground mb-2">{p.number}</div>
                              <p className="text-xs font-bold text-foreground truncate">{p.name}</p>
                              <p className="text-[10px] text-muted-foreground mb-2">{posSingular[p.position] || p.position}</p>
                              <span className={`inline-block text-sm font-black tabular-nums px-3 py-1 rounded-lg border ${ratingColor}`}>{p.rating}</span>
                            </div>
                          </SectionCard>
                        );
                      })}
                    </div>
                  </RevealSection>

                  {/* Squad by position */}
                  {sortedPositions.map((pos, gi) => (
                    <RevealSection key={pos} delay={40 + gi * 20}>
                      <SectionCard>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-1 h-4 rounded-full bg-primary" />
                          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">{posFullName[pos] || pos}</h3>
                          <span className="text-[10px] text-muted-foreground">{byPosition[pos].length}</span>
                        </div>
                        <div className="space-y-1">
                          {byPosition[pos].sort((a, b) => b.rating - a.rating).map((p, i) => {
                            const ratingVal = p.rating;
                            const ratingColor = ratingVal >= 7.5 ? "text-emerald-400 bg-emerald-500/10" : ratingVal >= 6.5 ? "text-amber-400 bg-amber-500/10" : "text-red-400 bg-red-500/10";
                            const isTitular = lineup.players.some(lp => lp.number === p.number && lp.name === p.name);
                            return (
                              <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/30 transition-colors group">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isTitular ? "bg-primary text-primary-foreground" : "bg-secondary/60 text-muted-foreground"}`}>{p.number}</div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <p className="text-xs font-semibold text-foreground truncate">{p.name}</p>
                                    {isTitular && <span className="text-[8px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">TIT</span>}
                                  </div>
                                  <p className="text-[10px] text-muted-foreground">{p.age ? `${p.age} anos` : ""}{p.age && p.position ? " - " : ""}{posSingular[p.position] || p.position}</p>
                                </div>
                                <span className={`text-xs font-black tabular-nums px-2 py-0.5 rounded-md ${ratingColor}`}>{p.rating}</span>
                              </div>
                            );
                          })}
                        </div>
                      </SectionCard>
                    </RevealSection>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

      </main>
      <Footer />
      <BetSlip />
    </div>
  );
};

export default Analytics;

