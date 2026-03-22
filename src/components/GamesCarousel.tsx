import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MatchCard from "./MatchCard";

const games = [
  {
    league: "Bundesliga",
    time: "14:30",
    teamA: "Bayern Munich",
    teamB: "Borussia Dortmund",
    odds: [1.75, 3.80, 4.20] as [number, number, number],
  },
  {
    league: "Ligue 1",
    time: "17:00",
    teamA: "PSG",
    teamB: "Marseille",
    odds: [1.50, 4.10, 5.50] as [number, number, number],
  },
  {
    league: "Brasileirão Série B",
    time: "20:00",
    teamA: "Sport Recife",
    teamB: "Ceará",
    odds: [2.40, 3.10, 2.95] as [number, number, number],
  },
  {
    league: "Copa do Brasil",
    time: "21:45",
    teamA: "Grêmio",
    teamB: "Cruzeiro",
    odds: [2.15, 3.25, 3.30] as [number, number, number],
  },
  {
    league: "Eredivisie",
    time: "15:00",
    teamA: "Ajax",
    teamB: "PSV",
    odds: [2.50, 3.30, 2.70] as [number, number, number],
  },
  {
    league: "Liga Portugal",
    time: "18:30",
    teamA: "Benfica",
    teamB: "Porto",
    odds: [2.05, 3.40, 3.45] as [number, number, number],
  },
];

const GamesCarousel = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -320 : 320,
      behavior: "smooth",
    });
  };

  return (
    <section className="px-4 mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">Jogos</h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll("left")}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory"
        style={{ scrollbarWidth: "none" }}
      >
        {games.map((game, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-[280px] snap-start animate-in fade-in slide-in-from-bottom-3"
            style={{
              animationDelay: `${i * 70}ms`,
              animationFillMode: "both",
              animationDuration: "500ms",
            }}
          >
            <MatchCard {...game} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default GamesCarousel;
