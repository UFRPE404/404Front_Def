import {
  Trophy,
  Volleyball,
  Dumbbell,
  Target,
  Timer,
} from "lucide-react";
import { useMemo } from "react";
import { useMatches, useLiveMatches } from "@/hooks/useMatchesData";

const SPORT_CONFIG = [
  { name: "Futebol", icon: Trophy },
  { name: "Basquete", icon: Dumbbell },
  { name: "Tênis", icon: Target },
  { name: "Vôlei", icon: Volleyball },
  { name: "Ao Vivo", icon: Timer },
];

interface SportsSidebarProps {
  activeSport: string;
  onSportChange: (sport: string) => void;
}

const SportsSidebar = ({ activeSport, onSportChange }: SportsSidebarProps) => {
  const { matches: allMatchesData } = useMatches();
  const { matches: liveMatchesData } = useLiveMatches();

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    SPORT_CONFIG.forEach(({ name }) => {
      if (name === "Ao Vivo") {
        map[name] = liveMatchesData.length;
      } else {
        map[name] = allMatchesData.filter((m) => m.sport === name).length;
      }
    });
    return map;
  }, [allMatchesData, liveMatchesData]);

  return (
    <aside className="w-full lg:w-56 shrink-0 lg:self-start lg:sticky lg:top-20">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-4 mb-3">
        Esportes
      </h2>
      <nav className="space-y-0.5">
        {SPORT_CONFIG.map((sport) => {
          const Icon = sport.icon;
          return (
            <button
              key={sport.name}
              onClick={() => onSportChange(sport.name)}
              className={`sport-item w-full ${activeSport === sport.name ? "active" : ""}`}
            >
              <Icon className="w-4 h-4" />
              <span className="flex-1 text-left">{sport.name}</span>
              <span className="text-xs opacity-60">{counts[sport.name]}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default SportsSidebar;
