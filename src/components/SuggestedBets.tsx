import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SuggestedBetCard from "./SuggestedBetCard";
import { useDreamBets, useBestOfDayBets } from "@/hooks/useSuggestedBets";

const SuggestedBets = () => {
  const { bets: dreamBets, loading: dreamLoading } = useDreamBets();
  const { bets: bestOfDayBets, loading: bestLoading } = useBestOfDayBets();
  const dreamScrollRef = useRef<HTMLDivElement>(null);
  const bestScrollRef = useRef<HTMLDivElement>(null);

  const scroll = (ref: React.RefObject<HTMLDivElement>, dir: "left" | "right") => {
    if (!ref.current) return;
    ref.current.scrollBy({
      left: dir === "left" ? -340 : 340,
      behavior: "smooth",
    });
  };

  const CarouselSection = ({
    title,
    description,
    bets,
    scrollRef: ref,
    theme,
    loading,
  }: {
    title: string;
    description: string;
    bets: typeof dreamBets;
    scrollRef: React.RefObject<HTMLDivElement>;
    theme: "dream" | "best";
    loading: boolean;
  }) => (
    <section className="px-4 mt-8">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-lg font-bold text-foreground">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => scroll(ref, "left")}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll(ref, "right")}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={ref}
        className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory"
        style={{ scrollbarWidth: "none" }}
      >
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className="flex-shrink-0 w-[300px] h-[180px] rounded-xl bg-secondary/50 animate-pulse snap-start"
            />
          ))
        ) : bets.length === 0 ? (
          <div className="flex items-center justify-center w-full py-8 text-muted-foreground text-sm">
            Nenhuma sugestão disponível no momento. Verifique se o servidor está rodando.
          </div>
        ) : (
          bets.map((bet, i) => (
            <div
              key={bet.id}
              className="flex-shrink-0 w-[300px] snap-start animate-in fade-in slide-in-from-bottom-3"
              style={{
                animationDelay: `${i * 70}ms`,
                animationFillMode: "both",
                animationDuration: "500ms",
              }}
            >
              <SuggestedBetCard {...bet} theme={theme} />
            </div>
          ))
        )}
      </div>
    </section>
  );

  return (
    <div className="space-y-8">
      <CarouselSection
        title="💰 Para Sonhar"
        description="Apostas com odds altas para aquele sonho grande"
        bets={dreamBets}
        scrollRef={dreamScrollRef}
        theme="dream"
        loading={dreamLoading}
      />
      <CarouselSection
        title="⭐ Melhores do Dia"
        description="Nossas principais picks para hoje"
        bets={bestOfDayBets}
        scrollRef={bestScrollRef}
        theme="best"
        loading={bestLoading}
      />
    </div>
  );
};

export default SuggestedBets;
