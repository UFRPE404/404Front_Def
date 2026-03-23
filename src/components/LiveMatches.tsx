import { Timer } from "lucide-react";
import { Link } from "react-router-dom";
import MatchCard from "./MatchCard";
import { liveMatches } from "@/data/matches";

const LiveMatches = () => {
  return (
    <section className="px-4 mt-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
          </span>
          <h2 className="text-lg font-bold text-foreground">Ao Vivo</h2>
          <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
            {liveMatches.length} jogos
          </span>
        </div>
        <Link to="/ao-vivo" className="text-xs font-medium text-primary hover:underline transition-colors">
          Ver todos →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {liveMatches.map((match, i) => (
          <div
            key={i}
            className="animate-in fade-in slide-in-from-bottom-3"
            style={{
              animationDelay: `${i * 80}ms`,
              animationFillMode: "both",
              animationDuration: "500ms",
            }}
          >
            <MatchCard {...match} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default LiveMatches;
