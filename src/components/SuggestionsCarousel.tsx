import { useRef } from "react";
import { ChevronLeft, ChevronRight, Zap } from "lucide-react";
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
          <div className="flex items-center gap-5 py-4 px-1">
            {/* Spinner */}
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full border-3 border-secondary" />
              <div className="absolute inset-0 w-10 h-10 rounded-full border-3 border-transparent border-t-primary animate-spin" style={{ borderWidth: 3 }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary" />
              </div>
            </div>
            {/* Message */}
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-semibold text-foreground leading-tight">
                Farejando as melhores odds do mercado...
              </p>
              <p className="text-xs text-muted-foreground">Suas picks de maior valor estão chegando</p>
            </div>
            {/* Skeleton cards */}
            <div className="flex gap-3 overflow-hidden ml-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-[220px] h-[120px] rounded-xl bg-secondary/50 animate-pulse"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
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
