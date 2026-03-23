import { useState, useMemo, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BetSlip from "@/components/BetSlip";
import MatchCard from "@/components/MatchCard";
import { useMatches, useCarouselMatches, useSports } from "@/hooks/useMatchesData";
import { Trophy, ChevronLeft, ChevronRight, Calendar } from "lucide-react";

const Sports = () => {
  const [activeSport, setActiveSport] = useState("Futebol");
  const [activeDay, setActiveDay] = useState(0); // 0 = hoje, 1 = amanhã, etc
  const featuredScrollRef = useRef<HTMLDivElement>(null);
  const leagueScrollRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

  // Fetch data from service layer
  const { matches: allMatches, loading } = useMatches();
  const { matches: carouselMatchesData } = useCarouselMatches();
  const { sports: uniqueSports } = useSports();

  // Get sport counts
  const sportCounts = useMemo(() => {
    const counts: Record<string, number> = { Todos: allMatches.length };
    
    allMatches.forEach((match) => {
      const sport = match.sport || "Outro";
      counts[sport] = (counts[sport] || 0) + 1;
    });

    return counts;
  }, [allMatches]);

  // Generate next 7 days
  const nextDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  }, []);

  // Filter matches by sport and day
  const filteredMatches = useMemo(() => {
    return allMatches.filter((match, matchIndex) => {
      const sportMatch = activeSport === "Todos" || match.sport === activeSport;
      const dayIndex = matchIndex % 7;
      return sportMatch && dayIndex === activeDay;
    });
  }, [allMatches, activeSport, activeDay]);

  // Get featured matches for today
  const todayFeaturedMatches = useMemo(() => {
    if (activeDay !== 0) return [];
    if (activeSport === "Todos") {
      return carouselMatchesData.slice(0, 10);
    }
    return carouselMatchesData.filter((match) => 
      match.sport === activeSport
    ).slice(0, 10);
  }, [activeSport, activeDay, carouselMatchesData]);

  // Group matches by league
  const matchesByLeague = useMemo(() => {
    const grouped = new Map<string, typeof filteredMatches>();
    filteredMatches.forEach((match) => {
      if (!grouped.has(match.league)) {
        grouped.set(match.league, []);
      }
      grouped.get(match.league)?.push(match);
    });
    return Array.from(grouped.entries()).sort(([leagueA], [leagueB]) => 
      leagueA.localeCompare(leagueB)
    );
  }, [filteredMatches]);

  const scrollLeagueMatches = (league: string, dir: "left" | "right") => {
    const ref = leagueScrollRefs.current.get(league);
    if (!ref) return;
    ref.scrollBy({
      left: dir === "left" ? -200 : 200,
      behavior: "smooth",
    });
  };

  const scrollFeatured = (dir: "left" | "right") => {
    if (!featuredScrollRef.current) return;
    featuredScrollRef.current.scrollBy({
      left: dir === "left" ? -320 : 320,
      behavior: "smooth",
    });
  };

  // Sport icons and colors
  const sportConfig: Record<string, { icon: string; color: string }> = {
    Futebol: { icon: "⚽", color: "#51cf66" },
    Basquete: { icon: "🏀", color: "#748ffc" },
    Tênis: { icon: "🎾", color: "#ffd93d" },
    Vôlei: { icon: "🏐", color: "#ff922b" },
  };

  const formatDate = (date: Date, index: number) => {
    if (index === 0) return "Hoje";
    if (index === 1) return "Amanhã";
    return date.toLocaleDateString("pt-BR", { 
      weekday: "short", 
      day: "numeric",
      month: "short"
    }).replace(".", "");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      {/* Fixed Date Navigation Bar */}
      <div className="sticky top-16 z-40 bg-background border-b border-border backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          {/* Header with Sports Filter */}
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-primary" />
                <h1 className="text-2xl font-bold text-foreground">Esportes</h1>
              </div>
            </div>
            
            {/* Sports Filter */}
            <div className="flex flex-wrap gap-2">
              {["Todos", ...uniqueSports].map((sport) => (
                <button
                  key={sport}
                  onClick={() => setActiveSport(sport)}
                  className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all duration-200 flex items-center gap-2 ${
                    activeSport === sport
                      ? "shadow-lg scale-105"
                      : "hover:scale-[1.02]"
                  }`}
                  style={
                    activeSport === sport
                      ? {
                          background: sportConfig[sport]?.color || "hsl(var(--primary))",
                          color: sport === "Tênis" ? "#000" : "#fff",
                          boxShadow: `0 4px 12px ${sportConfig[sport]?.color || "hsl(var(--primary))"}40`,
                        }
                      : {
                          background: "hsl(var(--secondary))",
                          color: "hsl(var(--foreground))",
                        }
                  }
                >
                  <span className="text-sm">{sportConfig[sport]?.icon || "🏆"}</span>
                  {sport}
                </button>
              ))}
            </div>
          </div>

          {/* Date Navigation */}
          <div className="px-4 py-4 border-t border-border">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Data</p>
            </div>
            
            <div className="flex gap-2 pb-1">
              {nextDays.map((date, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveDay(idx)}
                  className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all duration-200 flex-1 text-center ${
                    activeDay === idx
                      ? "shadow-lg"
                      : "hover:bg-secondary"
                  }`}
                  style={
                    activeDay === idx
                      ? {
                          background: "hsl(var(--primary))",
                          color: "hsl(var(--primary-foreground))",
                          boxShadow: "0 4px 12px hsl(var(--primary))40",
                        }
                      : {
                          background: "hsl(var(--secondary))",
                          color: "hsl(var(--foreground))",
                        }
                  }
                >
                  {formatDate(date, idx)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto pb-8 px-4 pt-6">
        {/* Featured Matches - Only on Today */}
        {activeDay === 0 && todayFeaturedMatches.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">⭐ Partidas Destaques</h2>
              <div className="flex gap-1">
                <button
                  onClick={() => scrollFeatured("left")}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollFeatured("right")}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div
              ref={featuredScrollRef}
              className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory"
              style={{ scrollbarWidth: "none" }}
            >
              {todayFeaturedMatches.map((match, i) => (
                <div
                  key={match.id}
                  className="flex-shrink-0 w-[320px] snap-start animate-in fade-in slide-in-from-bottom-3"
                  style={{
                    animationDelay: `${i * 70}ms`,
                    animationFillMode: "both",
                    animationDuration: "500ms",
                  }}
                >
                  <MatchCard {...match} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results Info */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Mostrando <span className="font-semibold text-foreground">{filteredMatches.length}</span> {activeSport === "Todos" ? "eventos" : `eventos de ${activeSport}`} para <span className="font-semibold text-foreground">{formatDate(nextDays[activeDay], activeDay)}</span>
          </p>
        </div>

        {/* Matches Grouped by League */}
        {filteredMatches.length > 0 ? (
          <div className="space-y-8">
            {matchesByLeague.map(([league, matches], leagueIdx) => (
              <div
                key={league}
                className="animate-in fade-in slide-in-from-bottom-4"
                style={{
                  animationDelay: `${leagueIdx * 100}ms`,
                  animationFillMode: "both",
                  animationDuration: "500ms",
                }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">{league}</h2>
                    <div className="w-12 h-1 bg-gradient-to-r from-primary to-transparent rounded-full mt-2" />
                  </div>
                  {matches.length > 3 && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => scrollLeagueMatches(league, "left")}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => scrollLeagueMatches(league, "right")}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                
                <div
                  ref={(el) => {
                    if (el) leagueScrollRefs.current.set(league, el);
                  }}
                  className="flex gap-4 overflow-x-auto pb-2"
                  style={{ scrollbarWidth: "none" }}
                >
                  {matches.map((match, matchIdx) => (
                    <div
                      key={match.id}
                      className="flex-shrink-0 w-[320px] animate-in fade-in slide-in-from-bottom-3"
                      style={{
                        animationDelay: `${leagueIdx * 100 + matchIdx * 50}ms`,
                        animationFillMode: "both",
                        animationDuration: "400ms",
                      }}
                    >
                      <MatchCard {...match} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <Trophy className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum evento disponível</h3>
            <p className="text-muted-foreground text-sm">Selecione outro esporte ou data</p>
          </div>
        )}
      </main>

      <Footer />
      <BetSlip />
    </div>
  );
};

export default Sports;
