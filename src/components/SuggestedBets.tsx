import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SuggestedBetCard from "./SuggestedBetCard";
import { useAllSuggestedBets, useUpcomingBets } from "@/hooks/useSuggestedBets";
import { SuggestedBet } from "@/data/matches";

const SuggestedBets = () => {
  const { bets, loading } = useAllSuggestedBets();
  const { bets: upcomingBets, loading: upcomingLoading } = useUpcomingBets();
  const scrollRef = useRef<HTMLDivElement>(null);
  const upcomingScrollRef = useRef<HTMLDivElement>(null);

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
  }: {
    title: string;
    description: string;
    bets: SuggestedBet[];
    scrollRef: React.RefObject<HTMLDivElement>;
    theme: "dream" | "best";
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
        {bets.map((bet, i) => (
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
        ))}
      </div>
    </section>
  );

  return (
    <div className="space-y-8">
      {loading ? (
        <section className="px-4 mt-8">
          <h2 className="text-lg font-bold text-foreground mb-2">🤖 Sugestões de Apostas</h2>
          <p className="text-sm text-muted-foreground">Analisando partidas ao vivo...</p>
        </section>
      ) : bets.length > 0 ? (
        <CarouselSection
          title="🤖 Sugestões de Apostas"
          description="Palpites gerados por Machine Learning com base nas partidas ao vivo"
          bets={bets}
          scrollRef={scrollRef}
          theme="best"
        />
      ) : (
        <section className="px-4 mt-8">
          <h2 className="text-lg font-bold text-foreground mb-2">Sugestões de Apostas</h2>
          <p className="text-sm text-muted-foreground">Nenhuma sugestão disponível no momento.</p>
        </section>
      )}

      {/* Partidas Próximas */}
      {upcomingLoading ? (
        <section className="px-4 mt-8">
          <h2 className="text-lg font-bold text-foreground mb-2">📅 Partidas Próximas</h2>
          <p className="text-sm text-muted-foreground">Buscando partidas próximas e analisando com IA...</p>
        </section>
      ) : upcomingBets.length > 0 ? (
        <CarouselSection
          title="📅 Partidas Próximas"
          description="Análises de IA para as próximas partidas com odds disponíveis"
          bets={upcomingBets}
          scrollRef={upcomingScrollRef}
          theme="dream"
        />
      ) : null}
    </div>
  );
};

export default SuggestedBets;
