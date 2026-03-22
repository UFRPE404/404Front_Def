import { useState } from "react";
import { X, ChevronUp, Trash2, ReceiptText } from "lucide-react";
import { useBetSlip } from "@/contexts/BetSlipContext";
import { Button } from "@/components/ui/button";

const BetSlip = () => {
  const [expanded, setExpanded] = useState(false);
  const { selections, removeSelection, clearAll } = useBetSlip();

  const totalOdds = selections.reduce((acc, s) => acc * s.odds, 1);

  return (
    <div className="fixed bottom-4 right-4 z-50" style={{ maxWidth: "360px", width: expanded ? "360px" : "auto" }}>
      {/* Expanded panel */}
      {expanded && (
        <div
          className="rounded-xl overflow-hidden mb-0 shadow-2xl border border-border animate-in fade-in slide-in-from-bottom-4"
          style={{
            background: "hsl(var(--card))",
            animationDuration: "300ms",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <ReceiptText className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-foreground">Bilhete</span>
              <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                {selections.length}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {selections.length > 0 && (
                <button
                  onClick={clearAll}
                  className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-secondary"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setExpanded(false)}
                className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary"
              >
                <ChevronUp className="w-4 h-4 rotate-180" />
              </button>
            </div>
          </div>

          {/* Selections list */}
          <div className="max-h-[320px] overflow-y-auto scrollbar-thin">
            {selections.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-muted-foreground">Selecione odds para montar seu bilhete</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {selections.map((sel) => (
                  <div key={sel.id} className="px-4 py-3 flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground truncate">{sel.league}</p>
                      <p className="text-sm font-semibold text-foreground truncate">
                        {sel.teamA} vs {sel.teamB}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-medium text-primary bg-primary/15 px-2 py-0.5 rounded">
                          {sel.pick}
                        </span>
                        <span className="text-xs font-bold text-foreground">{sel.odds.toFixed(2)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeSelection(sel.id)}
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors shrink-0 mt-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {selections.length > 0 && (
            <div className="px-4 py-3 border-t border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Odds total</span>
                <span className="text-sm font-bold text-primary">{totalOdds.toFixed(2)}</span>
              </div>
              <Button variant="hero" className="w-full" size="sm">
                Confirmar Bilhete
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Collapsed button */}
      {!expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm shadow-lg transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
          style={{
            background: "hsl(var(--primary))",
            color: "hsl(var(--primary-foreground))",
            boxShadow: "0 4px 24px hsl(var(--primary) / 0.3)",
          }}
        >
          <ReceiptText className="w-4 h-4" />
          Bilhete
          {selections.length > 0 && (
            <span className="bg-white/20 text-xs font-bold px-2 py-0.5 rounded-full ml-1">
              {selections.length}
            </span>
          )}
        </button>
      )}
    </div>
  );
};

export default BetSlip;
