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
      const exists = prev.find((s) => s.id === sel.id);
      if (exists) return prev.filter((s) => s.id !== sel.id);
      return [...prev, sel];
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
