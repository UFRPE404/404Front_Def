import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const games = [
  { name: "Fortune Tiger", category: "Slots", image: "🐯" },
  { name: "Aviator", category: "Crash", image: "✈️" },
  { name: "Mines", category: "Instant", image: "💣" },
  { name: "Roleta Brasileira", category: "Cassino", image: "🎰" },
  { name: "Blackjack VIP", category: "Cartas", image: "🃏" },
  { name: "Spaceman", category: "Crash", image: "🚀" },
  { name: "Sweet Bonanza", category: "Slots", image: "🍬" },
  { name: "Crazy Time", category: "Ao Vivo", image: "🎡" },
  { name: "Plinko", category: "Instant", image: "⚡" },
  { name: "Dragon Tiger", category: "Cartas", image: "🐉" },
];

const GamesCarousel = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 260;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
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
        className="flex gap-3 overflow-x-auto scrollbar-thin pb-2 snap-x snap-mandatory"
        style={{ scrollbarWidth: "none" }}
      >
        {games.map((game, i) => (
          <button
            key={game.name}
            className="flex-shrink-0 w-[140px] group cursor-pointer animate-in fade-in slide-in-from-bottom-3"
            style={{
              animationDelay: `${i * 60}ms`,
              animationFillMode: "both",
              animationDuration: "500ms",
            }}
          >
            <div className="aspect-square rounded-xl bg-card border border-border flex items-center justify-center text-5xl transition-all duration-200 group-hover:border-primary/40 group-hover:shadow-[0_0_16px_hsl(var(--primary)/0.1)] group-active:scale-95">
              {game.image}
            </div>
            <p className="text-xs font-semibold text-foreground mt-2 truncate text-center">
              {game.name}
            </p>
            <p className="text-[10px] text-muted-foreground text-center">
              {game.category}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
};

export default GamesCarousel;
