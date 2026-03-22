import Navbar from "@/components/Navbar";
import futDataLogo from "@/assets/png_fut_data.png";
import Footer from "@/components/Footer";
import BetSlip from "@/components/BetSlip";
import {
  TrendingUp, TrendingDown, Target, Zap, ArrowLeft,
  MapPin, User, Users, Cloud, Shirt, ArrowRightLeft, Star,
  Circle,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
} from "recharts";
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getMatchById, type MatchData } from "@/data/matches";
import { getMatchDetails, type Player, type MatchEvent } from "@/data/matchDetails";

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

/* ─── Stat Bar (horizontal comparison) ─── */
const StatBar = ({ label, home, away, unit = "" }: { label: string; home: number; away: number; unit?: string }) => {
  const total = home + away || 1;
  const homePct = (home / total) * 100;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-semibold text-foreground">{home}{unit}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground">{away}{unit}</span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden gap-0.5">
        <div className="rounded-full transition-all duration-700" style={{ width: `${homePct}%`, background: "hsl(var(--primary))" }} />
        <div className="rounded-full flex-1 transition-all duration-700" style={{ background: "hsl(220, 20%, 45%)" }} />
      </div>
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
  return {
    radarData: [
      { stat: "Posse", [match.teamA]: r(10), [match.teamB]: r(11) },
      { stat: "Finalizações", [match.teamA]: r(12), [match.teamB]: r(13) },
      { stat: "Passes", [match.teamA]: r(14), [match.teamB]: r(15) },
      { stat: "Defesa", [match.teamA]: r(16), [match.teamB]: r(17) },
      { stat: "Contra-ataques", [match.teamA]: r(18), [match.teamB]: r(19) },
      { stat: "Bolas paradas", [match.teamA]: r(20), [match.teamB]: r(21) },
    ],
    h2hResults: [
      { date: "12/03/2025", home: match.teamA, away: match.teamB, score: "2 x 1", winner: "home" as const },
      { date: "28/11/2024", home: match.teamB, away: match.teamA, score: "0 x 0", winner: "draw" as const },
      { date: "05/08/2024", home: match.teamA, away: match.teamB, score: "1 x 3", winner: "away" as const },
      { date: "14/04/2024", home: match.teamB, away: match.teamA, score: "2 x 2", winner: "draw" as const },
      { date: "20/01/2024", home: match.teamA, away: match.teamB, score: "3 x 0", winner: "home" as const },
    ],
  };
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
type TabKey = "partida" | "escalacoes" | "estatisticas" | "confrontos" | "odds" | "jogadores";

const TABS: { key: TabKey; label: string }[] = [
  { key: "partida", label: "Partida" },
  { key: "escalacoes", label: "Escalações" },
  { key: "estatisticas", label: "Estatísticas" },
  { key: "confrontos", label: "Confrontos" },
  { key: "odds", label: "Odds" },
  { key: "jogadores", label: "Jogadores" },
];

const Analytics = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>("partida");
  const [selectedTeam, setSelectedTeam] = useState<"home" | "away">("home");

  const match = matchId ? getMatchById(decodeURIComponent(matchId)) : undefined;

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

  const details = getMatchDetails(match.teamA, match.teamB, match.scoreA, match.scoreB, match.odds);
  const { radarData, h2hResults } = generateH2hData(match);
  const oddsMovement = generateOddsData(match);

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
            {TABS.map(({ key, label }) => (
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

        {/* ═══════════ TAB: PARTIDA ═══════════ */}
        {activeTab === "partida" && (
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
        )}

        {/* ═══════════ TAB: ESCALAÇÕES ═══════════ */}
        {activeTab === "escalacoes" && (
          <div className="space-y-8">
            <RevealSection>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedTeam("home")}
                  className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all ${selectedTeam === "home" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  style={selectedTeam !== "home" ? { background: "hsl(var(--secondary))" } : undefined}
                >
                  {match.teamA} ({details.homeLineup.formation})
                </button>
                <button
                  onClick={() => setSelectedTeam("away")}
                  className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all ${selectedTeam === "away" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  style={selectedTeam !== "away" ? { background: "hsl(var(--secondary))" } : undefined}
                >
                  {match.teamB} ({details.awayLineup.formation})
                </button>
              </div>
            </RevealSection>

            {(() => {
              const lineup = selectedTeam === "home" ? details.homeLineup : details.awayLineup;
              return (
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
                              // Remover offset extra da última linha para não empurrar atacantes para fora
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
              );
            })()}
          </div>
        )}

        {/* ═══════════ TAB: ESTATÍSTICAS ═══════════ */}
        {activeTab === "estatisticas" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <RevealSection>
              <div className="match-card space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground">{match.teamA}</span>
                  <h2 className="text-base font-semibold text-foreground">Estatísticas</h2>
                  <span className="text-sm font-bold text-foreground">{match.teamB}</span>
                </div>
                <StatBar label="Posse de Bola" home={details.stats.possession[0]} away={details.stats.possession[1]} unit="%" />
                <StatBar label="Total de Chutes" home={details.stats.shots[0]} away={details.stats.shots[1]} />
                <StatBar label="Chutes no Gol" home={details.stats.shotsOnTarget[0]} away={details.stats.shotsOnTarget[1]} />
                <StatBar label="Escanteios" home={details.stats.corners[0]} away={details.stats.corners[1]} />
                <StatBar label="Faltas" home={details.stats.fouls[0]} away={details.stats.fouls[1]} />
                <StatBar label="Impedimentos" home={details.stats.offsides[0]} away={details.stats.offsides[1]} />
                <StatBar label="Passes" home={details.stats.passes[0]} away={details.stats.passes[1]} />
                <StatBar label="Precisão Passes" home={details.stats.passAccuracy[0]} away={details.stats.passAccuracy[1]} unit="%" />
                <StatBar label="Desarmes" home={details.stats.tackles[0]} away={details.stats.tackles[1]} />
                <StatBar label="Defesas" home={details.stats.saves[0]} away={details.stats.saves[1]} />
              </div>
            </RevealSection>

            <div className="space-y-4">
              <RevealSection delay={80}>
                <div className="match-card space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Gols Esperados (xG)</h3>
                  <div className="flex items-center justify-around py-4">
                    <div className="text-center">
                      <p className="text-2xl font-black text-foreground">{(details.stats.shotsOnTarget[0] * 0.18).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{match.teamA}</p>
                    </div>
                    <div className="text-2xl text-muted-foreground">vs</div>
                    <div className="text-center">
                      <p className="text-2xl font-black text-foreground">{(details.stats.shotsOnTarget[1] * 0.18).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{match.teamB}</p>
                    </div>
                  </div>
                </div>
              </RevealSection>

              <RevealSection delay={140}>
                <div className="match-card flex items-start gap-3" style={{ borderColor: "hsl(var(--primary) / 0.25)" }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "hsl(var(--primary) / 0.12)" }}>
                    <Target className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-foreground mb-1">Análise Estatística</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {match.teamA} apresenta {details.stats.possession[0]}% de posse de bola com {details.stats.shots[0]} finalizações ({details.stats.shotsOnTarget[0]} no gol).{" "}
                      {details.stats.possession[0] > details.stats.possession[1] ? `${match.teamA} domina as ações com mais controle.` : `${match.teamB} mostra eficiência apesar de menos posse.`}
                    </p>
                  </div>
                </div>
              </RevealSection>
            </div>
          </div>
        )}

        {/* ═══════════ TAB: CONFRONTOS ═══════════ */}
        {activeTab === "confrontos" && (
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

        {/* ═══════════ TAB: JOGADORES ═══════════ */}
        {activeTab === "jogadores" && (
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
                      <h2 className="text-base font-semibold text-foreground">Elenco</h2>
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
                          <Star className="w-3.5 h-3.5 text-primary" /> Maiores Notas
                        </h3>
                        {topRated.map((p, i) => (
                          <div key={i} className="flex items-center gap-3 py-2">
                            <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}.</span>
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "hsl(var(--primary) / 0.12)", color: "hsl(var(--primary))" }}>
                              {p.number}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">{p.name}</p>
                              <p className="text-[10px] text-muted-foreground">{p.position}</p>
                            </div>
                            <span className="text-sm font-bold text-primary">{p.rating}</span>
                          </div>
                        ))}
                      </div>
                    </RevealSection>

                    <RevealSection delay={160}>
                      <div className="match-card space-y-3">
                        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <Target className="w-3.5 h-3.5 text-primary" /> Artilheiros
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
                            <span className="text-sm font-bold text-foreground">⚽ {p.goals}</span>
                          </div>
                        ))}
                      </div>
                    </RevealSection>
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
