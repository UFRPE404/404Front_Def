import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BetSlip from "@/components/BetSlip";
import {
  TrendingUp, TrendingDown, Target, Zap, ArrowLeft,
  MapPin, User, Users, Cloud, Shirt, ArrowRightLeft, Star,
  Circle, Clock, Trophy, Info, Shield, AlertTriangle,
  CheckCircle2, BarChart3, History, LineChart, Swords,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
} from "recharts";
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getMatchById, type MatchData } from "@/data/matches";
import { getMatchDetails, type Player, type MatchEvent } from "@/data/matchDetails";
import { StatBar } from "@/components/StatBars";
import { FootballStatsView, BasketballStatsView, TennisStatsView, VolleyballStatsView } from "@/components/SportStatsViews";

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

/* --- H2H Data Generator --- */
function generateH2hData(match: MatchData) {
  const seed = match.odds[0] * 100 + match.odds[1] * 10 + match.odds[2];
  const r = (offset: number) => Math.round(((seed * (offset + 1) * 17) % 40) + 50);
  const sport = match.sport || "Futebol";
  let radarData: { stat: string; [key: string]: string | number }[];
  switch (sport) {
    case "Basquete":
      radarData = [
        { stat: "Pontos", [match.teamA]: r(10), [match.teamB]: r(11) },
        { stat: "Rebotes", [match.teamA]: r(12), [match.teamB]: r(13) },
        { stat: "Assistencias", [match.teamA]: r(14), [match.teamB]: r(15) },
        { stat: "Roubos", [match.teamA]: r(16), [match.teamB]: r(17) },
        { stat: "Bloqueios", [match.teamA]: r(18), [match.teamB]: r(19) },
        { stat: "FG%", [match.teamA]: r(20), [match.teamB]: r(21) },
      ]; break;
    case "Tenis":
      radarData = [
        { stat: "Aces", [match.teamA]: r(10), [match.teamB]: r(11) },
        { stat: "1o Saque %", [match.teamA]: r(12), [match.teamB]: r(13) },
        { stat: "Break Points", [match.teamA]: r(14), [match.teamB]: r(15) },
        { stat: "Winners", [match.teamA]: r(16), [match.teamB]: r(17) },
        { stat: "Net Points", [match.teamA]: r(18), [match.teamB]: r(19) },
        { stat: "Return %", [match.teamA]: r(20), [match.teamB]: r(21) },
      ]; break;
    case "Volei":
      radarData = [
        { stat: "Ataques", [match.teamA]: r(10), [match.teamB]: r(11) },
        { stat: "Bloqueios", [match.teamA]: r(12), [match.teamB]: r(13) },
        { stat: "Aces", [match.teamA]: r(14), [match.teamB]: r(15) },
        { stat: "Recepcao", [match.teamA]: r(16), [match.teamB]: r(17) },
        { stat: "Defesa", [match.teamA]: r(18), [match.teamB]: r(19) },
        { stat: "Saque", [match.teamA]: r(20), [match.teamB]: r(21) },
      ]; break;
    default:
      radarData = [
        { stat: "Posse", [match.teamA]: r(10), [match.teamB]: r(11) },
        { stat: "Finalizacoes", [match.teamA]: r(12), [match.teamB]: r(13) },
        { stat: "Passes", [match.teamA]: r(14), [match.teamB]: r(15) },
        { stat: "Defesa", [match.teamA]: r(16), [match.teamB]: r(17) },
        { stat: "Contra-ataques", [match.teamA]: r(18), [match.teamB]: r(19) },
        { stat: "Bolas paradas", [match.teamA]: r(20), [match.teamB]: r(21) },
      ];
  }
  return {
    radarData,
    h2hResults: [
      { date: "12/03/2025", home: match.teamA, away: match.teamB, score: "2 x 1", winner: "home" as const },
      { date: "28/11/2024", home: match.teamB, away: match.teamA, score: "0 x 0", winner: "draw" as const },
      { date: "05/08/2024", home: match.teamA, away: match.teamB, score: "1 x 3", winner: "away" as const },
      { date: "14/04/2024", home: match.teamB, away: match.teamA, score: "2 x 2", winner: "draw" as const },
      { date: "20/01/2024", home: match.teamA, away: match.teamB, score: "3 x 0", winner: "home" as const },
    ],
  };
}

/* --- Common Stats Generator --- */
function generateCommonStats(match: MatchData) {
  const sport = match.sport || "Futebol";
  const seed = match.odds[0] * 37 + match.odds[1] * 13 + match.odds[2] * 7;
  const r = (off: number, min: number, max: number) => Math.round(((seed * (off + 1) * 23) % (max - min + 1)) + min);
  switch (sport) {
    case "Basquete":
      return [
        { icon: "B", label: "Mais de 200.5 pontos", record: `${r(1,5,8)}/10`, pct: r(1,50,80) },
        { icon: "R", label: "Mais de 40 rebotes", record: `${r(2,6,9)}/10`, pct: r(2,60,90) },
        { icon: "A", label: "Mais de 22 assistencias", record: `${r(3,5,8)}/10`, pct: r(3,50,80) },
        { icon: "T", label: "Menos de 15 turnovers", record: `${r(4,4,7)}/10`, pct: r(4,40,70) },
        { icon: "Q", label: `${match.teamA} venceu 1o quarto`, record: `${r(5,4,8)}/10`, pct: r(5,40,80) },
        { icon: "Q", label: `${match.teamB} venceu 1o quarto`, record: `${r(6,3,7)}/10`, pct: r(6,30,70) },
        { icon: "M", label: "Margem > 10 pts", record: `${r(7,3,6)}/10`, pct: r(7,30,60) },
        { icon: "F", label: "FG% acima de 45%", record: `${r(8,5,8)}/10`, pct: r(8,50,80) },
      ];
    case "Tenis":
      return [
        { icon: "G", label: "Mais de 20.5 games", record: `${r(1,6,9)}/10`, pct: r(1,60,90) },
        { icon: "A", label: "Mais de 8 aces", record: `${r(2,4,7)}/10`, pct: r(2,40,70) },
        { icon: "S", label: `${match.teamA} venceu 1o set`, record: `${r(3,5,9)}/10`, pct: r(3,50,90) },
        { icon: "S", label: `${match.teamB} venceu 1o set`, record: `${r(4,4,7)}/10`, pct: r(4,40,70) },
        { icon: "T", label: "Tie-break em algum set", record: `${r(5,3,6)}/10`, pct: r(5,30,60) },
        { icon: "1", label: "1o saque acima de 65%", record: `${r(6,5,8)}/10`, pct: r(6,50,80) },
        { icon: "B", label: "Quebra de saque no 1o set", record: `${r(7,5,8)}/10`, pct: r(7,50,80) },
        { icon: "D", label: "Partida com mais de 2h", record: `${r(8,4,7)}/10`, pct: r(8,40,70) },
      ];
    case "Volei":
      return [
        { icon: "S", label: "Mais de 3.5 sets", record: `${r(1,4,7)}/10`, pct: r(1,40,70) },
        { icon: "A", label: "Mais de 5 aces", record: `${r(2,4,8)}/10`, pct: r(2,40,80) },
        { icon: "1", label: `${match.teamA} venceu 1o set`, record: `${r(3,5,8)}/10`, pct: r(3,50,80) },
        { icon: "1", label: `${match.teamB} venceu 1o set`, record: `${r(4,4,7)}/10`, pct: r(4,40,70) },
        { icon: "P", label: "Mais de 180 pts totais", record: `${r(5,5,8)}/10`, pct: r(5,50,80) },
        { icon: "B", label: "Mais de 10 bloqueios", record: `${r(6,4,7)}/10`, pct: r(6,40,70) },
        { icon: "E", label: "Eficiencia de ataque > 45%", record: `${r(7,5,8)}/10`, pct: r(7,50,80) },
        { icon: "X", label: "Menos de 20 erros", record: `${r(8,3,6)}/10`, pct: r(8,30,60) },
      ];
    default:
      return [
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
  const match = matchId ? getMatchById(decodeURIComponent(matchId)) : undefined;
  const availableTabs = getTabsForSport(match?.sport);
  const [activeTab, setActiveTab] = useState<TabKey>("resumo");
  const [selectedTeam, setSelectedTeam] = useState<"home" | "away">("home");

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
  const { radarData, h2hResults } = generateH2hData(match);
  const oddsMovement = generateOddsData(match);
  const commonStats = generateCommonStats(match);
  const avgStats = generateAvgStats(match);
  const minOdd = Math.min(...match.odds);
  const favIndex = match.odds.indexOf(minOdd);
  const favLabel = favIndex === 0 ? match.teamA : favIndex === 2 ? match.teamB : "Empate";
  const winProb = Math.round((1 / minOdd) * 100);
  const probA = Math.round((1 / match.odds[0]) * 100);
  const probDraw = Math.round((1 / match.odds[1]) * 100);
  const probB = Math.round((1 / match.odds[2]) * 100);
  const totalProb = probA + probDraw + probB;
  const normA = Math.round((probA / totalProb) * 100);
  const normDraw = Math.round((probDraw / totalProb) * 100);
  const normB = 100 - normA - normDraw;

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
            <div className="px-5 py-3 border-t border-border/30 flex items-center justify-center gap-3 bg-secondary/20">
              <div className="flex items-center gap-1.5 mr-2">
                <div className="w-5 h-5 rounded bg-amber-500/20 flex items-center justify-center"><span className="text-[9px] font-black text-amber-400">E</span></div>
                <span className="text-[9px] text-muted-foreground font-medium hidden sm:inline">Esportes da Sorte</span>
              </div>
              {[{ label: "1", value: match.odds[0] }, { label: "X", value: match.odds[1] }, { label: "2", value: match.odds[2] }].map((o) => (
                <div key={o.label} className="flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer border border-transparent hover:border-primary/30 transition-all bg-card">
                  <span className="text-[10px] font-bold text-muted-foreground">{o.label}</span>
                  <span className="text-sm font-bold text-foreground tabular-nums">{o.value.toFixed(2)}</span>
                  <span className="text-[9px] text-muted-foreground tabular-nums">({Math.round((1 / o.value) * 100)}%)</span>
                </div>
              ))}
            </div>
            <div className="px-5 py-2 border-t border-border/30 flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><User className="w-3 h-3" /> {details.referee}</span>
              <span className="flex items-center gap-1"><Cloud className="w-3 h-3" /> {details.weather} {details.temperature}</span>
              <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {details.attendance}</span>
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { icon: Trophy, label: "Competicao", value: match.league },
                      { icon: Clock, label: "Horario", value: `${match.date ? `${match.date} - ` : ""}${match.time}` },
                      { icon: MapPin, label: "Local", value: details.stadium },
                      { icon: User, label: "Arbitro", value: details.referee },
                      { icon: Cloud, label: "Clima", value: `${details.weather} - ${details.temperature}` },
                      { icon: Users, label: "Publico", value: details.attendance },
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
                          <p className="text-xs font-semibold text-foreground">{details.homeLineup.coach || "—"}</p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-secondary/30">
                          <p className="text-[10px] text-muted-foreground mb-0.5">{match.teamB}</p>
                          <p className="text-xs font-semibold text-foreground">{details.awayLineup.coach || "—"}</p>
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
                      {details.events.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">Aguardando inicio da partida...</p>
                      ) : details.events.map((ev, i) => (
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
                  <div className="space-y-1.5">
                    {[{ label: match.teamA, odds: match.odds[0], highlight: match.odds[0] === minOdd }, { label: "Empate", odds: match.odds[1], highlight: match.odds[1] === minOdd }, { label: match.teamB, odds: match.odds[2], highlight: match.odds[2] === minOdd }].map((o, idx) => (
                      <div key={idx} className={`flex items-center justify-between p-2.5 rounded-lg transition-colors ${o.highlight ? "bg-primary/5 border border-primary/20" : "bg-secondary/30"}`}>
                        <span className={`text-xs ${o.highlight ? "text-primary font-semibold" : "text-muted-foreground"}`}>{o.label}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold tabular-nums ${o.highlight ? "text-primary" : "text-foreground"}`}>{o.odds.toFixed(2)}</span>
                          <span className="text-[10px] text-muted-foreground tabular-nums">{Math.round((1 / o.odds) * 100)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
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
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                    <div className="text-center flex-1"><p className="text-sm font-bold text-foreground">{h2hResults[0].home}</p></div>
                    <div className="text-center px-3"><p className="text-lg font-bold text-foreground">{h2hResults[0].score}</p><p className="text-[9px] text-muted-foreground">{h2hResults[0].date}</p></div>
                    <div className="text-center flex-1"><p className="text-sm font-bold text-foreground">{h2hResults[0].away}</p></div>
                  </div>
                </SectionCard>
              </RevealSection>
            </div>
          </div>
        )}

        {/* ====== TAB: ESTATISTICAS ====== */}
        {activeTab === "estatisticas" && (
          <div className="space-y-5">
            {/* Live stats block — Bet365/Sofascore-style with real-time badge */}
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
                  {(!match.sport || match.sport === "Futebol") && <FootballStatsView teamA={match.teamA} teamB={match.teamB} stats={details.stats} />}
                </SectionCard>
              </RevealSection>
            )}

            {/* Season / Last 10 stats — Betano-style with category sections */}
            <RevealSection delay={match.live ? 40 : 0}>
              <SectionCard>
                <div className="flex items-center justify-between mb-1">
                  <SectionTitle icon={BarChart3}>Media - Ultimos 10 Jogos</SectionTitle>
                  <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{match.sport || "Futebol"}</span>
                </div>
                {/* Team header strip — Bet365 style */}
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
                {/* Stats grouped by category — Superbet/Sofascore approach */}
                {(() => {
                  const categories: { title: string; stats: typeof avgStats }[] = [];
                  const sport = match.sport || "Futebol";
                  if (sport === "Futebol") {
                    categories.push({ title: "Ataque", stats: avgStats.filter(s => ["Gols Marcados", "Finalizacoes", "Chutes no Alvo"].includes(s.label)) });
                    categories.push({ title: "Posse & Passes", stats: avgStats.filter(s => ["Posse de Bola %", "Passes por Jogo", "Precisao Passe %"].includes(s.label)) });
                    categories.push({ title: "Defesa", stats: avgStats.filter(s => ["Gols Sofridos", "Desarmes", "Defesas Goleiro"].includes(s.label)) });
                    categories.push({ title: "Disciplina & Outros", stats: avgStats.filter(s => ["Faltas Cometidas", "Cartoes Amarelos", "Escanteios", "Impedimentos"].includes(s.label)) });
                  } else if (sport === "Basquete") {
                    categories.push({ title: "Pontuacao", stats: avgStats.filter(s => ["Pontos por Jogo", "FG%", "3P%", "FT%"].includes(s.label)) });
                    categories.push({ title: "Rebotes", stats: avgStats.filter(s => ["Rebotes por Jogo", "Rebotes Ofensivos", "Rebotes Defensivos"].includes(s.label)) });
                    categories.push({ title: "Jogo", stats: avgStats.filter(s => ["Assistencias por Jogo", "Roubos de Bola", "Bloqueios", "Turnovers", "Faltas por Jogo"].includes(s.label)) });
                  } else if (sport === "Tenis") {
                    categories.push({ title: "Saque", stats: avgStats.filter(s => ["Aces por Partida", "Duplas Faltas", "1o Saque %", "Veloc. Media Saque"].includes(s.label)) });
                    categories.push({ title: "Retorno", stats: avgStats.filter(s => s.label.includes("Saque %") || s.label.includes("Break Points") || s.label.includes("Games")) });
                    categories.push({ title: "Performance", stats: avgStats.filter(s => ["Winners por Partida", "Erros nao Forcados", "Tie-breaks Vencidos %"].includes(s.label)) });
                  } else {
                    categories.push({ title: "Ataque", stats: avgStats.filter(s => ["Pontos por Set", "Ataques por Jogo", "Eficiencia Ataque %", "Aces por Jogo"].includes(s.label)) });
                    categories.push({ title: "Defesa", stats: avgStats.filter(s => ["Bloqueios por Jogo", "Recepcao Positiva %", "Defesas por Jogo"].includes(s.label)) });
                    categories.push({ title: "Geral", stats: avgStats.filter(s => ["Erros por Jogo", "Pontos de Saque", "Sets Vencidos %"].includes(s.label)) });
                  }
                  return categories.map((cat, ci) => (
                    <div key={ci} className={ci > 0 ? "mt-4" : ""}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-3.5 rounded-full bg-primary" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{cat.title}</span>
                      </div>
                      <div className="space-y-0">
                        {cat.stats.map((stat, i) => (
                          <StatBar key={i} label={stat.label} home={stat.home} away={stat.away} unit={(stat as { unit?: string }).unit} />
                        ))}
                      </div>
                    </div>
                  ));
                })()}
              </SectionCard>
            </RevealSection>

            {/* Form guide — Bet365 last 5 results style */}
            <RevealSection delay={match.live ? 80 : 40}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[{ team: match.teamA, isHome: true }, { team: match.teamB, isHome: false }].map(({ team, isHome }) => {
                  const seed = match.odds[0] * 37 + match.odds[isHome ? 0 : 2] * 13;
                  const results = Array.from({ length: 5 }, (_, i) => {
                    const v = Math.round(((seed * (i + 1) * 23) % 3));
                    return v === 0 ? "W" : v === 1 ? "D" : "L";
                  });
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
                        <span>{results.filter(r => r === "W").length}V {results.filter(r => r === "D").length}E {results.filter(r => r === "L").length}D</span>
                        <span className={`font-semibold ${results.filter(r => r === "W").length >= 3 ? "text-emerald-400" : results.filter(r => r === "L").length >= 3 ? "text-destructive" : "text-yellow-400"}`}>
                          {results.filter(r => r === "W").length >= 3 ? "Boa fase" : results.filter(r => r === "L").length >= 3 ? "Fase ruim" : "Irregular"}
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
            {!match.live && (
              <RevealSection>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium w-fit bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"><AlertTriangle className="w-3.5 h-3.5" /> Escalacao estimada</div>
              </RevealSection>
            )}
            <RevealSection delay={20}>
              <div className="flex gap-1.5 p-1 rounded-xl bg-secondary/40">
                <button onClick={() => setSelectedTeam("home")} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${selectedTeam === "home" ? "bg-card text-foreground shadow-sm border border-border/50" : "text-muted-foreground hover:text-foreground"}`}>{match.teamA} {(!match.sport || match.sport === "Futebol") && details.homeLineup.formation ? `(${details.homeLineup.formation})` : ""}</button>
                <button onClick={() => setSelectedTeam("away")} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${selectedTeam === "away" ? "bg-card text-foreground shadow-sm border border-border/50" : "text-muted-foreground hover:text-foreground"}`}>{match.teamB} {(!match.sport || match.sport === "Futebol") && details.awayLineup.formation ? `(${details.awayLineup.formation})` : ""}</button>
              </div>
            </RevealSection>
            {(() => {
              const lineup = selectedTeam === "home" ? details.homeLineup : details.awayLineup;
              return (!match.sport || match.sport === "Futebol") ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <RevealSection delay={40}>
                    <SectionCard>
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-semibold text-foreground">Formacao {lineup.formation}</h2>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1"><User className="w-3 h-3" /> {lineup.coach}</span>
                      </div>
                      <div className="relative w-full rounded-xl overflow-hidden" style={{ background: "linear-gradient(180deg, hsl(148, 55%, 16%) 0%, hsl(148, 50%, 20%) 50%, hsl(148, 55%, 16%) 100%)", paddingTop: "125%" }}>
                        <div className="absolute inset-0 p-3 pb-6">
                          {/* Field markings */}
                          <div className="absolute inset-4 border-2 border-white/20 rounded-lg">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-14 border-2 border-white/20 border-t-0 rounded-b-lg" />
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-6 border-2 border-white/20 border-t-0 rounded-b" />
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-36 h-14 border-2 border-white/20 border-b-0 rounded-t-lg" />
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-6 border-2 border-white/20 border-b-0 rounded-t" />
                            <div className="absolute top-1/2 left-0 right-0 border-t-2 border-white/20" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-white/20 rounded-full" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/30 rounded-full" />
                          </div>
                          {/* Player positions */}
                          {(() => {
                            const formationLines = lineup.formation.split("-").map(Number);
                            const rows: Player[][] = [];
                            let idx = 0;
                            rows.push([lineup.players[idx++]]);
                            for (const count of formationLines) { rows.push(lineup.players.slice(idx, idx + count)); idx += count; }
                            const totalRows = rows.length;
                            return rows.map((row, rowIdx) => {
                              const yPercent = 6 + (rowIdx / (totalRows - 1)) * 84;
                              return (
                                <div key={rowIdx} className="absolute left-0 right-0 flex justify-center" style={{ top: `${yPercent}%` }}>
                                  {row.map((p, pIdx) => {
                                    const total = row.length;
                                    const xOffset = total === 1 ? 50 : 12 + (pIdx / (total - 1)) * 76;
                                    const isGk = rowIdx === 0;
                                    const ratingVal = p.rating;
                                    const ratingColor = ratingVal >= 7.5 ? "bg-emerald-500" : ratingVal >= 6.5 ? "bg-amber-500" : "bg-red-500";
                                    return (
                                      <div key={pIdx} className="flex flex-col items-center group" style={{ position: "absolute", left: `${xOffset}%`, transform: "translateX(-50%)" }}>
                                        <div className={`relative w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shadow-lg transition-transform group-hover:scale-110 ${isGk ? "bg-amber-500 text-black" : "bg-primary text-primary-foreground"}`}>
                                          {p.number}
                                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-black text-white ${ratingColor} shadow-sm border border-black/20`}>{p.rating}</div>
                                        </div>
                                        <span className="text-[9px] font-bold text-white mt-1 text-center leading-tight max-w-[80px] truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{p.name.split(" ").pop()}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    </SectionCard>
                  </RevealSection>
                  <div className="space-y-4">
                    <RevealSection delay={80}>
                      <SectionCard>
                        <h3 className="text-xs font-semibold text-foreground flex items-center gap-2 mb-3"><Shirt className="w-3.5 h-3.5 text-primary" /> Titulares <span className="text-[10px] text-muted-foreground ml-auto">{lineup.players.length} jogadores</span></h3>
                        <div className="space-y-1">
                          {lineup.players.map((p, i) => {
                            const ratingVal = p.rating;
                            const ratingColor = ratingVal >= 7.5 ? "text-emerald-400 bg-emerald-500/10" : ratingVal >= 6.5 ? "text-amber-400 bg-amber-500/10" : "text-red-400 bg-red-500/10";
                            return (
                              <div key={i} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-secondary/30 transition-colors group">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${i === 0 ? "bg-amber-500/20 text-amber-400" : "bg-primary/10 text-primary"}`}>{p.number}</div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-foreground truncate">{p.name}</p>
                                  <p className="text-[10px] text-muted-foreground">{p.position} {p.age ? `- ${p.age} anos` : ""}</p>
                                </div>
                                <span className={`text-xs font-black tabular-nums px-2 py-0.5 rounded-md ${ratingColor}`}>{p.rating}</span>
                              </div>
                            );
                          })}
                        </div>
                      </SectionCard>
                    </RevealSection>
                    <RevealSection delay={120}>
                      <SectionCard>
                        <h3 className="text-xs font-semibold text-foreground flex items-center gap-2 mb-3"><ArrowRightLeft className="w-3.5 h-3.5 text-muted-foreground" /> Reservas <span className="text-[10px] text-muted-foreground ml-auto">{lineup.substitutes.length} jogadores</span></h3>
                        <div className="space-y-1">
                          {lineup.substitutes.map((p, i) => {
                            const ratingVal = p.rating;
                            const ratingColor = ratingVal >= 7.5 ? "text-emerald-400 bg-emerald-500/10" : ratingVal >= 6.5 ? "text-amber-400 bg-amber-500/10" : "text-red-400 bg-red-500/10";
                            return (
                              <div key={i} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-secondary/30 transition-colors">
                                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 bg-secondary/60 text-muted-foreground">{p.number}</div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-foreground truncate">{p.name}</p>
                                  <p className="text-[10px] text-muted-foreground">{p.position} {p.age ? `- ${p.age} anos` : ""}</p>
                                </div>
                                <span className={`text-xs font-black tabular-nums px-2 py-0.5 rounded-md ${ratingColor}`}>{p.rating}</span>
                              </div>
                            );
                          })}
                        </div>
                      </SectionCard>
                    </RevealSection>
                  </div>
                </div>
              ) : (
                <RevealSection delay={40}>
                  <SectionCard>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-sm font-semibold text-foreground">Escalacao</h2>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1"><User className="w-3 h-3" /> {lineup.coach}</span>
                    </div>
                    <div className="space-y-1.5">
                      {lineup.players.map((p, i) => {
                        const ratingVal = p.rating;
                        const ratingColor = ratingVal >= 7.5 ? "text-emerald-400 bg-emerald-500/10" : ratingVal >= 6.5 ? "text-amber-400 bg-amber-500/10" : "text-red-400 bg-red-500/10";
                        return (
                          <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold bg-primary text-primary-foreground">{p.number}</div>
                            <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-foreground">{p.name}</p><p className="text-[10px] text-muted-foreground">{p.position} - {p.age} anos</p></div>
                            <span className={`text-xs font-black tabular-nums px-2 py-0.5 rounded-md ${ratingColor}`}>{p.rating}</span>
                          </div>
                        );
                      })}
                    </div>
                  </SectionCard>
                </RevealSection>
              );
            })()}
          </div>
        )}

        {/* ====== TAB: CONFRONTOS ====== */}
        {activeTab === "confrontos" && (
          <div className="space-y-5">
            {/* H2H Summary strip */}
            <RevealSection>
              <SectionCard>
                <div className="flex items-center gap-3 mb-4">
                  <Swords className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Historico Direto</h3>
                  <span className="text-[10px] text-muted-foreground ml-auto">{h2hResults.length} jogos</span>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: match.teamA.split(" ").pop(), count: h2hResults.filter(r => r.winner === "home").length, color: "primary", bg: "bg-primary/10 border-primary/20" },
                    { label: "Empates", count: h2hResults.filter(r => r.winner === "draw").length, color: "muted", bg: "bg-secondary/30 border-border/30" },
                    { label: match.teamB.split(" ").pop(), count: h2hResults.filter(r => r.winner === "away").length, color: "foreground/70", bg: "bg-secondary/30 border-border/30" },
                  ].map((item, i) => (
                    <div key={i} className={`text-center py-3 rounded-xl border ${item.bg}`}>
                      <span className={`block text-3xl font-black tabular-nums ${i === 0 ? "text-primary" : i === 2 ? "text-foreground/70" : "text-muted-foreground"}`}>{item.count}</span>
                      <span className="text-[10px] text-muted-foreground font-medium">{item.label}</span>
                    </div>
                  ))}
                </div>
                {/* Win distribution bar */}
                {(() => {
                  const homeW = h2hResults.filter(r => r.winner === "home").length;
                  const draws = h2hResults.filter(r => r.winner === "draw").length;
                  const awayW = h2hResults.filter(r => r.winner === "away").length;
                  const total = homeW + draws + awayW || 1;
                  return (
                    <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5">
                      <div className="bg-primary rounded-l-full transition-all" style={{ width: `${(homeW/total)*100}%` }} />
                      <div className="bg-muted-foreground/30 transition-all" style={{ width: `${(draws/total)*100}%` }} />
                      <div className="bg-foreground/40 rounded-r-full transition-all" style={{ width: `${(awayW/total)*100}%` }} />
                    </div>
                  );
                })()}
              </SectionCard>
            </RevealSection>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Radar comparison */}
              <RevealSection delay={20}>
                <SectionCard>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 rounded-full bg-primary" />
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Comparacao Tecnica</h3>
                  </div>
                  <div className="aspect-square max-w-[300px] mx-auto">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="68%" data={radarData}>
                        <PolarGrid stroke="hsl(var(--border)/0.2)" gridType="polygon" />
                        <PolarAngleAxis dataKey="stat" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9, fontWeight: 600 }} />
                        <Radar name={match.teamA} dataKey={match.teamA} stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2.5} />
                        <Radar name={match.teamB} dataKey={match.teamB} stroke="#f97316" fill="#f97316" fillOpacity={0.08} strokeWidth={2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-6 mt-1">
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold"><span className="w-2.5 h-2.5 rounded-full bg-primary" />{match.teamA}</span>
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" />{match.teamB}</span>
                  </div>
                </SectionCard>
              </RevealSection>

              {/* H2H results list */}
              <RevealSection delay={40}>
                <SectionCard>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 rounded-full bg-primary" />
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Ultimos Jogos</h3>
                  </div>
                  <div className="space-y-2 max-h-[360px] overflow-y-auto thin-scrollbar pr-1">
                    {h2hResults.map((r, i) => (
                      <div key={i} className="relative rounded-xl overflow-hidden border border-border/20 hover:border-primary/20 transition-all">
                        <div className={`absolute inset-y-0 left-0 w-1 ${r.winner === "home" ? "bg-emerald-500" : r.winner === "away" ? "bg-red-500" : "bg-muted-foreground/40"}`} />
                        <div className="flex items-center gap-3 p-3 pl-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded ${r.winner === "home" ? "bg-emerald-500/10 text-emerald-400" : r.winner === "away" ? "bg-red-500/10 text-red-400" : "bg-muted text-muted-foreground"}`}>
                                {r.winner === "home" ? "VIT" : r.winner === "away" ? "DER" : "EMP"}
                              </span>
                              <span className="text-[10px] text-muted-foreground tabular-nums">{r.date}</span>
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

            {/* Patterns */}
            <RevealSection delay={60}>
              <SectionCard>
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-1 h-4 rounded-full bg-primary" />
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Padroes Relevantes</h3>
                  <span className="text-[9px] text-muted-foreground ml-auto bg-secondary px-2 py-0.5 rounded-full">{commonStats.length} padroes</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {commonStats.map((cs, i) => {
                    const pctColor = cs.pct >= 70 ? "text-emerald-400" : cs.pct >= 50 ? "text-amber-400" : "text-red-400";
                    const pctBg = cs.pct >= 70 ? "bg-emerald-500" : cs.pct >= 50 ? "bg-amber-500" : "bg-red-500";
                    const pctBorder = cs.pct >= 70 ? "border-emerald-500/20" : cs.pct >= 50 ? "border-amber-500/20" : "border-red-500/20";
                    return (
                      <div key={i} className={`relative rounded-xl border ${pctBorder} bg-card p-4 hover:shadow-md hover:shadow-primary/5 transition-all group`}>
                        <div className="flex items-start gap-3">
                          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-base shrink-0 group-hover:bg-primary/15 transition-colors">{cs.icon}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-foreground leading-tight mb-0.5">{cs.label}</p>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">{cs.record}</p>
                          </div>
                          <div className="flex flex-col items-center shrink-0">
                            <span className={`text-xl font-black tabular-nums ${pctColor}`}>{cs.pct}%</span>
                            <span className="text-[8px] text-muted-foreground uppercase tracking-wider">prob.</span>
                          </div>
                        </div>
                        <div className="mt-3 h-2 rounded-full bg-muted/20 overflow-hidden">
                          <div className={`h-full rounded-full ${pctBg} transition-all duration-1000`} style={{ width: `${cs.pct}%`, opacity: 0.7 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </SectionCard>
            </RevealSection>
          </div>
        )}

        {/* ====== TAB: ODDS ====== */}
        {activeTab === "odds" && (
          <div className="space-y-5">
            {/* Bookmaker Header */}
            <RevealSection>
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r from-amber-600/10 via-amber-500/5 to-transparent border border-amber-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center"><span className="text-lg font-black text-amber-400">E</span></div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Esportes da Sorte</h3>
                    <p className="text-[10px] text-muted-foreground">Odds atualizadas em tempo real</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-medium"><CheckCircle2 className="w-3.5 h-3.5" /> Verificado</div>
              </div>
            </RevealSection>

            {/* Resultado Final 1X2 */}
            <RevealSection delay={20}>
              <SectionCard>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Resultado Final</h3>
                  <span className="text-[9px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">1X2</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: match.teamA, sub: "1", odd: match.odds[0], active: match.odds[0] === Math.min(...match.odds) },
                    { label: "Empate", sub: "X", odd: match.odds[1], active: match.odds[1] === Math.min(...match.odds) },
                    { label: match.teamB, sub: "2", odd: match.odds[2], active: match.odds[2] === Math.min(...match.odds) },
                  ].map((m, i) => (
                    <div key={i} className={`relative flex flex-col items-center gap-1.5 pt-4 pb-4 px-2 rounded-xl cursor-pointer transition-all border-2 ${m.active ? "border-primary bg-primary/5 shadow-sm shadow-primary/10" : "border-border/30 bg-secondary/20 hover:border-primary/30 hover:bg-primary/5"}`}>
                      {m.active && <div className="absolute top-1.5 left-1/2 -translate-x-1/2 text-[8px] font-bold text-primary bg-primary/15 px-2 py-0.5 rounded-full">Favorito</div>}
                      <span className={`text-[10px] text-muted-foreground font-medium truncate w-full text-center ${m.active ? "mt-4" : ""}`}>{m.label}</span>
                      <span className={`text-2xl font-black tabular-nums ${m.active ? "text-primary" : "text-foreground"}`}>{m.odd.toFixed(2)}</span>
                      <span className="text-[9px] text-muted-foreground tabular-nums">{Math.round((1 / m.odd) * 100)}%</span>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </RevealSection>

            {/* Market categories grid */}
            <RevealSection delay={40}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Gols / Pontos */}
                <SectionCard>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 rounded-full bg-emerald-500" />
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">{match.sport === "Basquete" ? "Total de Pontos" : match.sport === "Volei" ? "Total de Sets" : match.sport === "Tenis" ? "Total de Games" : "Gols"}</h3>
                  </div>
                  {(() => {
                    const lines = match.sport === "Basquete"
                      ? [{ l: "Mais/Menos 190.5", o: +(1.65+(match.odds[0]%0.08)).toFixed(2), u: +(2.15-(match.odds[0]%0.08)).toFixed(2) }, { l: "Mais/Menos 200.5", o: +(1.85+(match.odds[1]%0.07)).toFixed(2), u: +(1.95-(match.odds[1]%0.06)).toFixed(2) }, { l: "Mais/Menos 210.5", o: +(2.10+(match.odds[2]%0.09)).toFixed(2), u: +(1.72-(match.odds[2]%0.05)).toFixed(2) }, { l: "Mais/Menos 220.5", o: +(2.55+(match.odds[0]%0.12)).toFixed(2), u: +(1.48+(match.odds[1]%0.04)).toFixed(2) }]
                      : match.sport === "Tenis"
                      ? [{ l: "Mais/Menos 20.5 games", o: +(1.78+(match.odds[0]%0.08)).toFixed(2), u: +(2.02-(match.odds[0]%0.07)).toFixed(2) }, { l: "Mais/Menos 22.5 games", o: +(2.05+(match.odds[1]%0.09)).toFixed(2), u: +(1.75-(match.odds[1]%0.06)).toFixed(2) }, { l: "Mais/Menos 2.5 sets", o: +(1.60+(match.odds[2]%0.08)).toFixed(2), u: +(2.20-(match.odds[2]%0.07)).toFixed(2) }]
                      : match.sport === "Volei"
                      ? [{ l: "Mais/Menos 3.5 sets", o: +(1.88+(match.odds[0]%0.07)).toFixed(2), u: +(1.92-(match.odds[0]%0.06)).toFixed(2) }, { l: "Mais/Menos 170.5 pts", o: +(1.80+(match.odds[1]%0.08)).toFixed(2), u: +(2.00-(match.odds[1]%0.07)).toFixed(2) }, { l: "Mais/Menos 180.5 pts", o: +(2.15+(match.odds[2]%0.09)).toFixed(2), u: +(1.65-(match.odds[2]%0.04)).toFixed(2) }]
                      : [{ l: "Mais/Menos 0.5", o: +(1.12+(match.odds[0]%0.04)).toFixed(2), u: +(5.80-(match.odds[0]%0.3)).toFixed(2) }, { l: "Mais/Menos 1.5", o: +(1.32+(match.odds[0]%0.08)).toFixed(2), u: +(3.20-(match.odds[0]%0.15)).toFixed(2) }, { l: "Mais/Menos 2.5", o: +(1.85+(match.odds[1]%0.07)).toFixed(2), u: +(1.95-(match.odds[1]%0.06)).toFixed(2) }, { l: "Mais/Menos 3.5", o: +(2.75+(match.odds[2]%0.12)).toFixed(2), u: +(1.40+(match.odds[2]%0.04)).toFixed(2) }, { l: "Mais/Menos 4.5", o: +(4.20+(match.odds[0]%0.2)).toFixed(2), u: +(1.18+(match.odds[1]%0.03)).toFixed(2) }];
                    return (
                      <div className="space-y-1.5">
                        {lines.map((m, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-[11px] text-foreground flex-1 truncate">{m.l}</span>
                            <div className="flex gap-1.5">
                              <div className="w-16 text-center py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/15 cursor-pointer hover:bg-emerald-500/10 transition-colors"><span className="text-xs font-bold text-emerald-400 tabular-nums">{m.o}</span></div>
                              <div className="w-16 text-center py-1.5 rounded-lg bg-destructive/5 border border-destructive/15 cursor-pointer hover:bg-destructive/10 transition-colors"><span className="text-xs font-bold text-destructive tabular-nums">{m.u}</span></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </SectionCard>

                {/* Handicap */}
                <SectionCard>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 rounded-full bg-blue-500" />
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Handicap</h3>
                  </div>
                  {(() => {
                    const hcp = match.sport === "Basquete"
                      ? [{ l: `${match.teamA} -3.5`, o: +(1.90+(match.odds[0]%0.07)).toFixed(2) }, { l: `${match.teamB} +3.5`, o: +(1.90-(match.odds[0]%0.06)).toFixed(2) }, { l: `${match.teamA} -7.5`, o: +(2.25+(match.odds[1]%0.08)).toFixed(2) }, { l: `${match.teamB} +7.5`, o: +(1.62-(match.odds[1]%0.05)).toFixed(2) }]
                      : match.sport === "Tenis"
                      ? [{ l: `${match.teamA} -2.5 games`, o: +(1.85+(match.odds[0]%0.06)).toFixed(2) }, { l: `${match.teamB} +2.5 games`, o: +(1.95-(match.odds[0]%0.07)).toFixed(2) }, { l: `${match.teamA} -4.5 games`, o: +(2.30+(match.odds[1]%0.09)).toFixed(2) }, { l: `${match.teamB} +4.5 games`, o: +(1.55-(match.odds[1]%0.04)).toFixed(2) }]
                      : match.sport === "Volei"
                      ? [{ l: `${match.teamA} -1.5 sets`, o: +(2.10+(match.odds[0]%0.08)).toFixed(2) }, { l: `${match.teamB} +1.5 sets`, o: +(1.70-(match.odds[0]%0.06)).toFixed(2) }, { l: `${match.teamA} Handicap -4.5`, o: +(1.88+(match.odds[1]%0.07)).toFixed(2) }, { l: `${match.teamB} Handicap +4.5`, o: +(1.92-(match.odds[1]%0.06)).toFixed(2) }]
                      : [{ l: `${match.teamA} -0.5`, o: +(match.odds[0]).toFixed(2) }, { l: `${match.teamB} +0.5`, o: +(1/(1/match.odds[1]+1/match.odds[2])).toFixed(2) }, { l: `${match.teamA} -1.5`, o: +(match.odds[0]*1.45).toFixed(2) }, { l: `${match.teamB} +1.5`, o: +(1/(1/(match.odds[0]*1.45))*0.52).toFixed(2) }];
                    return (
                      <div className="space-y-1.5">
                        {hcp.map((m, i) => (
                          <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-blue-500/5 border border-blue-500/10 cursor-pointer hover:bg-blue-500/10 transition-colors">
                            <span className="text-[11px] text-foreground font-medium">{m.l}</span>
                            <span className="text-sm font-bold text-blue-400 tabular-nums">{m.o}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </SectionCard>

                {/* Escanteios (Futebol only) */}
                {(!match.sport || match.sport === "Futebol") && (
                  <SectionCard>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-4 rounded-full bg-violet-500" />
                      <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Escanteios</h3>
                    </div>
                    <div className="space-y-1.5">
                      {[
                        { l: "Mais/Menos 8.5", o: +(1.75+(match.odds[0]%0.07)).toFixed(2), u: +(2.05-(match.odds[0]%0.06)).toFixed(2) },
                        { l: "Mais/Menos 9.5", o: +(1.90+(match.odds[1]%0.08)).toFixed(2), u: +(1.90-(match.odds[1]%0.07)).toFixed(2) },
                        { l: "Mais/Menos 10.5", o: +(2.15+(match.odds[2]%0.09)).toFixed(2), u: +(1.68-(match.odds[2]%0.05)).toFixed(2) },
                        { l: "Mais/Menos 11.5", o: +(2.50+(match.odds[0]%0.12)).toFixed(2), u: +(1.50+(match.odds[1]%0.04)).toFixed(2) },
                      ].map((m, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-[11px] text-foreground flex-1 truncate">{m.l}</span>
                          <div className="flex gap-1.5">
                            <div className="w-16 text-center py-1.5 rounded-lg bg-violet-500/5 border border-violet-500/15 cursor-pointer hover:bg-violet-500/10 transition-colors"><span className="text-xs font-bold text-violet-400 tabular-nums">{m.o}</span></div>
                            <div className="w-16 text-center py-1.5 rounded-lg bg-violet-500/5 border border-violet-500/15 cursor-pointer hover:bg-violet-500/10 transition-colors"><span className="text-xs font-bold text-violet-400 tabular-nums">{m.u}</span></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                )}

                {/* Cartoes (Futebol only) */}
                {(!match.sport || match.sport === "Futebol") && (
                  <SectionCard>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-4 rounded-full bg-yellow-500" />
                      <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Cartoes</h3>
                    </div>
                    <div className="space-y-1.5">
                      {[
                        { l: "Mais/Menos 3.5", o: +(1.70+(match.odds[0]%0.06)).toFixed(2), u: +(2.10-(match.odds[0]%0.07)).toFixed(2) },
                        { l: "Mais/Menos 4.5", o: +(1.90+(match.odds[1]%0.07)).toFixed(2), u: +(1.90-(match.odds[1]%0.06)).toFixed(2) },
                        { l: "Mais/Menos 5.5", o: +(2.25+(match.odds[2]%0.09)).toFixed(2), u: +(1.60-(match.odds[2]%0.04)).toFixed(2) },
                      ].map((m, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-[11px] text-foreground flex-1 truncate">{m.l}</span>
                          <div className="flex gap-1.5">
                            <div className="w-16 text-center py-1.5 rounded-lg bg-yellow-500/5 border border-yellow-500/15 cursor-pointer hover:bg-yellow-500/10 transition-colors"><span className="text-xs font-bold text-yellow-400 tabular-nums">{m.o}</span></div>
                            <div className="w-16 text-center py-1.5 rounded-lg bg-yellow-500/5 border border-yellow-500/15 cursor-pointer hover:bg-yellow-500/10 transition-colors"><span className="text-xs font-bold text-yellow-400 tabular-nums">{m.u}</span></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                )}

                {/* Quartos (Basquete only) */}
                {match.sport === "Basquete" && (
                  <SectionCard>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-4 rounded-full bg-orange-500" />
                      <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Quartos</h3>
                    </div>
                    <div className="space-y-1.5">
                      {[
                        { l: `${match.teamA} vence 1Q`, o: +(1.75+(match.odds[0]%0.12)).toFixed(2) },
                        { l: `${match.teamB} vence 1Q`, o: +(2.05+(match.odds[2]%0.08)).toFixed(2) },
                        { l: "Empate 1Q", o: +(6.50+(match.odds[1]%0.3)).toFixed(2) },
                        { l: `${match.teamA} vence 1T`, o: +(1.65+(match.odds[0]%0.1)).toFixed(2) },
                        { l: `${match.teamB} vence 1T`, o: +(2.15+(match.odds[2]%0.1)).toFixed(2) },
                      ].map((m, i) => (
                        <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-orange-500/5 border border-orange-500/10 cursor-pointer hover:bg-orange-500/10 transition-colors">
                          <span className="text-[11px] text-foreground font-medium">{m.l}</span>
                          <span className="text-sm font-bold text-orange-400 tabular-nums">{m.o}</span>
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                )}
              </div>
            </RevealSection>

            {/* Mercados Especiais */}
            <RevealSection delay={60}>
              <SectionCard>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 rounded-full bg-primary" />
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Mercados Especiais</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(() => {
                    const sp = match.sport === "Basquete"
                      ? [{ l: "Par", o: +(1.90+(match.odds[0]%0.04)).toFixed(2) }, { l: "Impar", o: +(1.90-(match.odds[0]%0.04)).toFixed(2) }, { l: `${match.teamA} +10.5`, o: +(1.35+(match.odds[0]%0.05)).toFixed(2) }, { l: `${match.teamB} +10.5`, o: +(1.45+(match.odds[2]%0.06)).toFixed(2) }, { l: "Overtime", o: +(8.00+(match.odds[1]%0.5)).toFixed(2) }, { l: "Margem 1-5 pts", o: +(3.80+(match.odds[1]%0.15)).toFixed(2) }]
                      : match.sport === "Tenis"
                      ? [{ l: `${match.teamA} 2-0`, o: +(2.10+(match.odds[0]%0.15)).toFixed(2) }, { l: `${match.teamA} 2-1`, o: +(3.20+(match.odds[0]%0.12)).toFixed(2) }, { l: `${match.teamB} 2-0`, o: +(2.80+(match.odds[2]%0.15)).toFixed(2) }, { l: `${match.teamB} 2-1`, o: +(3.50+(match.odds[2]%0.12)).toFixed(2) }, { l: "Tie-break", o: +(1.70+(match.odds[1]%0.08)).toFixed(2) }, { l: "Sem tie-break", o: +(2.10-(match.odds[1]%0.07)).toFixed(2) }]
                      : match.sport === "Volei"
                      ? [{ l: `${match.teamA} 3-0`, o: +(3.50+(match.odds[0]%0.15)).toFixed(2) }, { l: `${match.teamA} 3-1`, o: +(3.20+(match.odds[0]%0.12)).toFixed(2) }, { l: `${match.teamA} 3-2`, o: +(4.50+(match.odds[0]%0.18)).toFixed(2) }, { l: `${match.teamB} 3-0`, o: +(4.00+(match.odds[2]%0.15)).toFixed(2) }, { l: `${match.teamB} 3-1`, o: +(3.80+(match.odds[2]%0.12)).toFixed(2) }, { l: `${match.teamB} 3-2`, o: +(5.00+(match.odds[2]%0.18)).toFixed(2) }]
                      : [{ l: "Ambas Marcam Sim", o: +(1.75+(match.odds[0]%0.07)).toFixed(2) }, { l: "Ambas Marcam Nao", o: +(2.00-(match.odds[0]%0.06)).toFixed(2) }, { l: "Dupla Chance 1X", o: +(1.18+(match.odds[0]%0.04)).toFixed(2) }, { l: "Dupla Chance 12", o: +(1.22+(match.odds[1]%0.04)).toFixed(2) }, { l: "Dupla Chance X2", o: +(1.30+(match.odds[2]%0.05)).toFixed(2) }, { l: `1o Gol ${match.teamA}`, o: +(1.70+(match.odds[0]%0.1)).toFixed(2) }, { l: `1o Gol ${match.teamB}`, o: +(2.10+(match.odds[2]%0.08)).toFixed(2) }, { l: "Sem Gols", o: +(6.00+(match.odds[1]%0.4)).toFixed(2) }, { l: `${match.teamA} Vence 1T`, o: +(2.30+(match.odds[0]%0.12)).toFixed(2) }, { l: "Empate 1T", o: +(1.85+(match.odds[1]%0.08)).toFixed(2) }, { l: `${match.teamB} Vence 1T`, o: +(3.10+(match.odds[2]%0.15)).toFixed(2) }, { l: "Gol no 1T", o: +(1.40+(match.odds[0]%0.05)).toFixed(2) }];
                    return sp.map((m, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border/20 cursor-pointer hover:border-primary/20 hover:bg-primary/5 transition-all group">
                        <span className="text-[11px] text-foreground group-hover:text-primary transition-colors">{m.l}</span>
                        <span className="text-sm font-bold text-primary tabular-nums">{m.o}</span>
                      </div>
                    ));
                  })()}
                </div>
              </SectionCard>
            </RevealSection>

            {/* Resultado Exato (Futebol only) */}
            {(!match.sport || match.sport === "Futebol") && (
              <RevealSection delay={80}>
                <SectionCard>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 rounded-full bg-cyan-500" />
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Resultado Exato</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2">{match.teamA}</p>
                      <div className="space-y-1.5">
                        {[{ s: "1-0", o: +(6.50+(match.odds[0]%0.4)).toFixed(2) }, { s: "2-0", o: +(9.00+(match.odds[0]%0.5)).toFixed(2) }, { s: "2-1", o: +(7.50+(match.odds[0]%0.35)).toFixed(2) }, { s: "3-0", o: +(16.00+(match.odds[0]%0.8)).toFixed(2) }, { s: "3-1", o: +(12.00+(match.odds[0]%0.6)).toFixed(2) }].map((r, i) => (
                          <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-secondary/20 border border-border/15 cursor-pointer hover:border-primary/20 hover:bg-primary/5 transition-all">
                            <span className="text-xs text-foreground font-medium tabular-nums">{r.s}</span>
                            <span className="text-xs font-bold text-primary tabular-nums">{r.o}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Empate</p>
                      <div className="space-y-1.5">
                        {[{ s: "0-0", o: +(8.00+(match.odds[1]%0.5)).toFixed(2) }, { s: "1-1", o: +(5.50+(match.odds[1]%0.3)).toFixed(2) }, { s: "2-2", o: +(12.00+(match.odds[1]%0.6)).toFixed(2) }, { s: "3-3", o: +(35.00+(match.odds[1]%1.5)).toFixed(2) }].map((r, i) => (
                          <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-secondary/20 border border-border/15 cursor-pointer hover:border-primary/20 hover:bg-primary/5 transition-all">
                            <span className="text-xs text-foreground font-medium tabular-nums">{r.s}</span>
                            <span className="text-xs font-bold text-foreground tabular-nums">{r.o}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-foreground/60 uppercase tracking-wider mb-2">{match.teamB}</p>
                      <div className="space-y-1.5">
                        {[{ s: "0-1", o: +(7.00+(match.odds[2]%0.4)).toFixed(2) }, { s: "0-2", o: +(10.00+(match.odds[2]%0.5)).toFixed(2) }, { s: "1-2", o: +(8.50+(match.odds[2]%0.4)).toFixed(2) }, { s: "0-3", o: +(18.00+(match.odds[2]%0.8)).toFixed(2) }, { s: "1-3", o: +(14.00+(match.odds[2]%0.7)).toFixed(2) }].map((r, i) => (
                          <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-secondary/20 border border-border/15 cursor-pointer hover:border-primary/20 hover:bg-primary/5 transition-all">
                            <span className="text-xs text-foreground font-medium tabular-nums">{r.s}</span>
                            <span className="text-xs font-bold text-foreground/70 tabular-nums">{r.o}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </SectionCard>
              </RevealSection>
            )}

            {/* Odds movement mini */}
            <RevealSection delay={(!match.sport || match.sport === "Futebol") ? 100 : 80}>
              <SectionCard>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 rounded-full bg-primary" />
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Movimentacao</h3>
                  </div>
                  <span className="text-[9px] text-muted-foreground">Ultimas 12h</span>
                </div>
                <div className="h-[160px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={oddsMovement} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                      <defs>
                        <linearGradient id="oddsHome" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} /><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} /></linearGradient>
                        <linearGradient id="oddsAway" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f97316" stopOpacity={0.15} /><stop offset="95%" stopColor="#f97316" stopOpacity={0} /></linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.1)" />
                      <XAxis dataKey="time" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} domain={["auto", "auto"]} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="home" stroke="hsl(var(--primary))" fill="url(#oddsHome)" strokeWidth={2} name={match.teamA} />
                      <Area type="monotone" dataKey="away" stroke="#f97316" fill="url(#oddsAway)" strokeWidth={2} name={match.teamB} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-5 mt-1">
                  <span className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground"><span className="w-2 h-2 rounded-full bg-primary" />{match.teamA}</span>
                  <span className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground"><span className="w-2 h-2 rounded-full bg-orange-500" />{match.teamB}</span>
                </div>
              </SectionCard>
            </RevealSection>
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
                "ARM": "Armadores", "ALA": "Alas", "PIV": "Pivôs", "LIB": "Líberos",
                "Goleiro": "Goleiros", "Zagueiro": "Zagueiros", "Lateral": "Laterais",
                "Volante": "Volantes", "Meia": "Meias", "Atacante": "Atacantes",
                "Armador": "Armadores", "Ala": "Alas", "Pivo": "Pivôs",
              };
              const posSingular: Record<string, string> = {
                "GOL": "Goleiro", "LD": "Lateral Direito", "LE": "Lateral Esquerdo", "ZAG": "Zagueiro",
                "VOL": "Volante", "MC": "Meia Central", "MEI": "Meia", "PD": "Ponta Direita",
                "PE": "Ponta Esquerda", "CA": "Centroavante", "ATA": "Atacante",
                "ARM": "Armador", "ALA": "Ala", "PIV": "Pivô", "LIB": "Líbero",
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
