import { Link } from "react-router-dom";
import MatchCard from "./MatchCard";
import { useFeaturedMatches, useLiveMatches, useMatchesBySport } from "@/hooks/useMatchesData";

interface FeaturedMatchesProps {
  sport: string;
}

const FeaturedMatches = ({ sport }: FeaturedMatchesProps) => {
  const { matches: featuredMatches } = useFeaturedMatches();
  const { matches: liveMatchesList } = useLiveMatches();
  const { matches: sportMatches } = useMatchesBySport(
    sport !== "Futebol" && sport !== "Ao Vivo" ? sport : null
  );

  const matches = (() => {
    if (sport === "Ao Vivo") return liveMatchesList;
    if (sport === "Futebol") return featuredMatches;
    return sportMatches;
  })();

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
      {matches.length === 0 ? (
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
