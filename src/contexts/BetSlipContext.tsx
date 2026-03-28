import { createContext, useContext, useState, ReactNode } from "react";

export interface BetSelection {
  id: string;
  matchId?: string;
  league: string;
  teamA: string;
  teamB: string;
  pick: string;
  odds: number;
}

interface BetSlipContextType {
  selections: BetSelection[];
  addSelection: (sel: BetSelection) => void;
  removeSelection: (id: string) => void;
  clearAll: () => void;
  isSelected: (id: string) => boolean;
}

const BetSlipContext = createContext<BetSlipContextType | null>(null);

export const useBetSlip = () => {
  const ctx = useContext(BetSlipContext);
  if (!ctx) throw new Error("useBetSlip must be inside BetSlipProvider");
  return ctx;
};

export const BetSlipProvider = ({ children }: { children: ReactNode }) => {
  const [selections, setSelections] = useState<BetSelection[]>([]);

  const addSelection = (sel: BetSelection) => {
    setSelections((prev) => {
      // Toggle off if already selected
      const exists = prev.find((s) => s.id === sel.id);
      if (exists) return prev.filter((s) => s.id !== sel.id);

      // Extract market group from ID to enforce mutual exclusion
      // ID patterns: {matchId}-odds-1x2-{sub}, {matchId}-ht-{sub}, {matchId}-dc-{i},
      //   {matchId}-gols-o-{i}/{matchId}-gols-u-{i}, {matchId}-hcp-{i},
      //   {matchId}-corners-o-{i}/{matchId}-corners-u-{i}, {matchId}-cards-o-{i}/{matchId}-cards-u-{i},
      //   {matchId}-exact-a-{i}/{matchId}-exact-e-{i}/{matchId}-exact-b-{i}
      const getMarketGroup = (id: string): string | null => {
        // 1X2 result: only one of home/draw/away
        const m1x2 = id.match(/^(.+)-odds-1x2-/);
        if (m1x2) return `${m1x2[1]}-odds-1x2`;

        // Half-time 1X2: only one
        const mht = id.match(/^(.+)-ht-/);
        if (mht) return `${mht[1]}-ht`;

        // Double chance: only one
        const mdc = id.match(/^(.+)-dc-/);
        if (mdc) return `${mdc[1]}-dc`;

        // Goals over/under: only over OR under for same line index
        const mgols = id.match(/^(.+)-gols-[ou]-(\d+)$/);
        if (mgols) return `${mgols[1]}-gols-${mgols[2]}`;

        // Corners over/under: same logic
        const mcorners = id.match(/^(.+)-corners-[ou]-(\d+)$/);
        if (mcorners) return `${mcorners[1]}-corners-${mcorners[2]}`;

        // Cards over/under: same logic
        const mcards = id.match(/^(.+)-cards-[ou]-(\d+)$/);
        if (mcards) return `${mcards[1]}-cards-${mcards[2]}`;

        // Correct score: only one score
        const mexact = id.match(/^(.+)-exact-[aeb]-/);
        if (mexact) return `${mexact[1]}-exact`;

        return null;
      };

      const newGroup = getMarketGroup(sel.id);
      if (!newGroup) return [...prev, sel];

      // Remove any conflicting selection from the same market group
      const filtered = prev.filter((s) => getMarketGroup(s.id) !== newGroup);
      return [...filtered, sel];
    });
  };

  const removeSelection = (id: string) => {
    setSelections((prev) => prev.filter((s) => s.id !== id));
  };

  const clearAll = () => setSelections([]);

  const isSelected = (id: string) => selections.some((s) => s.id === id);

  return (
    <BetSlipContext.Provider value={{ selections, addSelection, removeSelection, clearAll, isSelected }}>
      {children}
    </BetSlipContext.Provider>
  );
};
