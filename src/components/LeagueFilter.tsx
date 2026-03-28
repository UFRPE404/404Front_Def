import { useState, useMemo } from "react";
import { Search, X, SlidersHorizontal, ChevronDown, ChevronUp, Pin } from "lucide-react";

// ── Exact names (case-insensitive, trimmed) of top world leagues ──────────────
// Multiple variants per competition cover different API naming conventions.
// Only full names match — no substring heuristics, no false positives.
const PRIORITY_EXACT = new Set<string>([
  // ── UEFA club competitions ──────────────────────────────────────────────────
  "champions league",
  "uefa champions league",
  "europa league",
  "uefa europa league",
  "conference league",
  "uefa conference league",
  "uefa europa conference league",

  // ── England ─────────────────────────────────────────────────────────────────
  "premier league",
  "england premier league",
  "english premier league",

  // ── Spain ───────────────────────────────────────────────────────────────────
  "la liga",
  "spain la liga",
  "laliga",
  "laliga ea sports",

  // ── Germany ─────────────────────────────────────────────────────────────────
  "bundesliga",
  "germany bundesliga",
  "1. bundesliga",

  // ── Italy ───────────────────────────────────────────────────────────────────
  "serie a",
  "italy serie a",
  "serie a tim",

  // ── France ──────────────────────────────────────────────────────────────────
  "ligue 1",
  "france ligue 1",
  "ligue 1 mcdonald's",
  "ligue 1 uber eats",

  // ── Netherlands ─────────────────────────────────────────────────────────────
  "eredivisie",
  "netherlands eredivisie",

  // ── Portugal ────────────────────────────────────────────────────────────────
  "primeira liga",
  "liga portugal",
  "portugal primeira liga",
  "liga nos",
  "liga bwin",
  "liga portugal bwin",

  // ── Turkey ──────────────────────────────────────────────────────────────────
  "super lig",
  "süper lig",
  "turkey super lig",
  "trendyol süper lig",

  // ── Belgium ─────────────────────────────────────────────────────────────────
  "jupiler pro league",
  "belgian pro league",
  "belgium pro league",
  "belgium first division a",

  // ── Scotland ────────────────────────────────────────────────────────────────
  "scottish premiership",
  "scotland premiership",
  "premiership",           // BetsAPI sometimes returns just this for Scotland

  // ── Saudi Arabia ────────────────────────────────────────────────────────────
  "saudi pro league",
  "saudi arabia pro league",
  "roshn saudi league",

  // ── USA ─────────────────────────────────────────────────────────────────────
  "mls",
  "major league soccer",

  // ── Mexico ──────────────────────────────────────────────────────────────────
  "liga mx",
  "mexico liga mx",
  "liga bbva mx",

  // ── Brazil ──────────────────────────────────────────────────────────────────
  "brasileirão série a",
  "brasileirao serie a",
  "campeonato brasileiro série a",
  "campeonato brasileiro serie a",
  "brazil série a",
  "brazil serie a",

  // ── Argentina ───────────────────────────────────────────────────────────────
  "liga profesional",
  "liga profesional argentina",
  "argentina liga profesional",
  "torneo binance",

  // ── South America (continental) ─────────────────────────────────────────────
  "copa libertadores",
  "conmebol libertadores",
  "copa sudamericana",
  "conmebol sudamericana",

  // ── Japan ───────────────────────────────────────────────────────────────────
  "j1 league",
  "japan j1 league",
  "明治安田j1リーグ",

  // ── South Korea ─────────────────────────────────────────────────────────────
  "k league 1",
  "south korea k league 1",

  // ── China ───────────────────────────────────────────────────────────────────
  "chinese super league",
  "china super league",
  "china chinese super league",

  // ── National team competitions ───────────────────────────────────────────────
  "fifa world cup",
  "world cup",
  "copa america",
  "copa américa",
  "conmebol copa america",
  "conmebol copa américa",
  "nations league",
  "uefa nations league",
  "gold cup",
  "concacaf gold cup",
  "africa cup of nations",
  "afcon",
  "caf africa cup of nations",
]);

// For competitions whose name includes a year (Euro 2024, World Cup 2026, etc.)
// we use startsWith on the trimmed lowercase name.
const PRIORITY_PREFIXES: string[] = [
  "euro 20",        // Euro 2024, Euro 2028 …
  "uefa euro 20",
  "world cup 20",
  "fifa world cup 20",
];

function isPriority(name: string): boolean {
  const lower = name.toLowerCase().trim();
  if (PRIORITY_EXACT.has(lower)) return true;
  return PRIORITY_PREFIXES.some((p) => lower.startsWith(p));
}




interface LeagueEntry {
  name: string;
  count: number;
}

interface LeagueFilterProps {
  leagues: LeagueEntry[];
  selectedLeagues: Set<string>;
  onToggle: (league: string) => void;
  onClear: () => void;
  isMobile?: boolean;
}

const LeagueRow = ({
  league,
  selectedLeagues,
  onToggle,
}: {
  league: LeagueEntry;
  selectedLeagues: Set<string>;
  onToggle: (name: string) => void;
}) => {
  const checked = selectedLeagues.has(league.name);
  return (
    <label
      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-colors select-none ${
        checked ? "bg-primary/15 text-foreground" : "hover:bg-secondary text-foreground"
      }`}
    >
      <div
        className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border-2 transition-colors ${
          checked ? "bg-primary border-primary" : "border-border bg-transparent"
        }`}
        onClick={() => onToggle(league.name)}
      >
        {checked && (
          <svg className="w-2.5 h-2.5 text-primary-foreground" fill="none" viewBox="0 0 12 12">
            <path
              d="M2 6l3 3 5-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <span className="flex-1 text-xs font-medium leading-tight" onClick={() => onToggle(league.name)}>
        {league.name}
      </span>
      <span className="text-[10px] font-semibold text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">
        {league.count}
      </span>
    </label>
  );
};

const LeagueFilter = ({
  leagues,
  selectedLeagues,
  onToggle,
  onClear,
  isMobile = false,
}: LeagueFilterProps) => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = leagues.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase())
  );

  const { pinned, others } = useMemo(() => {
    const pinned = filtered.filter((l) => isPriority(l.name));
    const others = filtered.filter((l) => !isPriority(l.name));
    return { pinned, others };
  }, [filtered]);

  const hasSelection = selectedLeagues.size > 0;

  const inner = (
    <div className="flex flex-col gap-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar liga..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-8 pr-8 py-2 text-xs rounded-lg bg-secondary border border-border focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Clear button */}
      {hasSelection && (
        <button
          onClick={onClear}
          className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg text-xs font-semibold text-destructive border border-destructive/30 hover:bg-destructive/10 transition-colors"
        >
          <X className="w-3 h-3" />
          Limpar filtros ({selectedLeagues.size})
        </button>
      )}

      {/* League list */}
      <div
        className="flex flex-col gap-0.5 overflow-y-auto"
        style={{ maxHeight: isMobile ? "240px" : "calc(100vh - 340px)", scrollbarWidth: "thin" }}
      >
        {filtered.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            Nenhuma liga encontrada
          </p>
        ) : (
          <>
            {/* Pinned: top world leagues */}
            {pinned.length > 0 && (
              <>
                <div className="flex items-center gap-1.5 px-1 py-1">
                  <Pin className="w-3 h-3 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                    Principais
                  </span>
                </div>
                {pinned.map((league) => <LeagueRow key={league.name} league={league} selectedLeagues={selectedLeagues} onToggle={onToggle} />)}
                {others.length > 0 && (
                  <div className="my-1 border-t border-border" />
                )}
              </>
            )}
            {/* Other leagues */}
            {others.map((league) => <LeagueRow key={league.name} league={league} selectedLeagues={selectedLeagues} onToggle={onToggle} />)}
          </>
        )}
      </div>
    </div>
  );

  /* ── Mobile: collapsible panel ── */
  if (isMobile) {
    return (
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center justify-between w-full px-4 py-3 text-sm font-semibold"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-primary" />
            <span>Filtrar por Liga</span>
            {hasSelection && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                {selectedLeagues.size}
              </span>
            )}
          </div>
          {open ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
        {open && <div className="px-4 pb-4">{inner}</div>}
      </div>
    );
  }

  /* ── Desktop: always-visible sidebar card ── */
  return (
    <div className="rounded-xl border border-border bg-card p-4 sticky top-[212px]">
      <div className="flex items-center gap-2 mb-4">
        <SlidersHorizontal className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">Ligas</h3>
        {hasSelection && (
          <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
            {selectedLeagues.size}
          </span>
        )}
      </div>
      {inner}
    </div>
  );
};

export default LeagueFilter;
