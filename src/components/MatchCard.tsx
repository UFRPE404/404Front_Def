import { useNavigate } from "react-router-dom";
import { generateMatchAnalysis } from "@/utils/matchAnalysis";
import { useMemo, useState, useEffect, useRef } from "react";
import { getMatchOdds, getMatchH2H, type H2HApiData } from "@/services/matchesService";

interface MatchProps {
  id: string;
  league: string;
  time: string;
  live?: boolean;
  teamA: string;
  teamB: string;
  scoreA?: number;
  scoreB?: number;
  cornersA?: number;
  cornersB?: number;
  cardsA?: { yellow: number; red: number };
  cardsB?: { yellow: number; red: number };
  odds: [number, number, number];
  sport?: string;
  period?: string;
  date?: string;
}

const INSIGHT_COLORS = ["--insight-positive", "--insight-warning", "--insight-info"];

/** Deterministic pseudo-random from team name — stable across re-renders */
function teamSeed(name: string): number {
  return name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
}

/** Generate deterministic live match stats (A vs B) by sport */
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
  // Futebol
  return [
    { label: "Posse", a: Math.round(42 + rA(1) * 16 * bias) + "%", b: Math.round(42 + rB(1) * 16 * (2 - bias)) + "%" },
    { label: "Finalizações", a: Math.round(4 + rA(2) * 10 * bias), b: Math.round(4 + rB(2) * 10 * (2 - bias)) },
    { label: "Faltas", a: Math.round(6 + rA(3) * 10 * (2 - bias)), b: Math.round(6 + rB(3) * 10 * bias) },
  ];
}

type FormResult = "V" | "E" | "D";

/** 5 colored squares showing V/E/D form */
function FormSquares({ form }: { form: FormResult[] }) {
  return (
    <div className="flex gap-1 flex-1">
      {form.map((r, i) => (
        <div
          key={i}
          className={`flex-1 aspect-square rounded-sm flex items-center justify-center text-[10px] font-black text-white min-w-0 ${
            r === "V" ? "bg-green-500" : r === "E" ? "bg-muted-foreground/50" : "bg-destructive/80"
          }`}
        >
          {r}
        </div>
      ))}
    </div>
  );
}

/** Generate a deterministic mock AI insight sentence for the card footer */
function generateAIInsight(
  teamA: string, teamB: string,
  odds: [number, number, number],
  sport?: string,
  live?: boolean, scoreA?: number, scoreB?: number,
): string {
  const s = (teamSeed(teamA) + teamSeed(teamB)) % 1000;
  const pick = (arr: string[]) => arr[s % arr.length];
  const favoriteA = odds[0] <= odds[2];
  const fav = favoriteA ? teamA : teamB;
  const dog = favoriteA ? teamB : teamA;
  const oddsGap = Math.abs(odds[0] - odds[2]);
  const balanced = oddsGap < 0.5;

  if (live && scoreA !== undefined && scoreB !== undefined) {
    const winnerTeam = scoreA > scoreB ? teamA : scoreB > scoreA ? teamB : null;
    const loserTeam  = scoreA > scoreB ? teamB : scoreB > scoreA ? teamA : null;
    if (winnerTeam && loserTeam) {
      return pick([
        `${winnerTeam} controla o jogo e a vantagem no placar dificulta a reação adversária. Padrão indica manutenção do resultado.`,
        `A pressão de ${loserTeam} cresce, mas ${winnerTeam} explora bem os espaços em contra-ataque. Odd de handicap pode ser atrativa.`,
        `${winnerTeam} impõe seu estilo e o sistema defensivo tem sido eficiente. Probabilidade de reversão se mantém baixa.`,
        `Domínio de ${winnerTeam} refletido no placar. Mercado de "ambas marcam" ganha relevância se ${loserTeam} abrir o jogo.`,
      ]);
    }
    return pick([
      `Equilíbrio total até agora. ${fav} tem o favoritismo das odds mas ainda não converteu chances claras em gol.`,
      `Empate justo dado o confronto direto até o momento. A qualidade de ${fav} pode ser decisiva nos minutos finais.`,
      `Nenhuma equipe domina com clareza. Mercado de "próximo gol" apresenta valor com ${fav} ligeiramente superior.`,
    ]);
  }

  // Pre-match
  if (sport === "Tênis") {
    return pick([
      `${fav} chega com melhor aproveitamento em sets disputados. Confrontos anteriores favorecem o favorito nas odds.`,
      `Saque potente de ${fav} é vantagem crucial em quadras rápidas. Percentual de 1° serviço será o fator-chave.`,
      `${dog} tem histórico de surpreender em torneios deste nível. A jornada física recente pode ser determinante.`,
    ]);
  }
  if (sport === "Basquete") {
    return pick([
      `${fav} apresenta média ofensiva superior. O ritmo de jogo ditado por eles tende a abrir vantagens nos quartos finais.`,
      `Confronto de estilos: ${fav} prefere jogo de transição enquanto ${dog} aposta na meia-quadra. Spread de pontos é atrativo.`,
      `${fav} tem o melhor ataque do confronto em média recente. Over de pontos totais tem apelo histórico nessa matchup.`,
    ]);
  }
  if (sport === "Vôlei") {
    return pick([
      `${fav} lidera em eficiência de ataque nas últimas rodadas. Presença no bloqueio será determinante para o placar por sets.`,
      `Confronto técnico com ${fav} em vantagem de saque. Handicap de sets apresenta valor dado o histórico recente.`,
    ]);
  }
  // Futebol
  if (balanced) {
    return pick([
      `Odds equilibradas refletem incerteza real. O fator mando de campo e a forma recente serão determinantes.`,
      `Confronto parelho onde pequenos detalhes decidem. Mercado de escanteios pode oferecer oportunidade de valor.`,
      `Histórico de h2h entre ${teamA} e ${teamB} tende a ser disputado. Gols nos acréscimos são frequentes nesse duelo.`,
    ]);
  }
  return pick([
    `${fav} chega como favorito claro e a forma recente reforça essa expectativa. Odd de -1 pode ser explorada.`,
    `As estatísticas de ${fav} nas últimas rodadas justificam o favoritismo. ${dog} raramente supera defensas organizadas.`,
    `${fav} tem vantagem em todas as métricas ofensivas relevantes. Linha de gols acima de 1.5 tem apelo histórico.`,
    `Pressão ofensiva de ${fav} deve ser evidente desde o início. Primeiro tempo apresenta valor de aposta nessa análise.`,
  ]);
}

/** Compact stat row used in both live and pre-match hover */
function StatRow({ label, valueA, valueB, color }: { label: string; valueA: string | number; valueB: string | number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-8 text-right text-[13px] font-bold tabular-nums text-foreground/80">{valueA}</span>
      <div className="flex-1 flex items-center justify-center">
        <span className="text-[10px] uppercase font-bold tracking-widest" style={{ color: `hsl(var(${color}))` }}>
          {label}
        </span>
      </div>
      <span className="w-8 text-left text-[13px] font-bold tabular-nums text-foreground/80">{valueB}</span>
    </div>
  );
}

const MatchCard = ({ 
  id, league, time, live, teamA, teamB, scoreA, scoreB, 
  cornersA = 0, cornersB = 0, 
  cardsA = { yellow: 0, red: 0 }, cardsB = { yellow: 0, red: 0 }, 
  odds: initialOdds, sport, period, date
}: MatchProps) => {
  const navigate = useNavigate();

  // Progressive odds loading: fetch real odds when card becomes visible
  const [realOdds, setRealOdds] = useState<[number, number, number] | null>(null);
  const [h2hData, setH2hData] = useState<H2HApiData | null>(null);
  const [h2hLoading, setH2hLoading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const oddsFetched = useRef(false);
  const h2hFetched = useRef(false);

  const isPlaceholderOdds = initialOdds[0] === 1.50 && initialOdds[1] === 3.50 && initialOdds[2] === 4.00;

  useEffect(() => {
    if (live || oddsFetched.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !oddsFetched.current) {
          oddsFetched.current = true;
          observer.disconnect();
          if (isPlaceholderOdds) {
            getMatchOdds(id).then(({ simpleOdds }) => {
              if (simpleOdds) setRealOdds(simpleOdds);
            });
          }
          // Fetch H2H lazily
          if (!h2hFetched.current) {
            h2hFetched.current = true;
            setH2hLoading(true);
            getMatchH2H(id).then(setH2hData).finally(() => setH2hLoading(false));
          }
        }
      },
      { rootMargin: "200px" }
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [id, isPlaceholderOdds, live]);

  const odds = realOdds ?? initialOdds;
  const matchAnalysis = generateMatchAnalysis(time, scoreA, scoreB, odds, sport, live);

  // Live: deterministic in-match stats
  const liveStats = useMemo(() => generateLiveStats(teamA, teamB, odds, sport), [teamA, teamB, odds, sport]);

  // H2H derived data
  const h2hMatches = h2hData?.h2h ?? [];
  const homeForm: FormResult[] = (h2hData?.homeLastMatches ?? []).slice(0, 5).map(m => m.winner === 'home' ? 'V' : m.winner === 'draw' ? 'E' : 'D');
  const awayForm: FormResult[] = (h2hData?.awayLastMatches ?? []).slice(0, 5).map(m => m.winner === 'home' ? 'V' : m.winner === 'draw' ? 'E' : 'D');
  // AI insight sentence
  const aiInsight = useMemo(
    () => generateAIInsight(teamA, teamB, odds, sport, live, scoreA, scoreB),
    [teamA, teamB, odds, sport, live, scoreA, scoreB]
  );

  const handleCardClick = () => {
    navigate(`/analises/${encodeURIComponent(id)}`);
  };

  const probA = matchAnalysis.winProb.teamA;
  const probB = matchAnalysis.winProb.teamB;
  const probDraw = matchAnalysis.winProb.draw;

  return (
    <div 
      ref={cardRef}
      onClick={handleCardClick}
      /* AQUI ESTÁ A MÁGICA: Adicionei font-square e tracking-wide no contêiner principal */
      className="font-square tracking-wide group relative overflow-hidden rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-all duration-500 cursor-pointer shadow-sm hover:shadow-md"
    >
      {/* Immersive Probability Background */}
      <div 
        className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 pointer-events-none"
        style={{
          background: `linear-gradient(90deg, 
            hsl(var(--insight-positive)) 0%, 
            transparent ${probA + 10}%, 
            transparent ${100 - (probB + 10)}%, 
            hsl(var(--insight-warning)) 100%)`
        }}
      />

      <div className="relative z-10 p-4 flex flex-col">
        
        {/* =========================================
            CABEÇALHO E PLACAR
            ========================================= */}
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <span className="px-2.5 py-1 rounded-md bg-secondary/50 text-[11px] font-bold uppercase tracking-widest text-secondary-foreground truncate min-w-0">
              {league}
            </span>

            {live ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-destructive/10 text-destructive shrink-0">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
                </span>
                <span className="text-[11px] font-bold tracking-widest uppercase">Ao Vivo</span>
                <span className="text-[11px] font-bold tabular-nums tracking-widest text-destructive/70">
                  · {time}{period ? ` · ${period}` : ""}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-secondary/30 px-2.5 py-1 rounded-md shrink-0">
                {date && (
                  <>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-primary/80 leading-none">
                      {date}
                    </span>
                    <span className="text-muted-foreground/30 text-[11px] leading-none">·</span>
                  </>
                )}
                <span className="text-[13px] font-semibold text-muted-foreground tracking-widest leading-none">
                  {time}
                </span>
              </div>
            )}
          </div>

          {/* Confronto */}
          <div className="flex items-stretch justify-between gap-3 py-1">
            <div className="flex-1 flex items-center justify-end min-h-[2.75rem] sm:min-h-[3rem]">
              <span className="text-base sm:text-lg font-bold text-foreground leading-tight uppercase line-clamp-2 text-right">
                {teamA}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center min-w-[72px]">
              {(scoreA !== undefined && scoreB !== undefined) ? (
                <div className="text-4xl font-bold tabular-nums text-foreground flex items-center justify-center gap-1.5">
                  <span>{scoreA}</span>
                  <span className="text-muted-foreground/40 font-medium text-2xl pb-1.5">-</span>
                  <span>{scoreB}</span>
                </div>
              ) : (
                <span className="text-sm font-black text-muted-foreground/40 uppercase tracking-widest">VS</span>
              )}
            </div>

            <div className="flex-1 flex items-center justify-start min-h-[2.75rem] sm:min-h-[3rem]">
              <span className="text-base sm:text-lg font-bold text-foreground leading-tight uppercase line-clamp-2">
                {teamB}
              </span>
            </div>
          </div>
        </div>

        {/* =========================================
            ÁREA EXPANSÍVEL (ON HOVER)
            ========================================= */}
        <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-in-out">
          <div className="overflow-hidden flex flex-col gap-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
            
            <div className="border-t border-border/40 mt-3" />

            {/* Win Probability Bar — compact */}
            <div className="flex items-center gap-1.5 px-1">
              <span className="text-[12px] font-bold tabular-nums shrink-0" style={{ color: "hsl(var(--insight-positive))" }}>{probA}%</span>
              <div className="flex-1 h-1.5 flex rounded-full overflow-hidden bg-secondary/40">
                <div className="h-full transition-all duration-700" style={{ width: `${probA}%`, background: "hsl(var(--insight-positive))" }} />
                {probDraw > 3 && (
                  <div className="h-full bg-muted-foreground/30 transition-all duration-700" style={{ width: `${probDraw}%` }} />
                )}
                <div className="h-full transition-all duration-700" style={{ width: `${probB}%`, background: "hsl(var(--insight-warning))" }} />
              </div>
              <span className="text-[12px] font-bold tabular-nums shrink-0" style={{ color: "hsl(var(--insight-warning))" }}>{probB}%</span>
            </div>

            {live ? (
              /* ====== LIVE: Stats reais da partida A vs B ====== */
              <div className="flex flex-col gap-1.5 bg-secondary/20 rounded-lg p-2.5 border border-border/30">
                <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest text-center mb-0.5">
                  Estatísticas da Partida
                </span>
                {liveStats.map((stat, i) => (
                  <StatRow
                    key={stat.label}
                    label={stat.label}
                    valueA={stat.a}
                    valueB={stat.b}
                    color={INSIGHT_COLORS[i]}
                  />
                ))}
              </div>
            ) : (
              /* ====== PRÉ-JOGO: H2H real ====== */
              <div className="flex flex-col gap-2">
                {h2hLoading && (
                  <div className="bg-secondary/20 rounded-lg p-3 border border-border/30 flex items-center justify-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] text-muted-foreground">Carregando confrontos...</span>
                  </div>
                )}

                {!h2hLoading && h2hData && (
                  <>
                    {/* Form últimas 5 de cada time — dados reais */}
                    {(homeForm.length > 0 || awayForm.length > 0) && (
                      <div className="bg-secondary/20 rounded-lg p-2.5 border border-border/30">
                        <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest block text-center mb-2">
                          Últimas 5 partidas
                        </span>
                        <div className="flex items-center gap-2 w-full">
                          <FormSquares form={homeForm.length ? homeForm : ['E','E','E','E','E']} />
                          <span className="text-[9px] uppercase font-bold text-muted-foreground/50 tracking-widest shrink-0">FORM</span>
                          <FormSquares form={awayForm.length ? [...awayForm].reverse() : ['E','E','E','E','E']} />
                        </div>
                      </div>
                    )}

                    {/* Confrontos diretos */}
                    {h2hMatches.length > 0 ? (
                      <div className="bg-secondary/20 rounded-lg p-2.5 border border-border/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">Confrontos Diretos</span>
                          <span className="text-[9px] text-muted-foreground/60">{h2hData.stats.totalMatches} jogos</span>
                        </div>
                        {/* Win strip */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-black text-primary tabular-nums">{h2hData.stats.homeWins}V</span>
                          <div className="flex-1 mx-2 h-1.5 flex rounded-full overflow-hidden bg-secondary/40">
                            {(() => { const t = h2hData.stats.totalMatches || 1; return (<>{h2hData.stats.homeWins > 0 && <div className="h-full bg-primary" style={{width:`${(h2hData.stats.homeWins/t)*100}%`}} />}{h2hData.stats.draws > 0 && <div className="h-full bg-muted-foreground/40" style={{width:`${(h2hData.stats.draws/t)*100}%`}} />}{h2hData.stats.awayWins > 0 && <div className="h-full bg-orange-500" style={{width:`${(h2hData.stats.awayWins/t)*100}%`}} />}</>); })()}
                          </div>
                          <span className="text-[11px] font-black text-orange-500 tabular-nums">{h2hData.stats.awayWins}V</span>
                        </div>
                        {/* Last 3 H2H matches */}
                        <div className="flex flex-col gap-1">
                          {h2hMatches.slice(0, 3).map((m, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-[10px]">
                              <span className={`font-black px-1 py-0.5 rounded text-[8px] ${
                                m.winner === 'home' ? 'bg-emerald-500/15 text-emerald-400' : m.winner === 'away' ? 'bg-red-500/15 text-red-400' : 'bg-muted text-muted-foreground'
                              }`}>{m.winner === 'home' ? 'V' : m.winner === 'away' ? 'D' : 'E'}</span>
                              <span className="text-muted-foreground/60 tabular-nums">{m.date}</span>
                              <span className="font-semibold text-foreground/80 truncate">{m.home}</span>
                              <span className="font-black text-foreground tabular-nums">{m.score}</span>
                              <span className="font-semibold text-foreground/80 truncate">{m.away}</span>
                            </div>
                          ))}
                        </div>
                        {/* Stats row */}
                        <div className="flex items-center justify-around mt-2 pt-2 border-t border-border/20">
                          <div className="text-center"><span className="text-[11px] font-black text-foreground">{h2hData.stats.avgGoals}</span><span className="text-[8px] text-muted-foreground block">Gols/jogo</span></div>
                          <div className="text-center"><span className="text-[11px] font-black text-foreground">{h2hData.stats.bttsPercentage}%</span><span className="text-[8px] text-muted-foreground block">Ambos marcam</span></div>
                          <div className="text-center"><span className="text-[11px] font-black text-foreground">{h2hData.stats.draws}</span><span className="text-[8px] text-muted-foreground block">Empates</span></div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-secondary/20 rounded-lg p-2.5 border border-border/30 text-center">
                        <span className="text-[10px] text-muted-foreground">Sem confrontos diretos recentes</span>
                      </div>
                    )}
                  </>
                )}

                {!h2hLoading && !h2hData && (
                  <div className="bg-secondary/20 rounded-lg p-2.5 border border-border/30 text-center">
                    <span className="text-[10px] text-muted-foreground">Confrontos indisponíveis</span>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* =========================================
            ANÁLISE DA IA — sempre visível no rodé
            ========================================= */}
        <div className="mt-3 pt-3 border-t border-border/40">
          <div className="flex gap-2.5">
            {/* Borda gradiente lateral */}
            <div className="w-[2px] self-stretch rounded-full shrink-0 bg-gradient-to-b from-primary/70 via-primary/30 to-transparent" />
            <div className="flex flex-col gap-1 min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="shrink-0">
                  <path d="M5 0l1.12 3.38L9.51 5 6.12 6.62 5 10 3.88 6.62.49 5l3.39-1.62Z" fill="hsl(var(--primary))" opacity="0.85"/>
                </svg>
                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-primary/75">
                  Análise IA
                </span>
                <span className="ml-auto text-[9px] text-muted-foreground/30 normal-case tracking-normal font-normal">
                  preview
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground/75 italic line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
                {aiInsight}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MatchCard;