import {
  Trophy,
  Volleyball,
  Dumbbell,
  Target,
  Gamepad2,
  Timer,
} from "lucide-react";
import { useState } from "react";

const sports = [
  { name: "Futebol", icon: Trophy, count: 142 },
  { name: "Basquete", icon: Dumbbell, count: 87 },
  { name: "Tênis", icon: Target, count: 63 },
  { name: "Vôlei", icon: Volleyball, count: 34 },
  { name: "E-Sports", icon: Gamepad2, count: 28 },
  { name: "Ao Vivo", icon: Timer, count: 56 },
];

const SportsSidebar = () => {
  const [active, setActive] = useState("Futebol");

  return (
    <aside className="w-full lg:w-56 shrink-0">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-4 mb-3">
        Esportes
      </h2>
      <nav className="space-y-0.5">
        {sports.map((sport) => {
          const Icon = sport.icon;
          return (
            <button
              key={sport.name}
              onClick={() => setActive(sport.name)}
              className={`sport-item w-full ${active === sport.name ? "active" : ""}`}
            >
              <Icon className="w-4 h-4" />
              <span className="flex-1 text-left">{sport.name}</span>
              <span className="text-xs opacity-60">{sport.count}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default SportsSidebar;
