import MatchCard from "./MatchCard";

const matches = [
  {
    league: "Brasileirão Série A",
    time: "21:30",
    live: true,
    teamA: "Flamengo",
    teamB: "Palmeiras",
    scoreA: 1,
    scoreB: 2,
    odds: [2.45, 3.20, 2.90] as [number, number, number],
  },
  {
    league: "Champions League",
    time: "16:00",
    teamA: "Real Madrid",
    teamB: "Manchester City",
    odds: [2.10, 3.40, 3.25] as [number, number, number],
  },
  {
    league: "Premier League",
    time: "13:30",
    teamA: "Arsenal",
    teamB: "Liverpool",
    odds: [2.60, 3.10, 2.75] as [number, number, number],
  },
  {
    league: "La Liga",
    time: "17:00",
    teamA: "Barcelona",
    teamB: "Atlético Madrid",
    odds: [1.85, 3.50, 4.10] as [number, number, number],
  },
  {
    league: "Brasileirão Série A",
    time: "19:00",
    live: true,
    teamA: "Corinthians",
    teamB: "São Paulo",
    scoreA: 0,
    scoreB: 0,
    odds: [2.30, 3.15, 3.05] as [number, number, number],
  },
  {
    league: "Serie A",
    time: "15:45",
    teamA: "Inter Milan",
    teamB: "Juventus",
    odds: [2.20, 3.30, 3.15] as [number, number, number],
  },
];

const FeaturedMatches = () => {
  return (
    <section className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">Sugestões</h2>
        <button className="text-xs font-medium text-primary hover:underline transition-colors">
          Ver todos →
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {matches.map((match, i) => (
          <div
            key={i}
            className="animate-in fade-in slide-in-from-bottom-3"
            style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both", animationDuration: "500ms" }}
          >
            <MatchCard {...match} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedMatches;
