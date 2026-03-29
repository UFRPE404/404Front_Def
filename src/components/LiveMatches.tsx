import { useState, useEffect, useCallback } from "react";
import MatchCard from "./MatchCard";
import { useLiveMatches } from "@/hooks/useMatchesData";
import { getMatchLiveStatsBulk, type MatchLiveStats } from "@/services/matchesService";

const LiveMatches = () => {
  const { matches: liveMatches } = useLiveMatches();
  const displayMatches = liveMatches.slice(0, 8);

  const [liveStatsMap, setLiveStatsMap] = useState<Record<string, MatchLiveStats | null>>({});

  const fetchStats = useCallback(async () => {
    const bulk = await getMatchLiveStatsBulk();
    setLiveStatsMap(bulk as Record<string, MatchLiveStats | null>);
  }, []);

  useEffect(() => {
    if (liveMatches.length === 0) return;
    fetchStats();
    const id = setInterval(fetchStats, 30_000);
    return () => clearInterval(id);
  }, [liveMatches.length, fetchStats]);

  return (
    <section className="px-4 mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {displayMatches.map((match, i) => (
          <div
            key={i}
            className="animate-in fade-in slide-in-from-bottom-3"
            style={{
              animationDelay: `${i * 80}ms`,
              animationFillMode: "both",
              animationDuration: "500ms",
            }}
          >
            <MatchCard {...match} liveStats={liveStatsMap[match.id] ?? null} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default LiveMatches;
