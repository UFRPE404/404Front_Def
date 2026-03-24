import { useNavigate } from "react-router-dom";
import { generateMatchAnalysis } from "@/utils/matchAnalysis";
import { useMemo } from "react";

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

/** Generate mock "last 10 matches" averages for a team, tailored by sport */
function generateTeamAvgStats(teamName: string, sport?: string) {
  const s = teamSeed(teamName);
  const r = (salt: number) => ((s * (salt + 1) * 17) % 100) / 100; // 0..1

  if (sport === "Basquete") {
    return [
      { label: "Pontos/jogo", value: +(98 + r(1) * 24).toFixed(1) },
      { label: "Rebotes/jogo", value: +(38 + r(2) * 12).toFixed(1) },
      { label: "Assist./jogo", value: +(20 + r(3) * 10).toFixed(1) },
    ];
  }
  if (sport === "Tênis") {
    return [
      { label: "Aces/jogo", value: +(4 + r(1) * 8).toFixed(1) },
      { label: "1° Serv. %", value: +(58 + r(2) * 15).toFixed(0) + "%" },
      { label: "Break Pts/jogo", value: +(1 + r(3) * 4).toFixed(1) },
    ];
  }
  if (sport === "Vôlei") {
    return [
      { label: "Pontos/jogo", value: +(55 + r(1) * 20).toFixed(1) },
      { label: "Aces/jogo", value: +(2 + r(2) * 5).toFixed(1) },
      { label: "Bloq./jogo", value: +(3 + r(3) * 5).toFixed(1) },
    ];
  }
  // Futebol (default)
  return [
    { label: "Gols/jogo", value: +(0.8 + r(1) * 2.2).toFixed(1) },
    { label: "Cartões/jogo", value: +(1.2 + r(2) * 2.8).toFixed(1) },
    { label: "Escanteios/jogo", value: +(3.5 + r(3) * 5.5).toFixed(1) },
  ];
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

/** Deterministic last-5 form for a team */
function generateTeamForm(teamName: string): FormResult[] {
  const s = teamSeed(teamName);
  return Array.from({ length: 5 }, (_, i) => {
    const v = (s * (i + 7) * 31 + i * 17) % 10;
    if (v < 5) return "V";
    if (v < 7) return "E";
    return "D";
  });
}

/** 5 colored squares showing V/E/D form */
function FormSquares({ form }: { form: FormResult[] }) {
  return (
    <div className="flex gap-1">
      {form.map((r, i) => (
        <div
          key={i}
          className={`w-6 h-6 rounded-sm flex items-center justify-center text-[10px] font-black text-white ${
            r === "V" ? "bg-green-500" : r === "E" ? "bg-muted-foreground/50" : "bg-destructive/80"
          }`}
        >
          {r}
        </div>
      ))}
    </div>
  );
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
  odds, sport, period, date
}: MatchProps) => {
  const navigate = useNavigate();
  const matchAnalysis = generateMatchAnalysis(time, scoreA, scoreB, odds, sport, live);

  // Pre-match: deterministic "last 10 matches" averages
  const statsA = useMemo(() => generateTeamAvgStats(teamA, sport), [teamA, sport]);
  const statsB = useMemo(() => generateTeamAvgStats(teamB, sport), [teamB, sport]);
  // Live: deterministic in-match stats
  const liveStats = useMemo(() => generateLiveStats(teamA, teamB, odds, sport), [teamA, teamB, odds, sport]);
  // Pre-match: last 5 form
  const formA = useMemo(() => generateTeamForm(teamA), [teamA]);
  const formB = useMemo(() => generateTeamForm(teamB), [teamB]);

  const handleCardClick = () => {
    navigate(`/analises/${encodeURIComponent(id)}`);
  };

  const probA = matchAnalysis.winProb.teamA;
  const probB = matchAnalysis.winProb.teamB;
  const probDraw = matchAnalysis.winProb.draw;

  return (
    <div 
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
              /* ====== PRÉ-JOGO: Forma + Média últimas partidas ====== */
              <div className="flex flex-col gap-2">
                {/* Form últimas 5 */}
                <div className="bg-secondary/20 rounded-lg p-2.5 border border-border/30">
                  <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest block text-center mb-2">
                    Últimas 5 partidas
                  </span>
                  <div className="flex items-center justify-between gap-2">
                    <FormSquares form={formA} />
                    <span className="text-[9px] uppercase font-bold text-muted-foreground/50 tracking-widest shrink-0">FORM</span>
                    {/* Reverse team B form so most recent is on the inside */}
                    <FormSquares form={[...formB].reverse()} />
                  </div>
                </div>

                {/* Médias */}
                <div className="flex flex-col gap-1.5 bg-secondary/20 rounded-lg p-2.5 border border-border/30">
                  <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest text-center mb-0.5">
                    Média últimas 10 partidas
                  </span>
                  {statsA.map((stat, i) => (
                    <StatRow
                      key={stat.label}
                      label={stat.label}
                      valueA={stat.value}
                      valueB={statsB[i].value}
                      color={INSIGHT_COLORS[i]}
                    />
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchCard;