import {
  Trophy,
  Dumbbell,
  Target,
  Volleyball,
  Gamepad2,
  Timer,
  Flame,
} from "lucide-react";

interface SportFilterProps {
  activeSport: string;
  onSportChange: (sport: string) => void;
  sportCounts?: Record<string, number>;
}

const sportsList = [
  { name: "Todos", icon: Timer },
  { name: "Futebol", icon: Trophy },
  { name: "Basquete", icon: Dumbbell },
  { name: "Tênis", icon: Target },
  { name: "Vôlei", icon: Volleyball },
  { name: "E-Sports", icon: Gamepad2 },
];

const LiveSportFilter = ({ activeSport, onSportChange, sportCounts = {} }: SportFilterProps) => {
  const hasDestaques = (sportCounts["Destaques"] ?? 0) > 0;

  return (
    <div className="w-full overflow-x-auto scrollbar-thin">
      <div className="flex gap-2 pb-3 px-4 min-w-max">

        {/* Destaques tab — only shown when there are priority matches */}
        {hasDestaques && (
          <button
            onClick={() => onSportChange("Destaques")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 flex-shrink-0 ${
              activeSport === "Destaques"
                ? "text-white shadow-lg"
                : "text-orange-400 border border-orange-500/30 hover:bg-orange-500/10"
            }`}
            style={activeSport === "Destaques"
              ? { background: "linear-gradient(135deg, #f97316, #ea580c)", boxShadow: "0 4px 14px rgba(249,115,22,0.4)" }
              : { background: "rgba(249,115,22,0.08)" }
            }
          >
            <Flame className="w-4 h-4" />
            <span>Destaques</span>
            <span className={`ml-1 text-xs font-bold px-2 py-0.5 rounded-full ${
              activeSport === "Destaques" ? "bg-white/20" : "bg-orange-500/20 text-orange-400"
            }`}>
              {sportCounts["Destaques"]}
            </span>
          </button>
        )}

        {sportsList.map((sport) => {
          const Icon = sport.icon;
          const count = sportCounts[sport.name] || 0;
          const isActive = activeSport === sport.name;

          return (
            <button
              key={sport.name}
              onClick={() => onSportChange(sport.name)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex-shrink-0 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{sport.name}</span>
              {count > 0 && (
                <span className={`ml-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                  isActive ? "bg-primary-foreground/20" : "bg-muted"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LiveSportFilter;
