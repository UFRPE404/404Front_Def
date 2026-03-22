import { Timer } from "lucide-react";
import MatchCard from "./MatchCard";

const liveMatches = [
  {
    league: "Brasileirão Série A",
    time: "67'",
    live: true,
    teamA: "Flamengo",
    teamB: "Palmeiras",
    scoreA: 1,
    scoreB: 2,
    odds: [2.45, 3.20, 2.90] as [number, number, number],
  },
  {
    league: "Premier League",
    time: "34'",
    live: true,
    teamA: "Chelsea",
    teamB: "Tottenham",
    scoreA: 0,
    scoreB: 1,
    odds: [3.10, 3.40, 2.15] as [number, number, number],
  },
  {
    league: "La Liga",
    time: "82'",
    live: true,
    teamA: "Sevilla",
    teamB: "Valencia",
    scoreA: 3,
    scoreB: 1,
    odds: [1.25, 5.50, 9.00] as [number, number, number],
  },
  {
    league: "Brasileirão Série A",
    time: "12'",
    live: true,
    teamA: "Corinthians",
    teamB: "São Paulo",
    scoreA: 0,
    scoreB: 0,
    odds: [2.30, 3.15, 3.05] as [number, number, number],
  },
];

const LiveMatches = () => {
  return (
    <section className="px-4 mt-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
          </span>
          <h2 className="text-lg font-bold text-foreground">Ao Vivo</h2>
          <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
            {liveMatches.length} jogos
          </span>
        </div>
        <button className="text-xs font-medium text-primary hover:underline transition-colors">
          Ver todos →
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {liveMatches.map((match, i) => (
          <div
            key={i}
            className="animate-in fade-in slide-in-from-bottom-3"
            style={{
              animationDelay: `${i * 80}ms`,
              animationFillMode: "both",
              animationDuration: "500ms",
            }}
          >
            <MatchCard {...match} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default LiveMatches;
