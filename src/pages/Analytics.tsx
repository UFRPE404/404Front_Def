import Navbar from "@/components/Navbar";
import futDataLogo from "@/assets/png_fut_data.png";
import Footer from "@/components/Footer";
import BetSlip from "@/components/BetSlip";
import {
  TrendingUp, TrendingDown, Target, Zap, ArrowLeft,
  MapPin, User, Users, Cloud, Shirt, ArrowRightLeft, Star,
  Circle, Clock, Trophy, CalendarDays, Info, Shield, AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
} from "recharts";
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getMatchById, type MatchData } from "@/data/matches";
import { getMatchDetails, type Player, type MatchEvent } from "@/data/matchDetails";
import { StatBar } from "@/components/StatBars";
import { FootballStatsView, BasketballStatsView, TennisStatsView, VolleyballStatsView } from "@/components/SportStatsViews";

/* ─── Reveal animation ─── */
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
      transform: visible ? "translateY(0)" : "translateY(16px)",
      filter: visible ? "blur(0)" : "blur(3px)",
      transition: `opacity 0.5s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.5s cubic-bezier(0.16,1,0.3,1) ${delay}ms, filter 0.5s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

/* ─── Tooltip ─── */
interface TooltipPayloadEntry {
  name: string;
  value: number | string;
  color: string;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipPayloadEntry[]; label?: string }) => {
  if (!active || !payload) return null;
  return (
    <div className="match-card !p-3 text-xs space-y-1">
      <p className="font-semibold text-foreground">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: <span className="font-bold">{p.value}</span></p>
      ))}
    </div>
  );
};

/* ─── Event Icon ─── */
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

/* ─── Player Card ─── */
const PlayerCard = ({ player, compact }: { player: Player; compact?: boolean }) => {
  const ratingColor = player.rating >= 8 ? "text-primary" : player.rating >= 7 ? "text-foreground" : "text-muted-foreground";
  if (compact) {
    return (
      <div className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-secondary/50 transition-colors">
        <span className="text-xs text-muted-foreground w-5 text-center font-mono">{player.number}</span>
        <span className="text-sm text-foreground flex-1">{player.name}</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded text-muted-foreground" style={{ background: "hsl(var(--secondary))" }}>{player.position}</span>
        <span className={`text-xs font-bold ${ratingColor} w-7 text-right`}>{player.rating}</span>
      </div>
    );
  }
  return (
    <div className="match-card !p-3 flex items-center gap-3 group hover:ring-1 hover:ring-primary/30 transition-all">
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ background: "hsl(var(--primary) / 0.15)", color: "hsl(var(--primary))" }}>
        {player.number}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground truncate">{player.name}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded shrink-0" style={{ background: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))" }}>{player.position}</span>
        </div>
        <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
          <span>{player.age} anos</span>
          <span>⚽ {player.goals}</span>
          <span>🅰️ {player.assists}</span>
          <span className="text-yellow-400">🟨 {player.yellowCards}</span>
          {player.redCards > 0 && <span className="text-destructive">🟥 {player.redCards}</span>}
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className={`text-lg font-bold ${ratingColor}`}>{player.rating}</div>
        <div className="text-[9px] text-muted-foreground">{player.minutesPlayed}'</div>
      </div>
    </div>
  );
};

/* ─── H2H Data Generator ─── */
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
        { stat: "Assistências", [match.teamA]: r(14), [match.teamB]: r(15) },
        { stat: "Roubos", [match.teamA]: r(16), [match.teamB]: r(17) },
        { stat: "Bloqueios", [match.teamA]: r(18), [match.teamB]: r(19) },
        { stat: "FG%", [match.teamA]: r(20), [match.teamB]: r(21) },
      ];
      break;
    case "Tênis":
      radarData = [
        { stat: "Aces", [match.teamA]: r(10), [match.teamB]: r(11) },
        { stat: "1º Saque %", [match.teamA]: r(12), [match.teamB]: r(13) },
        { stat: "Break Points", [match.teamA]: r(14), [match.teamB]: r(15) },
        { stat: "Winners", [match.teamA]: r(16), [match.teamB]: r(17) },
        { stat: "Net Points", [match.teamA]: r(18), [match.teamB]: r(19) },
        { stat: "Return %", [match.teamA]: r(20), [match.teamB]: r(21) },
      ];
      break;
    case "Vôlei":
      radarData = [
        { stat: "Ataques", [match.teamA]: r(10), [match.teamB]: r(11) },
        { stat: "Bloqueios", [match.teamA]: r(12), [match.teamB]: r(13) },
        { stat: "Aces", [match.teamA]: r(14), [match.teamB]: r(15) },
        { stat: "Recepção", [match.teamA]: r(16), [match.teamB]: r(17) },
        { stat: "Defesa", [match.teamA]: r(18), [match.teamB]: r(19) },
        { stat: "Saque", [match.teamA]: r(20), [match.teamB]: r(21) },
      ];
      break;
    default:
      radarData = [
        { stat: "Posse", [match.teamA]: r(10), [match.teamB]: r(11) },
        { stat: "Finalizações", [match.teamA]: r(12), [match.teamB]: r(13) },
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

/* ─── Common Stats Generator (patterns across both teams' last N games) ─── */
function generateCommonStats(match: MatchData) {
  const sport = match.sport || "Futebol";
  const seed = match.odds[0] * 37 + match.odds[1] * 13 + match.odds[2] * 7;
  const r = (off: number, min: number, max: number) => Math.round(((seed * (off + 1) * 23) % (max - min + 1)) + min);

  switch (sport) {
    case "Basquete":
      return [
        { icon: "🏀", label: "Mais de 200.5 pontos", record: `${r(1,5,8)}/10`, teams: "both" },
        { icon: "📊", label: "Mais de 40 rebotes", record: `${r(2,6,9)}/10`, teams: "both" },
        { icon: "🎯", label: "Mais de 22 assistências", record: `${r(3,5,8)}/10`, teams: "both" },
        { icon: "🔄", label: "Menos de 15 turnovers", record: `${r(4,4,7)}/10`, teams: "both" },
        { icon: "💪", label: `${match.teamA} venceu o 1º quarto`, record: `${r(5,4,8)}/10`, teams: "home" },
        { icon: "🏆", label: `${match.teamB} venceu o 1º quarto`, record: `${r(6,3,7)}/10`, teams: "away" },
        { icon: "📈", label: "Margem de vitória > 10 pts", record: `${r(7,3,6)}/10`, teams: "both" },
        { icon: "🎯", label: "FG% acima de 45%", record: `${r(8,5,8)}/10`, teams: "both" },
      ];
    case "Tênis":
      return [
        { icon: "🎾", label: "Mais de 20.5 games", record: `${r(1,6,9)}/10`, teams: "both" },
        { icon: "💥", label: "Mais de 8 aces", record: `${r(2,4,7)}/10`, teams: "both" },
        { icon: "🏆", label: `${match.teamA} venceu 1º set`, record: `${r(3,5,9)}/10`, teams: "home" },
        { icon: "🏆", label: `${match.teamB} venceu 1º set`, record: `${r(4,4,7)}/10`, teams: "away" },
        { icon: "📊", label: "Tie-break em algum set", record: `${r(5,3,6)}/10`, teams: "both" },
        { icon: "⚡", label: "1º saque acima de 65%", record: `${r(6,5,8)}/10`, teams: "both" },
        { icon: "🔄", label: "Quebra de saque no 1º set", record: `${r(7,5,8)}/10`, teams: "both" },
        { icon: "⏱️", label: "Partida com mais de 2h", record: `${r(8,4,7)}/10`, teams: "both" },
      ];
    case "Vôlei":
      return [
        { icon: "🏐", label: "Mais de 3.5 sets", record: `${r(1,4,7)}/10`, teams: "both" },
        { icon: "💥", label: "Mais de 5 aces", record: `${r(2,4,8)}/10`, teams: "both" },
        { icon: "🏆", label: `${match.teamA} venceu 1º set`, record: `${r(3,5,8)}/10`, teams: "home" },
        { icon: "🏆", label: `${match.teamB} venceu 1º set`, record: `${r(4,4,7)}/10`, teams: "away" },
        { icon: "📊", label: "Mais de 180 pontos totais", record: `${r(5,5,8)}/10`, teams: "both" },
        { icon: "🛡️", label: "Mais de 10 bloqueios", record: `${r(6,4,7)}/10`, teams: "both" },
        { icon: "⚡", label: "Eficiência de ataque > 45%", record: `${r(7,5,8)}/10`, teams: "both" },
        { icon: "🎯", label: "Menos de 20 erros", record: `${r(8,3,6)}/10`, teams: "both" },
      ];
    default: // Futebol
      return [
        { icon: "⚽", label: "Mais de 2.5 gols", record: `${r(1,4,8)}/10`, teams: "both" },
        { icon: "⚽", label: "Ambas marcaram", record: `${r(2,5,8)}/10`, teams: "both" },
        { icon: "🟨", label: "Mais de 3.5 cartões", record: `${r(3,5,8)}/10`, teams: "both" },
        { icon: "🟨", label: "Menos de 4.5 cartões", record: `${r(9,5,9)}/10`, teams: "both" },
        { icon: "📐", label: "Menos de 10.5 escanteios", record: `${r(4,4,7)}/10`, teams: "both" },
        { icon: "📐", label: "Mais de 8.5 escanteios", record: `${r(10,4,8)}/10`, teams: "both" },
        { icon: "🏆", label: `${match.teamA} venceu 1º tempo`, record: `${r(5,3,7)}/10`, teams: "home" },
        { icon: "🏆", label: `${match.teamB} venceu 1º tempo`, record: `${r(6,3,6)}/10`, teams: "away" },
        { icon: "🥅", label: "Sem sofrer gols", record: `${r(7,2,5)}/10`, teams: "home" },
        { icon: "⚡", label: "Primeiro a marcar", record: `${r(8,5,9)}/10`, teams: "home" },
        { icon: "⚡", label: "Primeiro a marcar", record: `${r(11,4,7)}/10`, teams: "away" },
      ];
  }
}

/* ─── Average Stats Generator (last 10 games per team) ─── */
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
        { label: "Assistências por Jogo", home: r(5,20,30), away: r(6,20,30) },
        { label: "Roubos de Bola", home: r(7,5,10), away: r(8,5,10) },
        { label: "Bloqueios", home: r(9,3,7), away: r(10,3,7) },
        { label: "Turnovers", home: r(11,10,17), away: r(12,10,17) },
        { label: "FG%", home: r(13,42,50), away: r(14,42,50), unit: "%" },
        { label: "3P%", home: r(15,30,42), away: r(16,30,42), unit: "%" },
        { label: "FT%", home: r(17,72,88), away: r(18,72,88), unit: "%" },
        { label: "Rebotes Ofensivos", home: r(19,8,14), away: r(20,8,14) },
        { label: "Rebotes Defensivos", home: r(21,28,38), away: r(22,28,38) },
        { label: "Faltas por Jogo", home: r(23,18,24), away: r(24,18,24) },
        { label: "Pontos no 1Q", home: r(25,22,32), away: r(26,22,32) },
        { label: "Pontos no Paint", home: r(27,38,52), away: r(28,38,52) },
      ];
    case "Tênis":
      return [
        { label: "Aces por Partida", home: r(1,4,14), away: r(2,4,14) },
        { label: "Duplas Faltas", home: r(3,1,5), away: r(4,1,5) },
        { label: "1º Saque %", home: r(5,58,72), away: r(6,58,72), unit: "%" },
        { label: "Pontos no 1º Saque %", home: r(7,68,82), away: r(8,68,82), unit: "%" },
        { label: "Pontos no 2º Saque %", home: r(9,45,58), away: r(10,45,58), unit: "%" },
        { label: "Break Points Salvos %", home: r(11,55,75), away: r(12,55,75), unit: "%" },
        { label: "Break Points Conv. %", home: r(13,35,55), away: r(14,35,55), unit: "%" },
        { label: "Winners por Partida", home: r(15,20,42), away: r(16,20,42) },
        { label: "Erros não Forçados", home: r(17,15,35), away: r(18,15,35) },
        { label: "Veloc. Média do Saque", home: r(19,180,215), away: r(20,180,215) },
        { label: "Games Vencidos %", home: r(21,55,72), away: r(22,55,72), unit: "%" },
        { label: "Tie-breaks Vencidos %", home: r(23,45,70), away: r(24,45,70), unit: "%" },
      ];
    case "Vôlei":
      return [
        { label: "Pontos por Set", home: r(1,22,26), away: r(2,22,26) },
        { label: "Ataques por Jogo", home: r(3,45,65), away: r(4,45,65) },
        { label: "Eficiência de Ataque %", home: r(5,40,55), away: r(6,40,55), unit: "%" },
        { label: "Aces por Jogo", home: r(7,3,8), away: r(8,3,8) },
        { label: "Bloqueios por Jogo", home: r(9,6,14), away: r(10,6,14) },
        { label: "Erros por Jogo", home: r(11,12,22), away: r(12,12,22) },
        { label: "Recepção Positiva %", home: r(13,50,70), away: r(14,50,70), unit: "%" },
        { label: "Defesas por Jogo", home: r(15,10,18), away: r(16,10,18) },
        { label: "Pontos de Saque", home: r(17,4,9), away: r(18,4,9) },
        { label: "Sets Vencidos %", home: r(19,55,75), away: r(20,55,75), unit: "%" },
      ];
    default: // Futebol
      return [
        { label: "Gols Marcados", home: r(1,0.8,2.5), away: r(2,0.8,2.5) },
        { label: "Gols Sofridos", home: r(3,0.5,1.8), away: r(4,0.5,1.8) },
        { label: "Posse de Bola %", home: r(5,45,62), away: r(6,45,62), unit: "%" },
        { label: "Finalizações", home: r(7,10,18), away: r(8,10,18) },
        { label: "Chutes no Alvo", home: r(9,3,7), away: r(10,3,7) },
        { label: "Escanteios", home: r(11,4,8), away: r(12,4,8) },
        { label: "Faltas Cometidas", home: r(13,10,16), away: r(14,10,16) },
        { label: "Cartões Amarelos", home: r(15,1.5,3.5), away: r(16,1.5,3.5) },
        { label: "Cartões Vermelhos", home: r(17,0,0.3), away: r(18,0,0.3) },
        { label: "Impedimentos", home: r(19,1,4), away: r(20,1,4) },
        { label: "Cruzamentos", home: r(21,12,22), away: r(22,12,22) },
        { label: "Passes por Jogo", home: r(23,350,550), away: r(24,350,550) },
        { label: "Precisão de Passe %", home: r(25,78,90), away: r(26,78,90), unit: "%" },
        { label: "Desarmes", home: r(27,14,22), away: r(28,14,22) },
        { label: "Interceptações", home: r(29,8,15), away: r(30,8,15) },
        { label: "Defesas do Goleiro", home: r(31,2,6), away: r(32,2,6) },
      ];
  }
}

/* ─── Odds Movement Generator ─── */
function generateOddsData(match: MatchData) {
  const a = match.odds[0];
  const b = match.odds[2];
  return [
    { hora: "10h", [match.teamA]: +(a + 0.10).toFixed(2), [match.teamB]: +(b - 0.05).toFixed(2) },
    { hora: "12h", [match.teamA]: +(a + 0.07).toFixed(2), [match.teamB]: +(b).toFixed(2) },
    { hora: "14h", [match.teamA]: +(a + 0.03).toFixed(2), [match.teamB]: +(b + 0.07).toFixed(2) },
    { hora: "16h", [match.teamA]: +(a + 0.05).toFixed(2), [match.teamB]: +(b + 0.03).toFixed(2) },
    { hora: "18h", [match.teamA]: +(a).toFixed(2), [match.teamB]: +(b + 0.10).toFixed(2) },
    { hora: "20h", [match.teamA]: +(a - 0.03).toFixed(2), [match.teamB]: +(b + 0.15).toFixed(2) },
  ];
}

/* ═══════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════ */
type TabKey = "partida" | "detalhes" | "escalacoes" | "estatisticas" | "confrontos" | "odds" | "jogadores";

const getTabsForSport = (sport?: string, isLive?: boolean): { key: TabKey; label: string }[] => {
  const matchTab: { key: TabKey; label: string } = isLive
    ? { key: "partida", label: "Partida" }
    : { key: "detalhes", label: "Detalhes" };

  switch (sport) {
    case "Basquete":
      return [
        matchTab,
        { key: "estatisticas", label: "Estatísticas" },
        { key: "confrontos", label: "Confrontos" },
        { key: "odds", label: "Odds" },
        { key: "jogadores", label: "Elenco" },
      ];
    case "Tênis":
      return [
        matchTab,
        { key: "estatisticas", label: "Estatísticas" },
        { key: "confrontos", label: "Histórico" },
        { key: "odds", label: "Odds" },
      ];
    case "Vôlei":
      return [
        matchTab,
        { key: "escalacoes", label: "Escalação" },
        { key: "estatisticas", label: "Estatísticas" },
        { key: "confrontos", label: "Confrontos" },
        { key: "odds", label: "Odds" },
        { key: "jogadores", label: "Elenco" },
      ];
    default: // Futebol
      return [
        matchTab,
        { key: "escalacoes", label: "Escalações" },
        { key: "estatisticas", label: "Estatísticas" },
        { key: "confrontos", label: "Confrontos" },
        { key: "odds", label: "Odds" },
        { key: "jogadores", label: "Jogadores" },
      ];
  }
};

const Analytics = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const match = matchId ? getMatchById(decodeURIComponent(matchId)) : undefined;
  const availableTabs = getTabsForSport(match?.sport, !!match?.live);
  const [activeTab, setActiveTab] = useState<TabKey>(availableTabs[0]?.key || "detalhes");
  const [selectedTeam, setSelectedTeam] = useState<"home" | "away">("home");

  if (!match) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Partida não encontrada</h1>
          <p className="text-muted-foreground">A partida que você procura não existe ou foi removida.</p>
          <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline font-medium">
            <ArrowLeft className="w-4 h-4" /> Voltar ao início
          </Link>
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">

        {/* ── MATCH HEADER (365scores-style scoreboard) ── */}
        <RevealSection>
          <div className="space-y-4">
            <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>

            <div className="match-card !p-6 sm:!p-8">
              {/* League + Meta */}
              <div className="flex items-center justify-between mb-5">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">{match.league}</span>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {details.stadium}</span>
                  <span className="flex items-center gap-1"><User className="w-3 h-3" /> {details.referee}</span>
                </div>
              </div>

              {/* Scoreboard */}
              <div className="flex items-center justify-center gap-6 sm:gap-12">
                                {/* Logo centralizada acima do placar */}
                                <div className="absolute left-1/2 -translate-x-1/2 -top-12 sm:-top-16 z-10">
                                  <img
                                    src={futDataLogo}
                                    alt="Fut Data Logo"
                                    className="w-16 h-16 sm:w-24 sm:h-24 object-contain drop-shadow-lg"
                                  />
                                </div>
                {/* Team A */}
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold" style={{ background: "hsl(var(--primary) / 0.12)", color: "hsl(var(--primary))" }}>
                    {match.teamA.charAt(0)}
                  </div>
                  <span className="text-sm font-bold text-foreground text-center">{match.teamA}</span>
                  <span className="text-[10px] text-muted-foreground">{details.homeLineup.formation}</span>
                </div>

                {/* Score / Time */}
                <div className="flex flex-col items-center gap-1">
                  {match.live && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-primary mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      AO VIVO
                    </span>
                  )}
                  {match.scoreA !== undefined ? (
                    <div className="flex items-center gap-3">
                      <span className="text-4xl font-black text-foreground">{match.scoreA}</span>
                      <span className="text-2xl font-light text-muted-foreground">-</span>
                      <span className="text-4xl font-black text-foreground">{match.scoreB}</span>
                    </div>
                  ) : (
                    <span className="text-3xl font-bold text-muted-foreground">{match.time}</span>
                  )}
                  {match.live && <span className="text-xs text-muted-foreground">{match.time}</span>}
                </div>

                {/* Team B */}
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold" style={{ background: "hsl(220, 20%, 45% / 0.2)", color: "hsl(220, 20%, 65%)" }}>
                    {match.teamB.charAt(0)}
                  </div>
                  <span className="text-sm font-bold text-foreground text-center">{match.teamB}</span>
                  <span className="text-[10px] text-muted-foreground">{details.awayLineup.formation}</span>
                </div>
              </div>

              {/* Odds strip */}
              <div className="flex items-center justify-center gap-3 mt-5 pt-4 border-t border-border">
                {[
                  { label: "1", value: match.odds[0] },
                  { label: "X", value: match.odds[1] },
                  { label: "2", value: match.odds[2] },
                ].map((o) => (
                  <div key={o.label} className="flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer hover:ring-1 hover:ring-primary/40 transition-all" style={{ background: "hsl(var(--secondary))" }}>
                    <span className="text-[10px] font-semibold text-muted-foreground">{o.label}</span>
                    <span className="text-sm font-bold text-foreground">{o.value}</span>
                  </div>
                ))}
              </div>

              {/* Info strip */}
              <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><Cloud className="w-3 h-3" /> {details.weather} {details.temperature}</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {details.attendance}</span>
              </div>
            </div>
          </div>
        </RevealSection>

        {/* ── TABS ── */}
        <RevealSection delay={60}>
          <div className="flex gap-1 p-1 rounded-xl overflow-x-auto" style={{ background: "hsl(var(--secondary))", scrollbarWidth: "none" }}>
            {availableTabs.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 ${activeTab === key ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </RevealSection>

        {/* ═══════════ TAB: DETALHES (PRE-MATCH) ═══════════ */}
        {activeTab === "detalhes" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <RevealSection className="lg:col-span-2">
              <div className="match-card space-y-6">
                <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" /> Informações da Partida
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-border/50" style={{ background: "hsl(var(--secondary))" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="w-4 h-4 text-primary" />
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Competição</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">{match.league}</p>
                  </div>
                  <div className="p-4 rounded-xl border border-border/50" style={{ background: "hsl(var(--secondary))" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Horário</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">{match.date ? `${match.date} · ` : ""}{match.time}</p>
                  </div>
                  <div className="p-4 rounded-xl border border-border/50" style={{ background: "hsl(var(--secondary))" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Estádio</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">{details.stadium}</p>
                  </div>
                  <div className="p-4 rounded-xl border border-border/50" style={{ background: "hsl(var(--secondary))" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-primary" />
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Árbitro</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">{details.referee}</p>
                  </div>
                  <div className="p-4 rounded-xl border border-border/50" style={{ background: "hsl(var(--secondary))" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Cloud className="w-4 h-4 text-primary" />
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Clima</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">{details.weather} · {details.temperature}</p>
                  </div>
                  <div className="p-4 rounded-xl border border-border/50" style={{ background: "hsl(var(--secondary))" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Público Esperado</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">{details.attendance}</p>
                  </div>
                </div>

                {/* Coaches */}
                <div className="pt-4 border-t border-border">
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-primary" /> Treinadores
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg" style={{ background: "hsl(var(--secondary))" }}>
                      <p className="text-xs text-muted-foreground mb-1">{match.teamA}</p>
                      <p className="text-sm font-semibold text-foreground">{details.homeLineup.coach}</p>
                    </div>
                    <div className="p-3 rounded-lg" style={{ background: "hsl(var(--secondary))" }}>
                      <p className="text-xs text-muted-foreground mb-1">{match.teamB}</p>
                      <p className="text-sm font-semibold text-foreground">{details.awayLineup.coach}</p>
                    </div>
                  </div>
                </div>
              </div>
            </RevealSection>

            {/* Side panel */}
            <div className="space-y-4">
              <RevealSection delay={80}>
                <div className="match-card space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Odds Atuais</h3>
                  <div className="space-y-2">
                    {[
                      { label: match.teamA, odds: match.odds[0] },
                      { label: "Empate", odds: match.odds[1] },
                      { label: match.teamB, odds: match.odds[2] },
                    ].map((o, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg" style={{ background: "hsl(var(--secondary))" }}>
                        <span className="text-xs text-muted-foreground">{o.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-foreground">{o.odds.toFixed(2)}</span>
                          <span className="text-[10px] text-muted-foreground">{Math.round((1 / o.odds) * 100)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </RevealSection>

              <RevealSection delay={140}>
                <div className="match-card flex items-start gap-3" style={{ borderColor: "hsl(var(--primary) / 0.25)" }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "hsl(var(--primary) / 0.12)" }}>
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-foreground mb-1">Palpite IA</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Favorito: <strong className="text-primary">{favLabel}</strong> com {winProb}% de probabilidade implícita.
                    </p>
                  </div>
                </div>
              </RevealSection>
            </div>
          </div>
        )}

        {/* ═══════════ TAB: PARTIDA ═══════════ */}
        {activeTab === "partida" && (
          match?.sport === "Tênis" ? (
            /* TENNIS MATCH VIEW */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              <RevealSection className="lg:col-span-2">
                <div className="match-card space-y-6">
                  <h2 className="text-base font-semibold text-foreground">Resultado dos Sets</h2>
                  <div className="space-y-3">
                    {[
                      { set: 1, home: "6", away: "4" },
                      { set: 2, home: "7", away: "5" },
                      { set: 3, home: "6", away: "3" },
                    ].map((s, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-lg" style={{ background: "hsl(var(--secondary))" }}>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground mb-1">Set {s.set}</p>
                          <div className="flex items-center gap-6">
                            <div className="flex-1">
                              <p className="text-sm text-muted-foreground">{match.teamA}</p>
                              <p className="text-2xl font-bold text-primary">{s.home}</p>
                            </div>
                            <span className="text-muted-foreground">-</span>
                            <div className="flex-1">
                              <p className="text-sm text-muted-foreground text-right">{match.teamB}</p>
                              <p className="text-2xl font-bold text-right text-foreground">{s.away}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-border">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Informações do Match</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Duração:</span>
                        <span className="text-foreground font-medium">2h 35min</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Quadra:</span>
                        <span className="text-foreground font-medium">Hard Court</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Pontuação Final:</span>
                        <span className="text-foreground font-medium">{match.scoreA} - {match.scoreB}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </RevealSection>

              <RevealSection delay={80}>
                <div className="match-card space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">Destaques</h3>
                  <StatBar label="Aces" home={18} away={12} />
                  <StatBar label="Break Points %" home={65} away={40} unit="%" />
                  <StatBar label="1º Saque %" home={72} away={68} unit="%" />
                  <StatBar label="Vencedoras" home={42} away={35} />
                </div>
              </RevealSection>
            </div>
          ) : match?.sport === "Basquete" ? (
            /* BASKETBALL MATCH VIEW */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              <RevealSection className="lg:col-span-2">
                <div className="match-card space-y-6">
                  <h2 className="text-base font-semibold text-foreground">Resultado por Quarto</h2>
                  <div className="space-y-3">
                    {[
                      { quarter: "1º", home: "24", away: "18" },
                      { quarter: "2º", home: "22", away: "20" },
                      { quarter: "3º", home: "26", away: "28" },
                      { quarter: "4º", home: "20", away: "19" },
                    ].map((q, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-lg" style={{ background: "hsl(var(--secondary))" }}>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground mb-1">{q.quarter}</p>
                          <div className="flex items-center gap-6">
                            <div className="flex-1">
                              <p className="text-sm text-muted-foreground">{match.teamA}</p>
                              <p className="text-2xl font-bold text-primary">{q.home}</p>
                            </div>
                            <span className="text-muted-foreground">-</span>
                            <div className="flex-1">
                              <p className="text-sm text-muted-foreground text-right">{match.teamB}</p>
                              <p className="text-2xl font-bold text-right text-foreground">{q.away}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-border">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Informações do Jogo</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Local:</span>
                        <span className="text-foreground font-medium">{details.stadium}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Árbitro Principal:</span>
                        <span className="text-foreground font-medium">{details.referee}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Público:</span>
                        <span className="text-foreground font-medium">{details.attendance}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </RevealSection>

              <RevealSection delay={80}>
                <div className="match-card space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">Destaques</h3>
                  <StatBar label="FG %" home={48} away={42} unit="%" />
                  <StatBar label="3P %" home={36} away={31} unit="%" />
                  <StatBar label="Rebotes" home={52} away={45} />
                  <StatBar label="Assistências" home={28} away={24} />
                </div>
              </RevealSection>
            </div>
          ) : match?.sport === "Vôlei" ? (
            /* VOLLEYBALL MATCH VIEW */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              <RevealSection className="lg:col-span-2">
                <div className="match-card space-y-6">
                  <h2 className="text-base font-semibold text-foreground">Resultado dos Sets</h2>
                  <div className="space-y-3">
                    {[
                      { set: 1, home: "25", away: "20" },
                      { set: 2, home: "25", away: "22" },
                      { set: 3, home: "24", away: "26" },
                      { set: 4, home: "25", away: "23" },
                    ].map((s, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-lg" style={{ background: "hsl(var(--secondary))" }}>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground mb-1">Set {s.set}</p>
                          <div className="flex items-center gap-6">
                            <div className="flex-1">
                              <p className="text-sm text-muted-foreground">{match.teamA}</p>
                              <p className="text-2xl font-bold text-primary">{s.home}</p>
                            </div>
                            <span className="text-muted-foreground">-</span>
                            <div className="flex-1">
                              <p className="text-sm text-muted-foreground text-right">{match.teamB}</p>
                              <p className="text-2xl font-bold text-right text-foreground">{s.away}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-border">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Informações da Partida</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Ginásio:</span>
                        <span className="text-foreground font-medium">{details.stadium}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Árbitro:</span>
                        <span className="text-foreground font-medium">{details.referee}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Público:</span>
                        <span className="text-foreground font-medium">{details.attendance}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </RevealSection>

              <RevealSection delay={80}>
                <div className="match-card space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">Destaques</h3>
                  <StatBar label="Kills" home={58} away={52} />
                  <StatBar label="Aces" home={8} away={6} />
                  <StatBar label="Bloqueios" home={12} away={10} />
                  <StatBar label="Erros" home={14} away={18} />
                </div>
              </RevealSection>
            </div>
          ) : (
            /* FOOTBALL MATCH VIEW (DEFAULT) */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Events Timeline */}
              <RevealSection className="lg:col-span-2">
                <div className="match-card space-y-4">
                  <h2 className="text-base font-semibold text-foreground">Eventos da Partida</h2>
                  <div className="space-y-0">
                    {details.events.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">Aguardando início da partida...</p>
                    ) : (
                      details.events.map((ev, i) => (
                        <div key={i} className={`flex items-center gap-3 py-3 ${i > 0 ? "border-t border-border/50" : ""}`}>
                          {ev.team === "home" ? (
                            <>
                              <span className="text-sm text-foreground flex-1 text-right">{ev.player}</span>
                              <EventIcon type={ev.type} />
                              <span className="text-xs font-mono text-muted-foreground w-10 text-center">{ev.minute}'</span>
                              <div className="flex-1" />
                            </>
                          ) : (
                            <>
                              <div className="flex-1" />
                              <span className="text-xs font-mono text-muted-foreground w-10 text-center">{ev.minute}'</span>
                              <EventIcon type={ev.type} />
                              <span className="text-sm text-foreground flex-1">{ev.player}</span>
                            </>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </RevealSection>

              {/* Quick Stats + Insight */}
              <div className="space-y-4">
                <RevealSection delay={80}>
                  <div className="match-card space-y-4">
                    <h3 className="text-sm font-semibold text-foreground">Resumo</h3>
                    <StatBar label="Posse de Bola" home={details.stats.possession[0]} away={details.stats.possession[1]} unit="%" />
                    <StatBar label="Finalizações" home={details.stats.shots[0]} away={details.stats.shots[1]} />
                    <StatBar label="No Gol" home={details.stats.shotsOnTarget[0]} away={details.stats.shotsOnTarget[1]} />
                    <StatBar label="Escanteios" home={details.stats.corners[0]} away={details.stats.corners[1]} />
                  </div>
                </RevealSection>

                <RevealSection delay={140}>
                  <div className="match-card flex items-start gap-3" style={{ borderColor: "hsl(var(--primary) / 0.25)" }}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "hsl(var(--primary) / 0.12)" }}>
                      <Zap className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-foreground mb-1">Palpite IA</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Favorito: <strong className="text-primary">{favLabel}</strong> com {winProb}% de probabilidade implícita.{" "}
                        {details.stats.possession[0] > 50 ? `${match.teamA} domina a posse.` : `${match.teamB} controla mais a bola.`}
                      </p>
                    </div>
                  </div>
                </RevealSection>
              </div>
            </div>
          )
        )}

        {/* ═══════════ TAB: ESCALAÇÕES ═══════════ */}
        {activeTab === "escalacoes" && (match?.sport === "Futebol" || match?.sport === "Vôlei") && (
          <div className="space-y-8">
            <RevealSection>
              {/* Estimated vs Confirmed badge */}
              {!match.live && (
                <div className={`flex items-center gap-2 mb-4 px-3 py-2 rounded-lg text-xs font-medium ${
                  (() => {
                    // Parse match time "HH:MM" to check if < 30 min away
                    const parts = (match.time || "").split(":");
                    if (parts.length === 2) {
                      const matchDate = new Date();
                      matchDate.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);
                      const diff = (matchDate.getTime() - Date.now()) / 60000;
                      if (diff > 0 && diff <= 30) return "confirmed";
                    }
                    return "estimated";
                  })() === "confirmed"
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                }`}>
                  {(() => {
                    const parts = (match.time || "").split(":");
                    if (parts.length === 2) {
                      const matchDate = new Date();
                      matchDate.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);
                      const diff = (matchDate.getTime() - Date.now()) / 60000;
                      if (diff > 0 && diff <= 30) {
                        return (<><CheckCircle2 className="w-3.5 h-3.5" /> Escalação confirmada</>);
                      }
                    }
                    return (<><AlertTriangle className="w-3.5 h-3.5" /> Escalação estimada — sujeita a alterações</>);
                  })()}
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedTeam("home")}
                  className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all ${selectedTeam === "home" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  style={selectedTeam !== "home" ? { background: "hsl(var(--secondary))" } : undefined}
                >
                  {match.teamA} {match?.sport === "Futebol" ? `(${details.homeLineup.formation})` : "(Titular)"}
                </button>
                <button
                  onClick={() => setSelectedTeam("away")}
                  className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all ${selectedTeam === "away" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  style={selectedTeam !== "away" ? { background: "hsl(var(--secondary))" } : undefined}
                >
                  {match.teamB} {match?.sport === "Futebol" ? `(${details.awayLineup.formation})` : "(Titular)"}
                </button>
              </div>
            </RevealSection>

            {(() => {
              const lineup = selectedTeam === "home" ? details.homeLineup : details.awayLineup;
              return match?.sport === "Futebol" ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                  {/* Formation Visual — LEFT */}
                  <RevealSection delay={60}>
                    <div className="match-card space-y-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-base font-semibold text-foreground">Formação {lineup.formation}</h2>
                        <span className="text-xs text-muted-foreground flex items-center gap-1"><User className="w-3 h-3" /> {lineup.coach}</span>
                      </div>

                      {/* Field */}
                      <div className="relative w-full rounded-xl overflow-hidden" style={{ background: "hsl(148, 50%, 22%)", paddingTop: "120%", paddingBottom: 12 }}>
                        <div className="absolute inset-0 p-3 pb-6">
                          {/* Field markings */}
                          <div className="absolute inset-4 border border-white/20 rounded-lg">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-12 border border-white/20 border-t-0 rounded-b-lg" />
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-12 border border-white/20 border-b-0 rounded-t-lg" />
                            <div className="absolute top-1/2 left-0 right-0 border-t border-white/20" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border border-white/20 rounded-full" />
                          </div>

                          {/* Players on field */}
                          {(() => {
                            const formationLines = lineup.formation.split("-").map(Number);
                            const rows: Player[][] = [];
                            let idx = 0;
                            rows.push([lineup.players[idx++]]);
                            for (const count of formationLines) {
                              rows.push(lineup.players.slice(idx, idx + count));
                              idx += count;
                            }
                            const totalRows = rows.length;
                            return rows.map((row, rowIdx) => {
                              const yPercent = 8 + (rowIdx / (totalRows - 1)) * 80;
                              return (
                                <div key={rowIdx} className="absolute left-0 right-0 flex justify-center" style={{ top: `${yPercent}%` }}>
                                  {row.map((p, pIdx) => {
                                    const total = row.length;
                                    const xOffset = total === 1 ? 50 : 15 + (pIdx / (total - 1)) * 70;
                                    return (
                                      <div key={pIdx} className="flex flex-col items-center" style={{ position: "absolute", left: `${xOffset}%`, transform: "translateX(-50%)" }}>
                                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
                                          {p.number}
                                        </div>
                                        <span className="text-[9px] font-semibold text-white mt-0.5 text-center leading-tight max-w-[80px] break-words truncate drop-shadow-md">
                                          {p.name.split(" ").pop()}
                                        </span>
                                        <span className="text-[8px] text-white/60">{p.rating}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    </div>
                  </RevealSection>

                  {/* Player Lists — RIGHT */}
                  <RevealSection delay={120}>
                    <div className="space-y-4">
                      <div className="match-card space-y-2">
                        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <Shirt className="w-3.5 h-3.5 text-primary" /> Titulares
                        </h3>
                        {lineup.players.map((p, i) => <PlayerCard key={i} player={p} compact />)}
                      </div>
                      <div className="match-card space-y-2">
                        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <ArrowRightLeft className="w-3.5 h-3.5 text-muted-foreground" /> Reservas
                        </h3>
                        {lineup.substitutes.map((p, i) => <PlayerCard key={i} player={p} compact />)}
                      </div>
                    </div>
                  </RevealSection>
                </div>
              ) : (
                /* VOLLEYBALL LINEUP VIEW */
                <div className="space-y-4">
                  <div className="match-card space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-base font-semibold text-foreground">Escalação</h2>
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><User className="w-3 h-3" /> {lineup.coach}</span>
                    </div>
                    <div className="space-y-3">
                      {lineup.players.map((p, i) => (
                        <div key={i} className="flex items-center gap-4 p-3 rounded-lg" style={{ background: "hsl(var(--secondary))" }}>
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
                            {p.number}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground">{p.name}</p>
                            <p className="text-xs text-muted-foreground">{p.position} • {p.age} anos</p>
                          </div>
                          <span className="text-xs font-bold text-primary">{p.rating}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ═══════════ TAB: ESTATÍSTICAS ═══════════ */}
        {activeTab === "estatisticas" && (
          <div className="space-y-6">
            <RevealSection>
              <div className="match-card space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span className="text-sm font-bold text-foreground">Média dos Últimos 10 Jogos</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-1 rounded-full">{match.sport || "Futebol"}</span>
                </div>

                {/* Team header row */}
                <div className="flex items-center justify-between px-2 py-2 border-b border-border">
                  <span className="text-xs font-bold text-primary w-1/4">{match.teamA}</span>
                  <span className="text-xs font-bold text-muted-foreground text-center flex-1">Estatística</span>
                  <span className="text-xs font-bold text-foreground w-1/4 text-right">{match.teamB}</span>
                </div>

                {/* Stats rows */}
                <div className="space-y-0 divide-y divide-border/40">
                  {avgStats.map((stat, i) => {
                    const homeVal = typeof stat.home === "number" ? stat.home : 0;
                    const awayVal = typeof stat.away === "number" ? stat.away : 0;
                    const max = Math.max(homeVal, awayVal, 1);
                    const unit = (stat as { unit?: string }).unit || "";
                    return (
                      <div key={i} className="py-3 px-2">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-sm font-bold w-1/4 ${homeVal >= awayVal ? "text-primary" : "text-foreground"}`}>
                            {homeVal}{unit}
                          </span>
                          <span className="text-xs text-muted-foreground text-center flex-1">{stat.label}</span>
                          <span className={`text-sm font-bold w-1/4 text-right ${awayVal >= homeVal ? "text-primary" : "text-foreground"}`}>
                            {awayVal}{unit}
                          </span>
                        </div>
                        <div className="flex gap-1.5 items-center">
                          <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-border/50 flex justify-end">
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(homeVal / max) * 100}%`, background: homeVal >= awayVal ? "hsl(var(--primary))" : "hsl(220, 20%, 50%)" }} />
                          </div>
                          <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-border/50">
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(awayVal / max) * 100}%`, background: awayVal >= homeVal ? "hsl(var(--primary))" : "hsl(220, 20%, 50%)" }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </RevealSection>

            {/* Current match stats (if live) */}
            {match.live && (
              <RevealSection delay={80}>
                <div className="match-card space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-sm font-bold text-foreground">Estatísticas da Partida Atual</span>
                  </div>
                  {match.sport === "Basquete" && details.basketballStats && (
                    <BasketballStatsView teamA={match.teamA} teamB={match.teamB} stats={details.basketballStats} />
                  )}
                  {match.sport === "Tênis" && details.tennisStats && (
                    <TennisStatsView teamA={match.teamA} teamB={match.teamB} stats={details.tennisStats} />
                  )}
                  {match.sport === "Vôlei" && details.volleyballStats && (
                    <VolleyballStatsView teamA={match.teamA} teamB={match.teamB} stats={details.volleyballStats} />
                  )}
                  {(!match.sport || match.sport === "Futebol") && (
                    <FootballStatsView teamA={match.teamA} teamB={match.teamB} stats={details.stats} />
                  )}
                </div>
              </RevealSection>
            )}
          </div>
        )}

        {/* ═══════════ TAB: CONFRONTOS ═══════════ */}
        {activeTab === "confrontos" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              <RevealSection>
                <div className="match-card space-y-4">
                  <h2 className="text-base font-semibold text-foreground">Comparativo de Times</h2>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="hsl(222, 40%, 22%)" />
                        <PolarAngleAxis dataKey="stat" tick={{ fill: "hsl(220, 20%, 65%)", fontSize: 11 }} />
                        <PolarRadiusAxis tick={false} axisLine={false} />
                        <Radar name={match.teamA} dataKey={match.teamA} stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
                        <Radar name={match.teamB} dataKey={match.teamB} stroke="hsl(220, 20%, 60%)" fill="hsl(220, 20%, 60%)" fillOpacity={0.15} strokeWidth={2} />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip />} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </RevealSection>

              <RevealSection delay={100}>
                <div className="match-card space-y-4 h-full">
                  <h2 className="text-base font-semibold text-foreground">Confrontos Diretos</h2>
                  <div className="space-y-1">
                    {h2hResults.map((m, i) => (
                      <div key={i} className="flex items-center justify-between py-3 px-3 rounded-lg transition-colors hover:bg-secondary/60">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground w-[70px]">{m.date}</span>
                          <span className={`text-sm font-medium ${m.winner === "home" ? "text-primary" : "text-foreground"}`}>{m.home}</span>
                        </div>
                        <span className="text-sm font-bold text-foreground px-3 py-1 rounded" style={{ background: "hsl(var(--secondary))" }}>{m.score}</span>
                        <span className={`text-sm font-medium ${m.winner === "away" ? "text-primary" : "text-foreground"}`}>{m.away}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4 pt-3 border-t border-border">
                    <div className="text-center flex-1">
                      <p className="text-xl font-bold text-primary">2</p>
                      <p className="text-[10px] text-muted-foreground">{match.teamA}</p>
                    </div>
                    <div className="text-center flex-1">
                      <p className="text-xl font-bold text-muted-foreground">2</p>
                      <p className="text-[10px] text-muted-foreground">Empates</p>
                    </div>
                    <div className="text-center flex-1">
                      <p className="text-xl font-bold text-foreground">1</p>
                      <p className="text-[10px] text-muted-foreground">{match.teamB}</p>
                    </div>
                  </div>
                </div>
              </RevealSection>
            </div>

            {/* Padrões em Comum */}
            <RevealSection delay={150}>
              <div className="match-card space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span className="text-sm font-bold text-foreground">Padrões em Comum — Últimos 10 Jogos</span>
                </div>
                <div className="space-y-0 divide-y divide-border/40">
                  {commonStats.map((cs, i) => (
                    <div key={i} className="flex items-center gap-3 py-3 px-2">
                      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0 text-base">
                        {cs.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{cs.label}</p>
                        <span className="text-[10px] text-muted-foreground bg-secondary/80 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                          {cs.teams === "both" ? `${match.teamA} & ${match.teamB}` : cs.teams === "home" ? match.teamA : match.teamB}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-primary shrink-0">{cs.record}</span>
                    </div>
                  ))}
                </div>
              </div>
            </RevealSection>
          </div>
        )}

        {/* ═══════════ TAB: ODDS ═══════════ */}
        {activeTab === "odds" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <RevealSection className="lg:col-span-2">
              <div className="match-card space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-foreground">Variação de Odds</h2>
                  <span className="text-xs text-muted-foreground">Últimas horas</span>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={oddsMovement}>
                      <defs>
                        <linearGradient id="gradA" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradB" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(220, 20%, 60%)" stopOpacity={0.2} />
                          <stop offset="100%" stopColor="hsl(220, 20%, 60%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 40%, 22%)" />
                      <XAxis dataKey="hora" tick={{ fill: "hsl(220, 20%, 65%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis domain={["auto", "auto"]} tick={{ fill: "hsl(220, 20%, 65%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey={match.teamA} name={match.teamA} stroke="hsl(var(--primary))" fill="url(#gradA)" strokeWidth={2.5} />
                      <Area type="monotone" dataKey={match.teamB} name={match.teamB} stroke="hsl(220, 20%, 60%)" fill="url(#gradB)" strokeWidth={2.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </RevealSection>

            <RevealSection delay={100}>
              <div className="space-y-4">
                <div className="match-card space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Odds — {match.teamA}</h3>
                  {[
                    { casa: "Bet365", odd: match.odds[0].toFixed(2), trend: "up" },
                    { casa: "Betano", odd: (match.odds[0] - 0.03).toFixed(2), trend: "down" },
                    { casa: "Sportingbet", odd: (match.odds[0] - 0.05).toFixed(2), trend: "up" },
                  ].map((c, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5">
                      <span className="text-xs text-muted-foreground">{c.casa}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">{c.odd}</span>
                        {c.trend === "up" ? <TrendingUp className="w-3.5 h-3.5 text-primary" /> : <TrendingDown className="w-3.5 h-3.5 text-destructive" />}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="match-card space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Odds — {match.teamB}</h3>
                  {[
                    { casa: "Bet365", odd: match.odds[2].toFixed(2), trend: "up" },
                    { casa: "Betano", odd: (match.odds[2] - 0.05).toFixed(2), trend: "up" },
                    { casa: "Sportingbet", odd: (match.odds[2] - 0.12).toFixed(2), trend: "down" },
                  ].map((c, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5">
                      <span className="text-xs text-muted-foreground">{c.casa}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">{c.odd}</span>
                        {c.trend === "up" ? <TrendingUp className="w-3.5 h-3.5 text-primary" /> : <TrendingDown className="w-3.5 h-3.5 text-destructive" />}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="match-card flex items-start gap-3" style={{ borderColor: "hsl(var(--primary) / 0.25)" }}>
                  <Zap className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Odds de {match.teamA} com tendência de queda, indicando mercado favorável. {match.teamB} com valorização.
                  </p>
                </div>
              </div>
            </RevealSection>
          </div>
        )}

        {/* ═══════════ TAB: JOGADORES / ELENCO ═══════════ */}
        {activeTab === "jogadores" && match?.sport !== "Tênis" && (
          <div className="space-y-8">
            <RevealSection>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedTeam("home")}
                  className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all ${selectedTeam === "home" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  style={selectedTeam !== "home" ? { background: "hsl(var(--secondary))" } : undefined}
                >
                  {match.teamA}
                </button>
                <button
                  onClick={() => setSelectedTeam("away")}
                  className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all ${selectedTeam === "away" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  style={selectedTeam !== "away" ? { background: "hsl(var(--secondary))" } : undefined}
                >
                  {match.teamB}
                </button>
              </div>
            </RevealSection>

            {(() => {
              const lineup = selectedTeam === "home" ? details.homeLineup : details.awayLineup;
              const allPlayers = [...lineup.players, ...lineup.substitutes];
              const topRated = [...allPlayers].sort((a, b) => b.rating - a.rating).slice(0, 3);
              const topScorers = [...allPlayers].sort((a, b) => b.goals - a.goals).slice(0, 3);

              return (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                  {/* All Players */}
                  <RevealSection className="lg:col-span-2" delay={60}>
                    <div className="space-y-3">
                      <h2 className="text-base font-semibold text-foreground">
                        {match?.sport === "Basquete" ? "Elenco da Temporada" : match?.sport === "Vôlei" ? "Elenco do Time" : "Elenco"}
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {allPlayers.map((p, i) => <PlayerCard key={i} player={p} />)}
                      </div>
                    </div>
                  </RevealSection>

                  {/* Highlights */}
                  <div className="space-y-4">
                    <RevealSection delay={100}>
                      <div className="match-card space-y-3">
                        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <Star className="w-3.5 h-3.5 text-primary" /> {match?.sport === "Basquete" ? "Maiores Pontuadores" : "Maiores Notas"}
                        </h3>
                        {(match?.sport === "Basquete" ? topScorers : topRated).map((p, i) => (
                          <div key={i} className="flex items-center gap-3 py-2">
                            <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}.</span>
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "hsl(var(--primary) / 0.12)", color: "hsl(var(--primary))" }}>
                              {p.number}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">{p.name}</p>
                              <p className="text-[10px] text-muted-foreground">{p.position}</p>
                            </div>
                            <span className="text-sm font-bold text-primary">
                              {match?.sport === "Basquete" ? `${p.goals}pts` : p.rating}
                            </span>
                          </div>
                        ))}
                      </div>
                    </RevealSection>

                    {match?.sport !== "Basquete" && (
                      <RevealSection delay={160}>
                        <div className="match-card space-y-3">
                          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <Target className="w-3.5 h-3.5 text-primary" /> {match?.sport === "Vôlei" ? "Mais Kills" : "Artilheiros"}
                          </h3>
                          {topScorers.map((p, i) => (
                            <div key={i} className="flex items-center gap-3 py-2">
                              <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}.</span>
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "hsl(var(--primary) / 0.12)", color: "hsl(var(--primary))" }}>
                                {p.number}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-foreground">{p.name}</p>
                                <p className="text-[10px] text-muted-foreground">{p.position} · {p.minutesPlayed}'</p>
                              </div>
                              <span className="text-sm font-bold text-foreground">
                                {match?.sport === "Vôlei" ? `${p.goals}` : `⚽ ${p.goals}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </RevealSection>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

      </main>
      <div className="mt-8" />
      <Footer />
      <BetSlip />
    </div>
  );
};

export default Analytics;
