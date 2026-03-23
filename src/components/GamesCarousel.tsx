import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MatchCard from "./MatchCard";
import { useCarouselMatches } from "@/hooks/useMatchesData";

const GamesCarousel = () => {
  const { matches: carouselMatches } = useCarouselMatches();
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
        {carouselMatches.map((game, i) => (
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
