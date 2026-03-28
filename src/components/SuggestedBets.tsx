import { useRef } from "react";
import { ChevronLeft, ChevronRight, Zap } from "lucide-react";
import SuggestedBetCard from "./SuggestedBetCard";
import { useDreamBets, useBestOfDayBets } from "@/hooks/useSuggestedBets";

const SuggestedBets = () => {
  const { bets: dreamBets, loading: dreamLoading } = useDreamBets();
  const { bets: bestOfDayBets, loading: bestLoading } = useBestOfDayBets();
  const dreamScrollRef = useRef<HTMLDivElement>(null);
  const bestScrollRef = useRef<HTMLDivElement>(null);

  const scroll = (
    ref: React.RefObject<HTMLDivElement>,
    dir: "left" | "right",
  ) => {
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
        className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory items-stretch"
        style={{ scrollbarWidth: "none" }}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-5">
            <div className="relative">
              <div className="w-14 h-14 rounded-full border-4 border-secondary" />
              <div className="absolute inset-0 w-14 h-14 rounded-full border-4 border-transparent border-t-primary animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-base font-bold text-foreground">Farejando as melhores odds do mercado...</p>
              <p className="text-sm text-muted-foreground">Cruzando dados de centenas de partidas para você</p>
            </div>
            <div className="flex gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="w-[260px] h-[160px] rounded-xl bg-secondary/50 animate-pulse flex-shrink-0"
                  style={{ animationDelay: `${i * 120}ms` }}
                />
              ))}
            </div>
          </div>
        ) : bets.length === 0 ? (
          <div className="flex items-center justify-center w-full py-8 text-muted-foreground text-sm">
            Nenhuma sugestão disponível no momento. Verifique se o servidor está
            rodando.
          </div>
        ) : (
          bets.map((bet, i) => (
            <div
              key={bet.id}
              className="flex-shrink-0 w-[300px] snap-start animate-in fade-in slide-in-from-bottom-3 h-auto self-stretch"
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
        title="⭐ Melhores da Semana"
        description="Nossas principais picks para a semana"
        bets={bestOfDayBets}
        scrollRef={bestScrollRef}
        theme="best"
        loading={bestLoading}
      />
    </div>
  );
};

export default SuggestedBets;
