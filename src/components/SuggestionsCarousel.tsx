import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SuggestedBetCard from "./SuggestedBetCard";
import { useAllSuggestedBets } from "@/hooks/useSuggestedBets";

const SuggestionsCarousel = () => {
  const { bets, loading } = useAllSuggestedBets();
  const scrollRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number | null>(null);

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
      <div className="flex items-center justify-end mb-4">
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
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className="flex-shrink-0 w-[280px] h-[160px] rounded-xl bg-secondary/50 animate-pulse"
            />
          ))
        ) : bets.length === 0 ? (
          <div className="flex items-center justify-center w-full py-6 text-muted-foreground text-sm">
            Nenhuma sugestão disponível no momento.
          </div>
        ) : (
          bets.map((bet, i) => (
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
                theme={bet.type === "dream" ? "dream" : "best"}
              />
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default SuggestionsCarousel;
