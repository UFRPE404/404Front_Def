import { Link } from "react-router-dom";
import MatchCard from "./MatchCard";
import { useFeaturedMatches } from "@/hooks/useMatchesData";

const FeaturedMatches = () => {
  const { matches: featuredMatches } = useFeaturedMatches();

  return (
    <section className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">Sugestões</h2>
        <Link to="/esportes" className="text-xs font-medium text-primary hover:underline transition-colors">
          Ver todos →
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {featuredMatches.map((match, i) => (
          <div
            key={i}
            className="animate-in fade-in slide-in-from-bottom-3"
            style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both", animationDuration: "500ms" }}
          >
            <MatchCard {...match} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedMatches;
