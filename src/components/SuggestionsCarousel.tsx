import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SuggestedBetCard from "./SuggestedBetCard";
import { useAllSuggestedBets } from "@/hooks/useSuggestedBets";
import { dreamBets } from "@/data/matches";

const SuggestionsCarousel = () => {
  const { bets } = useAllSuggestedBets();
  const scrollRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number | null>(null);

  const dreamIds = new Set(dreamBets.map((b) => b.id));

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const container = scrollRef.current;
    const distance = dir === "left" ? -300 : 300;
    const start = container.scrollLeft;
    const duration = 450;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      container.scrollLeft = start + distance * eased;
      if (progress < 1) animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
  };

  return (
    <section className="px-4 mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">Sugestões de Apostas do Dia</h2>
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
        className="flex gap-3 overflow-x-auto pb-2"
        style={{ scrollbarWidth: "none" }}
      >
        {bets.map((bet, i) => (
          <div
            key={bet.id}
            className="flex-shrink-0 w-[280px] animate-in fade-in slide-in-from-bottom-3"
            style={{
              animationDelay: `${i * 70}ms`,
              animationFillMode: "both",
              animationDuration: "500ms",
            }}
          >
            <SuggestedBetCard
              {...bet}
              theme={dreamIds.has(bet.id) ? "dream" : "best"}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default SuggestionsCarousel;
