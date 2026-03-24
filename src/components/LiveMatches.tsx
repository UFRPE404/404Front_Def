import MatchCard from "./MatchCard";
import { useLiveMatches } from "@/hooks/useMatchesData";

const LiveMatches = () => {
  const { matches: liveMatches } = useLiveMatches();
  return (
    <section className="px-4 mt-8">
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
