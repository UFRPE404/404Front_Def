import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BetSlip from "@/components/BetSlip";
import LiveSportFilter from "@/components/LiveSportFilter";
import LeagueFilter from "@/components/LeagueFilter";
import { useLiveMatches } from "@/hooks/useMatchesData";
import { generateMatchAnalysis } from "@/utils/matchAnalysis";
import { useBetSlip } from "@/contexts/BetSlipContext";
import { getFeaturedMatches, getMatchTier } from "@/utils/matchPriority";
import { ChevronLeft, ChevronRight, Trophy, Dumbbell, Target, Volleyball, Gamepad2, Zap, Flame, Star, Sparkles } from "lucide-react";

/* ── helpers ───────────────────────────────────── */

function teamSeed(name: string): number {
  return name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
}

function generateLiveStats(teamA: string, teamB: string, odds: [number, number, number], sport?: string) {
  const sA = teamSeed(teamA);
  const sB = teamSeed(teamB);
  const bias = odds[0] < odds[2] ? 1.12 : 0.88;
  const rA = (salt: number) => ((sA * (salt + 1) * 13) % 100) / 100;
  const rB = (salt: number) => ((sB * (salt + 1) * 13) % 100) / 100;
  if (sport === "Basquete") {
    return [
      { label: "Rebotes", a: Math.round(32 + rA(1) * 14 * bias), b: Math.round(32 + rB(1) * 14 * (2 - bias)) },
      { label: "Assistências", a: Math.round(16 + rA(2) * 12 * bias), b: Math.round(16 + rB(2) * 12 * (2 - bias)) },
      { label: "Turnovers", a: Math.round(8 + rA(3) * 8 * (2 - bias)), b: Math.round(8 + rB(3) * 8 * bias) },
    ];
  }
  if (sport === "Tênis") {
    return [
      { label: "Aces", a: Math.round(3 + rA(1) * 8 * bias), b: Math.round(3 + rB(1) * 8 * (2 - bias)) },
      { label: "Winners", a: Math.round(12 + rA(2) * 18 * bias), b: Math.round(12 + rB(2) * 18 * (2 - bias)) },
      { label: "Erros N.F.", a: Math.round(8 + rA(3) * 14 * (2 - bias)), b: Math.round(8 + rB(3) * 14 * bias) },
    ];
  }
  if (sport === "Vôlei") {
    return [
      { label: "Ataques", a: Math.round(22 + rA(1) * 16 * bias), b: Math.round(22 + rB(1) * 16 * (2 - bias)) },
      { label: "Bloqueios", a: Math.round(3 + rA(2) * 6 * bias), b: Math.round(3 + rB(2) * 6 * (2 - bias)) },
      { label: "Erros", a: Math.round(6 + rA(3) * 10 * (2 - bias)), b: Math.round(6 + rB(3) * 10 * bias) },
    ];
  }
  return [
    { label: "Posse", a: `${Math.round(42 + rA(1) * 16 * bias)}%`, b: `${Math.round(42 + rB(1) * 16 * (2 - bias))}%` },
    { label: "Finalizações", a: Math.round(4 + rA(2) * 10 * bias), b: Math.round(4 + rB(2) * 10 * (2 - bias)) },
    { label: "Faltas", a: Math.round(6 + rA(3) * 10 * (2 - bias)), b: Math.round(6 + rB(3) * 10 * bias) },
  ];
}

function generateAIInsight(teamA: string, teamB: string, odds: [number, number, number], scoreA?: number, scoreB?: number): string {
  const s = (teamSeed(teamA) + teamSeed(teamB)) % 1000;
  const pick = (arr: string[]) => arr[s % arr.length];
  const favoriteA = odds[0] <= odds[2];
  const fav = favoriteA ? teamA : teamB;
  const dog = favoriteA ? teamB : teamA;

  if (scoreA !== undefined && scoreB !== undefined) {
    const winner = scoreA > scoreB ? teamA : scoreB > scoreA ? teamB : null;
    const loser = scoreA > scoreB ? teamB : scoreB > scoreA ? teamA : null;
    if (winner && loser) {
      return pick([
        `${winner} controla o jogo e a vantagem no placar dificulta a reação adversária. Padrão indica manutenção do resultado.`,
        `A pressão de ${loser} cresce, mas ${winner} explora bem os espaços em contra-ataque. Odd de handicap pode ser atrativa.`,
        `${winner} impõe seu estilo e o sistema defensivo tem sido eficiente. Probabilidade de reversão se mantém baixa.`,
      ]);
    }
    return pick([
      `Equilíbrio total. ${fav} tem o favoritismo das odds mas ainda não converteu chances claras.`,
      `Empate justo dado o confronto direto. A qualidade de ${fav} pode ser decisiva nos minutos finais.`,
    ]);
  }
  return `Análise disponível após o início da partida.`;
}

const sportIcons: Record<string, React.ElementType> = {
  Futebol: Trophy,
  Basquete: Dumbbell,
  "Tênis": Target,
  "Vôlei": Volleyball,
  "E-Sports": Gamepad2,
};

/* ── Compact score ticker card ─────────────────── */
function TickerCard({ match, onClick }: { match: any; onClick: () => void }) {
  const isWinningA = (match.scoreA ?? 0) > (match.scoreB ?? 0);
  const isWinningB = (match.scoreB ?? 0) > (match.scoreA ?? 0);
  return (
    <button onClick={onClick} className="shrink-0 flex flex-col gap-0.5 px-3 py-2 rounded-lg bg-card border border-border/40 hover:border-primary/30 transition-all min-w-[130px] text-left">
      <div className="flex items-center justify-between gap-3">
        <span className={`text-xs font-semibold truncate ${isWinningA ? "text-foreground" : "text-muted-foreground/70"}`}>{match.teamA.split(" ").pop()}</span>
        <span className={`text-xs font-black tabular-nums ${isWinningA ? "text-foreground" : "text-muted-foreground/50"}`}>{match.scoreA ?? 0}</span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className={`text-xs font-semibold truncate ${isWinningB ? "text-foreground" : "text-muted-foreground/70"}`}>{match.teamB.split(" ").pop()}</span>
        <span className={`text-xs font-black tabular-nums ${isWinningB ? "text-foreground" : "text-muted-foreground/50"}`}>{match.scoreB ?? 0}</span>
      </div>
      <div className="flex items-center gap-1 mt-1 pt-1 border-t border-border/20">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
        </span>
        <span className="text-[10px] text-emerald-500 font-semibold">{match.time}</span>
      </div>
    </button>
  );
}

/* ── Live match card ── */
function LiveMatchCard({ match }: { match: any }) {
  const navigate = useNavigate();
  const { addSelection, isSelected } = useBetSlip();
  const stats = useMemo(() => generateLiveStats(match.teamA, match.teamB, match.odds, match.sport), [match]);
  const analysis = generateMatchAnalysis(match.time, match.scoreA, match.scoreB, match.odds, match.sport, true);
  const aiInsight = useMemo(() => generateAIInsight(match.teamA, match.teamB, match.odds, match.scoreA, match.scoreB), [match]);
  const probA = analysis.winProb.teamA;
  const probB = analysis.winProb.teamB;
  const probDraw = analysis.winProb.draw;

  const isWinningA = (match.scoreA ?? 0) > (match.scoreB ?? 0);
  const isWinningB = (match.scoreB ?? 0) > (match.scoreA ?? 0);

  const pickLabels: Record<string, string> = { "1": match.teamA, "X": "Empate", "2": match.teamB };

  const handleOddClick = (e: React.MouseEvent, label: string, value: number) => {
    e.stopPropagation();
    addSelection({
      id: `${match.id}-${label}`,
      matchId: match.id,
      league: match.league,
      teamA: match.teamA,
      teamB: match.teamB,
      pick: pickLabels[label] ?? label,
      odds: value,
    });
  };

  return (
    <div
      onClick={() => navigate(`/analises/${encodeURIComponent(match.id)}`)}
      className="group relative overflow-hidden rounded-xl bg-card border border-border/40 hover:border-primary/40 transition-all duration-300 cursor-pointer"
    >
      <div className="p-4 pb-3 flex flex-col gap-3">

        {/* ── Row 1: Live badge + Period ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs font-bold text-emerald-500 tabular-nums">
              {match.time}
            </span>
            {match.period && (
              <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
                {match.period}
              </span>
            )}
          </div>
        </div>

        {/* ── Row 2: Teams + Scores (stacked, SofaScore/FlashScore style) ── */}
        <div className="flex flex-col gap-1.5">
          {/* Team A */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {isWinningA && <div className="w-0.5 h-4 rounded-full bg-emerald-500 shrink-0" />}
              <span className={`text-sm font-semibold truncate ${isWinningA ? "text-foreground" : "text-muted-foreground"}`}>
                {match.teamA}
              </span>
            </div>
            <span className={`text-lg font-black tabular-nums shrink-0 w-6 text-center ${isWinningA ? "text-foreground" : "text-muted-foreground/50"}`}>
              {match.scoreA ?? 0}
            </span>
          </div>
          {/* Team B */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {isWinningB && <div className="w-0.5 h-4 rounded-full bg-emerald-500 shrink-0" />}
              <span className={`text-sm font-semibold truncate ${isWinningB ? "text-foreground" : "text-muted-foreground"}`}>
                {match.teamB}
              </span>
            </div>
            <span className={`text-lg font-black tabular-nums shrink-0 w-6 text-center ${isWinningB ? "text-foreground" : "text-muted-foreground/50"}`}>
              {match.scoreB ?? 0}
            </span>
          </div>
        </div>

        {/* ── Row 3: Probability bar (always visible, thin + clean) ── */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold tabular-nums text-emerald-500 w-7 text-right">{probA}%</span>
          <div className="flex-1 h-1 flex rounded-full overflow-hidden bg-secondary/30">
            <div className="h-full bg-emerald-500/80 rounded-l-full transition-all duration-700" style={{ width: `${probA}%` }} />
            {probDraw > 3 && (
              <div className="h-full bg-muted-foreground/20 transition-all duration-700" style={{ width: `${probDraw}%` }} />
            )}
            <div className="h-full bg-amber-500/80 rounded-r-full transition-all duration-700" style={{ width: `${probB}%` }} />
          </div>
          <span className="text-[10px] font-bold tabular-nums text-amber-500 w-7">{probB}%</span>
        </div>

        {/* ── Row 4: Odds (always visible, compact) ── */}
        <div className="flex items-center gap-1.5">
          {[
            { label: "1", value: match.odds[0] },
            { label: "X", value: match.odds[1] },
            { label: "2", value: match.odds[2] },
          ].filter((_, i) => match.sport !== "Tênis" || i !== 1).map((o) => {
            const sel = isSelected(`${match.id}-${o.label}`);
            return (
              <button
                key={o.label}
                onClick={(e) => handleOddClick(e, o.label, o.value)}
                className={`flex-1 text-center text-[11px] font-semibold tabular-nums py-1.5 rounded-lg transition-all duration-200 ${
                  sel
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30 scale-[1.03]"
                    : "text-muted-foreground bg-secondary/40 hover:bg-secondary/70 hover:text-foreground"
                }`}
              >
                <span className={`mr-0.5 text-[10px] ${sel ? "text-primary-foreground/70" : "text-muted-foreground/40"}`}>{o.label}</span>
                {o.value.toFixed(2)}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Expandable hover section ── */}
      <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-400 ease-in-out">
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-1 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">

            {/* Divider */}
            <div className="border-t border-border/30" />

            {/* Stats grid (compact, 3 columns) */}
            <div className="grid grid-cols-3 gap-2">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col items-center gap-0.5 bg-secondary/20 rounded-lg py-2 px-1">
                  <div className="flex items-center gap-1.5 tabular-nums">
                    <span className="text-xs font-bold text-foreground/80">{stat.a}</span>
                    <span className="text-[9px] text-muted-foreground/40">-</span>
                    <span className="text-xs font-bold text-foreground/80">{stat.b}</span>
                  </div>
                  <span className="text-[9px] font-semibold text-muted-foreground/50 uppercase tracking-wider">{stat.label}</span>
                </div>
              ))}
            </div>

            {/* AI Insight */}
            <div className="flex gap-2">
              <div className="w-[2px] self-stretch rounded-full shrink-0 bg-gradient-to-b from-primary/60 to-transparent" />
              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-primary/70 shrink-0" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-primary/60">Análise IA</span>
                </div>
                <p className="text-[11px] leading-relaxed text-muted-foreground/70 italic line-clamp-2">
                  {aiInsight}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MAIN LIVE PAGE
   ══════════════════════════════════════════════════ */
const Live = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const sportParam = searchParams.get("sport");
  const [activeSport, setActiveSport] = useState(sportParam || "Todos");
  const [selectedLeagues, setSelectedLeagues] = useState<Set<string>>(new Set());

  const toggleLeague = useCallback((league: string) => {
    setSelectedLeagues((prev) => {
      const next = new Set(prev);
      if (next.has(league)) next.delete(league);
      else next.add(league);
      return next;
    });
  }, []);

  const clearLeagues = useCallback(() => setSelectedLeagues(new Set()), []);

  // Reset league filter when sport changes
  useEffect(() => {
    setSelectedLeagues(new Set());
  }, [activeSport]);

  const { matches: liveMatches } = useLiveMatches();
  const navigate = useNavigate();
  const tickerRef = useRef<HTMLDivElement>(null);
  const featuredScrollRef = useRef<HTMLDivElement>(null);

  // Priority-based featured live matches
  const featuredLive = useMemo(() => getFeaturedMatches(liveMatches), [liveMatches]);
  const featuredTier = featuredLive.length > 0 ? getMatchTier(featuredLive[0]) : 0;

  const sportCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Todos: liveMatches.length,
      ...(featuredLive.length > 0 ? { Destaques: featuredLive.length } : {}),
    };
    liveMatches.forEach((match) => {
      const sport = match.sport || "Outro";
      counts[sport] = (counts[sport] || 0) + 1;
    });
    return counts;
  }, [liveMatches, featuredLive]);

  const filteredMatches = useMemo(() => {
    if (activeSport === "Destaques") return featuredLive;
    if (activeSport === "Todos") return liveMatches;
    return liveMatches.filter((match) => match.sport === activeSport);
  }, [activeSport, liveMatches, featuredLive]);

  // Group matches by league (SofaScore pattern)
  const matchesByLeague = useMemo(() => {
    const groups: Record<string, typeof filteredMatches> = {};
    filteredMatches.forEach((m) => {
      const key = m.league;
      if (!groups[key]) groups[key] = [];
      groups[key].push(m);
    });
    return Object.entries(groups);
  }, [filteredMatches]);

  // League entries for the filter panel
  const leagueEntries = useMemo(
    () => matchesByLeague.map(([name, matches]) => ({ name, count: matches.length })),
    [matchesByLeague]
  );

  // Apply league filter (empty set = show all)
  const displayedLeagues = useMemo(() => {
    if (selectedLeagues.size === 0) return matchesByLeague;
    return matchesByLeague.filter(([league]) => selectedLeagues.has(league));
  }, [matchesByLeague, selectedLeagues]);

  const scrollTicker = (dir: number) => {
    tickerRef.current?.scrollBy({ left: dir * 200, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-6xl w-full mx-auto pb-8">

        {/* ── HEADER ────────────────────────────── */}
        <div className="px-4 pt-6 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
            <h1 className="text-2xl font-black text-foreground tracking-tight">Ao Vivo</h1>
            <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full ml-1 tabular-nums">
              {liveMatches.length} {liveMatches.length === 1 ? "jogo" : "jogos"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-5">Acompanhe todos os jogos em andamento em tempo real</p>

          {/* ── SCORE TICKER (FlashScore / 365Scores pattern) ── */}
          <div className="relative mb-5">
            <button
              onClick={() => scrollTicker(-1)}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-card border border-border/50 flex items-center justify-center shadow-md hover:bg-secondary transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <div ref={tickerRef} className="flex gap-2 overflow-x-auto px-8 py-1 scrollbar-none" style={{ scrollbarWidth: "none" }}>
              {liveMatches.map((m) => (
                <TickerCard
                  key={m.id}
                  match={m}
                  onClick={() => navigate(`/analises/${encodeURIComponent(m.id)}`)}
                />
              ))}
            </div>
            <button
              onClick={() => scrollTicker(1)}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-card border border-border/50 flex items-center justify-center shadow-md hover:bg-secondary transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* ── SPORT FILTER ────────────────────── */}
          <LiveSportFilter
            activeSport={activeSport}
            onSportChange={setActiveSport}
            sportCounts={sportCounts}
          />
        </div>

        {/* ── FEATURED LIVE SECTION ─────────────── */}
        {featuredLive.length > 0 && activeSport !== "Destaques" && (
          <div className="px-4 pb-2">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {featuredTier === 1
                  ? <Flame className="w-4 h-4 text-orange-400" />
                  : <Star className="w-4 h-4 text-yellow-400" />}
                <h2 className="text-sm font-black text-foreground uppercase tracking-wide">Destaques ao Vivo</h2>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={featuredTier === 1
                    ? { background: "rgba(251,146,60,0.15)", color: "rgb(251,146,60)" }
                    : { background: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))" }}
                >
                  {featuredTier === 1 ? "🔥 Elite" : "⭐ Importantes"}
                </span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => featuredScrollRef.current?.scrollBy({ left: -320, behavior: "smooth" })}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => featuredScrollRef.current?.scrollBy({ left: 320, behavior: "smooth" })}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div
              ref={featuredScrollRef}
              className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory"
              style={{ scrollbarWidth: "none" }}
            >
              {featuredLive.map((match, i) => (
                <div
                  key={match.id}
                  className="flex-shrink-0 w-[280px] snap-start animate-in fade-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${i * 50}ms`, animationFillMode: "both", animationDuration: "350ms" }}
                >
                  <LiveMatchCard match={match} />
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-border/30" />
          </div>
        )}

        {/* ── LEAGUE FILTER (mobile) ── */}
        {leagueEntries.length > 0 && (
          <div className="px-4 pb-2 lg:hidden">
            <LeagueFilter
              leagues={leagueEntries}
              selectedLeagues={selectedLeagues}
              onToggle={toggleLeague}
              onClear={clearLeagues}
              isMobile
            />
          </div>
        )}

        {/* ── MATCHES BY LEAGUE (SofaScore pattern) ── */}
        <div className="px-4 pt-4 flex gap-6 items-start">
          {/* Desktop League Filter Sidebar */}
          {leagueEntries.length > 0 && (
            <aside className="hidden lg:block w-56 flex-shrink-0">
              <LeagueFilter
                leagues={leagueEntries}
                selectedLeagues={selectedLeagues}
                onToggle={toggleLeague}
                onClear={clearLeagues}
              />
            </aside>
          )}

          <div className="flex-1 min-w-0 space-y-6">
          {displayedLeagues.length > 0 ? (
            displayedLeagues.map(([league, matches]) => {
              const SportIcon = sportIcons[matches[0]?.sport || "Futebol"] || Trophy;
              return (
                <div key={league}>
                  {/* League header */}
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <SportIcon className="w-3.5 h-3.5 text-primary/70" />
                    <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">{league}</h2>
                    <span className="text-[10px] text-muted-foreground/50 ml-auto">{matches.length} {matches.length === 1 ? "jogo" : "jogos"}</span>
                  </div>
                  {/* Match cards grid */}
                  <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(matches.length, 3)}, minmax(0, 420px))` }}>
                    {matches.map((match, index) => (
                      <div
                        key={match.id}
                        className="animate-in fade-in slide-in-from-bottom-2"
                        style={{
                          animationDelay: `${index * 40}ms`,
                          animationFillMode: "both",
                          animationDuration: "350ms",
                        }}
                      >
                        <LiveMatchCard match={match} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <Zap className="w-8 h-8 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground font-medium mb-1">
                {selectedLeagues.size > 0 ? "Nenhuma liga selecionada com jogos" : "Nenhum jogo ao vivo"}
              </p>
              <p className="text-muted-foreground/60 text-sm">
                {selectedLeagues.size > 0 ? "Ajuste o filtro de ligas" : "Selecione outro esporte ou volte mais tarde"}
              </p>
            </div>
          )}
          </div>
        </div>
      </main>

      <Footer />
      <BetSlip />
    </div>
  );
};

export default Live;
