import { useMemo } from "react";
import { Link } from "react-router-dom";
import MatchCard from "./MatchCard";
import { useMatches, useLiveMatches, useMatchesBySport } from "@/hooks/useMatchesData";
import { getFeaturedMatches } from "@/utils/matchPriority";
import { Loader2 } from "lucide-react";

interface FeaturedMatchesProps {
  sport: string;
}

const FeaturedMatches = ({ sport }: FeaturedMatchesProps) => {
  const { matches: allMatches, loading: loadingAll } = useMatches();
  const { matches: liveMatchesList } = useLiveMatches();
  const { matches: sportMatches, loading: loadingSport } = useMatchesBySport(
    sport !== "Futebol" && sport !== "Ao Vivo" ? sport : null
  );

  // For Futebol: apply tier-based priority filtering on today's matches
  const priorityMatches = useMemo(() => {
    if (sport !== "Futebol") return [];
    const todayMatches = allMatches.filter((m) => !m.date || m.date === "Hoje");
    return getFeaturedMatches(todayMatches);
  }, [allMatches, sport]);

  const matches = (() => {
    if (sport === "Ao Vivo") return liveMatchesList;
    if (sport === "Futebol") return priorityMatches;
    return sportMatches;
  })();

  const isLoading = sport === "Futebol" ? loadingAll : loadingSport;

  const sectionTitle = sport === "Ao Vivo" ? "Ao Vivo" : sport === "Futebol" ? "Sugestões" : sport;
  const linkTo = sport === "Ao Vivo" ? "/ao-vivo" : sport === "Futebol" ? "/esportes" : `/esportes?sport=${encodeURIComponent(sport)}`;

  return (
    <section className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">{sectionTitle}</h2>
        <Link to={linkTo} className="text-xs font-medium text-primary hover:underline transition-colors">
          Ver todos →
        </Link>
      </div>

      {isLoading && matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-secondary" />
            <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-primary animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl">⚽</span>
            </div>
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-sm font-semibold text-foreground">Carregando sugestões</h3>
            <p className="text-xs text-muted-foreground">Selecionando os melhores jogos com IA...</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50">
            <Loader2 className="w-3 h-3 text-primary animate-spin" />
            <span className="text-[11px] text-muted-foreground">Conectando com a API</span>
          </div>
        </div>
      ) : matches.length === 0 ? (
        <p className="text-sm text-muted-foreground px-1">Nenhum jogo disponível para este esporte.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {matches.map((match, i) => (
            <div
              key={match.id ?? i}
              className="animate-in fade-in slide-in-from-bottom-3"
              style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both", animationDuration: "500ms" }}
            >
              <MatchCard {...match} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default FeaturedMatches;
