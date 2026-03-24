import { useNavigate } from "react-router-dom";
import { generateMatchAnalysis } from "@/utils/matchAnalysis";
import { Flag, Square } from "lucide-react";

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
}

const INSIGHT_COLORS = ["--insight-positive", "--insight-warning", "--insight-info"];

const MatchCard = ({ 
  id, league, time, live, teamA, teamB, scoreA, scoreB, 
  cornersA = 0, cornersB = 0, 
  cardsA = { yellow: 0, red: 0 }, cardsB = { yellow: 0, red: 0 }, 
  odds, sport 
}: MatchProps) => {
  const navigate = useNavigate();
  const matchAnalysis = generateMatchAnalysis(time, scoreA, scoreB, odds, sport, live);

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
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-md bg-secondary/50 text-[11px] font-bold uppercase tracking-widest text-secondary-foreground truncate max-w-[60%]">
              {league}
            </span>
            
            <div className="flex items-center gap-1.5">
              {live ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-destructive/10 text-destructive">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
                  </span>
                  <span className="text-[11px] font-bold tracking-widest uppercase">Ao Vivo</span>
                </div>
              ) : (
                <span className="text-[13px] font-semibold text-muted-foreground bg-secondary/30 px-2.5 py-1 rounded-md tracking-widest">
                  {time}
                </span>
              )}
            </div>
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
          <div className="overflow-hidden flex flex-col gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
            
            <div className="pt-2 border-t border-border/40 mt-3" />

            {/* Estatísticas Secundárias (Escanteios e Cartões) */}
            <div className="flex flex-col gap-2 px-2">
              
              {/* Escanteios */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-lg font-semibold w-6 text-right tabular-nums text-foreground/80">{cornersA}</span>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Flag className="w-3.5 h-3.5" />
                  <span className="text-[11px] uppercase font-bold tracking-widest">Escanteios</span>
                </div>
                <span className="text-lg font-semibold w-6 text-left tabular-nums text-foreground/80">{cornersB}</span>
              </div>

              {/* Cartões */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center justify-end w-12 gap-1.5 tabular-nums">
                  {cardsA.red > 0 && <span className="flex items-center text-destructive text-lg font-semibold">{cardsA.red} <Square className="w-3.5 h-3.5 ml-0.5 fill-destructive" /></span>}
                  <span className="flex items-center text-yellow-500 text-lg font-semibold">{cardsA.yellow} <Square className="w-3.5 h-3.5 ml-0.5 fill-yellow-500" /></span>
                </div>
                
                <span className="text-[11px] uppercase font-bold text-muted-foreground tracking-widest">Cartões</span>
                
                <div className="flex items-center justify-start w-12 gap-1.5 tabular-nums">
                  <span className="flex items-center text-yellow-500 text-lg font-semibold"><Square className="w-3.5 h-3.5 mr-0.5 fill-yellow-500" /> {cardsB.yellow}</span>
                  {cardsB.red > 0 && <span className="flex items-center text-destructive text-lg font-semibold"><Square className="w-3.5 h-3.5 mr-0.5 fill-destructive" /> {cardsB.red}</span>}
                </div>
              </div>

            </div>

            {/* Win Probability Bar */}
            <div className="w-full flex flex-col gap-1 px-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground text-center mb-1 tracking-widest">Probabilidade de Vitória</span>
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-foreground/70 w-8 text-right tracking-widest" style={{ color: "hsl(var(--insight-positive))" }}>{probA}%</span>
                <div className="flex-1 h-1.5 flex rounded-full overflow-hidden bg-secondary/40">
                  <div className="h-full transition-all duration-700" style={{ width: `${probA}%`, background: "hsl(var(--insight-positive))" }} />
                  {probDraw > 3 && (
                    <div className="h-full bg-muted-foreground/30 transition-all duration-700" style={{ width: `${probDraw}%` }} />
                  )}
                  <div className="h-full transition-all duration-700" style={{ width: `${probB}%`, background: "hsl(var(--insight-warning))" }} />
                </div>
                <span className="text-base font-semibold text-foreground/70 w-8 text-left tracking-widest" style={{ color: "hsl(var(--insight-warning))" }}>{probB}%</span>
              </div>
            </div>

            {/* Dashboard-Style Insights Grid */}
            <div className="grid grid-cols-3 gap-2 pb-2">
              {matchAnalysis.lines.map((line, i) => (
                <div 
                  key={line.label} 
                  className="bg-secondary/30 rounded-xl p-2.5 flex flex-col justify-between border border-border/30 hover:bg-secondary/50 transition-colors"
                >
                  <span className="text-[10px] uppercase font-bold text-muted-foreground mb-1.5 truncate tracking-widest">
                    {line.label}
                  </span>
                  <div className="flex items-end justify-between gap-1 mb-2">
                    <span className="text-sm font-bold text-foreground leading-none truncate pb-0.5">
                      {line.prediction}
                    </span>
                    <span className="text-sm font-semibold text-muted-foreground leading-none tracking-wide">
                      {line.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-background/50 h-1 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ 
                        width: `${line.percentage}%`, 
                        background: `hsl(var(${INSIGHT_COLORS[i]}))` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchCard;