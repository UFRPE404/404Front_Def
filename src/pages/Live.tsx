import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BetSlip from "@/components/BetSlip";
import MatchCard from "@/components/MatchCard";
import LiveSportFilter from "@/components/LiveSportFilter";
import { useLiveMatches } from "@/hooks/useMatchesData";

const Live = () => {
  const [activeSport, setActiveSport] = useState("Futebol");
  const { matches: liveMatches } = useLiveMatches();

  // Calculate sport counts
  const sportCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Todos: liveMatches.length,
    };

    liveMatches.forEach((match) => {
      const sport = match.sport || "Outro";
      counts[sport] = (counts[sport] || 0) + 1;
    });

    return counts;
  }, [liveMatches]);

  // Filter matches by sport
  const filteredMatches = useMemo(() => {
    if (activeSport === "Todos") {
      return liveMatches;
    }
    return liveMatches.filter((match) => match.sport === activeSport);
  }, [activeSport, liveMatches]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto pb-8">
        {/* Header */}
        <div className="px-4 pt-6 pb-4 border-b border-border">
          <div className="flex items-center gap-2 mb-6">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
            </span>
            <h1 className="text-3xl font-bold text-foreground">Ao Vivo</h1>
            <span className="text-sm font-medium text-muted-foreground bg-secondary px-3 py-1 rounded-full ml-2">
              {filteredMatches.length} {filteredMatches.length === 1 ? "jogo" : "jogos"}
            </span>
          </div>

          {/* Sport Filter */}
          <LiveSportFilter 
            activeSport={activeSport}
            onSportChange={setActiveSport}
            sportCounts={sportCounts}
          />
        </div>

        {/* Matches Grid */}
        <div className="px-4 pt-8">
          {filteredMatches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMatches.map((match, index) => (
                <div
                  key={match.id}
                  className="animate-in fade-in slide-in-from-bottom-3"
                  style={{
                    animationDelay: `${index * 60}ms`,
                    animationFillMode: "both",
                    animationDuration: "400ms",
                  }}
                >
                  <MatchCard {...match} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="text-center">
                <p className="text-muted-foreground text-lg mb-2">Nenhum jogo ao vivo</p>
                <p className="text-muted-foreground text-sm">
                  Selecione outro esporte ou volte mais tarde
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <BetSlip />
    </div>
  );
};

export default Live;
