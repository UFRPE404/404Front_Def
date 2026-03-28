import { Search, Menu, X, Zap, Calendar, Trophy, Layers } from "lucide-react";
import { useState, useMemo, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import futDataLogo from "@/assets/png_fut_data.png";
import { useMatches, useLiveMatches } from "@/hooks/useMatchesData";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const { matches: upcomingMatches } = useMatches();
  const { matches: liveMatches } = useLiveMatches();
  const allMatches = useMemo(() => [...upcomingMatches, ...liveMatches], [upcomingMatches, liveMatches]);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [searchOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;

    const liveResults = liveMatches.filter(
      (m) =>
        m.teamA.toLowerCase().includes(q) ||
        m.teamB.toLowerCase().includes(q) ||
        m.league.toLowerCase().includes(q) ||
        (m.sport ?? "").toLowerCase().includes(q)
    );

    const matchResults = upcomingMatches.filter(
      (m) =>
        m.teamA.toLowerCase().includes(q) ||
        m.teamB.toLowerCase().includes(q) ||
        m.league.toLowerCase().includes(q) ||
        (m.sport ?? "").toLowerCase().includes(q)
    );

    const leagueMap = new Map<string, string>();
    const sportSet = new Set<string>();
    allMatches.forEach((m) => {
      if (m.league.toLowerCase().includes(q)) leagueMap.set(m.league, m.sport ?? "Futebol");
      if ((m.sport ?? "").toLowerCase().includes(q)) sportSet.add(m.sport ?? "");
    });

    return {
      live: liveResults.slice(0, 3),
      matches: matchResults.slice(0, 3),
      leagues: Array.from(leagueMap.entries()).slice(0, 3),
      sports: Array.from(sportSet).slice(0, 3),
    };
  }, [query, liveMatches, upcomingMatches, allMatches]);

  const hasResults = results &&
    (results.live.length + results.matches.length + results.leagues.length + results.sports.length > 0);

  const go = (path: string) => {
    setSearchOpen(false);
    navigate(path);
  };

  return (
    <>
      <nav className="nav-glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src={futDataLogo}
              alt="FutData Logo"
              className="w-24 h-24 object-contain drop-shadow-md"
            />
          </Link>

          {/* Center nav links - desktop */}
          <div className="hidden md:flex items-center gap-1">
            {([{ label: "Ao Vivo", to: "/ao-vivo?sport=Todos" }, { label: "Sugestões", to: "/sugestoes" }, { label: "Esportes", to: "/esportes?sport=Todos" }] as const).map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className={`px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <button
              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              className="md:hidden p-2 text-muted-foreground hover:text-foreground"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-border px-4 py-3 space-y-1">
            {([{ label: "Ao Vivo", to: "/ao-vivo?sport=Todos" }, { label: "Sugestões", to: "/sugestoes" }, { label: "Esportes", to: "/esportes?sport=Todos" }] as const).map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className="block w-full text-left px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center pt-20 px-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/75 backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
          />

          <div className="relative w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-10">
            {/* Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar times, ligas, esportes..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground text-foreground"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Empty state */}
            {!query && (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                Digite para buscar times, ligas ou esportes
              </div>
            )}

            {/* No results */}
            {query && !hasResults && (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                Nenhum resultado para <span className="text-foreground font-medium">"{query}"</span>
              </div>
            )}

            {/* Results */}
            {hasResults && (
              <div className="max-h-[420px] overflow-y-auto divide-y divide-border/50">

                {/* Ao Vivo */}
                {results!.live.length > 0 && (
                  <div className="px-2 py-2">
                    <p className="px-2 py-1 text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5">
                      <Zap className="w-3 h-3 text-red-500" /> Ao Vivo
                    </p>
                    {results!.live.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => go(`/analises/${m.id}`)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-left"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">{m.teamA} vs {m.teamB}</p>
                          <p className="text-xs text-muted-foreground">{m.league} · {m.time}</p>
                        </div>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                          AO VIVO
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Partidas */}
                {results!.matches.length > 0 && (
                  <div className="px-2 py-2">
                    <p className="px-2 py-1 text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" /> Partidas
                    </p>
                    {results!.matches.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => go(`/analises/${m.id}`)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-left"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">{m.teamA} vs {m.teamB}</p>
                          <p className="text-xs text-muted-foreground">{m.league} · {m.date ?? m.time}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full shrink-0">{m.sport}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Ligas */}
                {results!.leagues.length > 0 && (
                  <div className="px-2 py-2">
                    <p className="px-2 py-1 text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5">
                      <Trophy className="w-3 h-3" /> Ligas
                    </p>
                    {results!.leagues.map(([league, sport]) => (
                      <button
                        key={league}
                        onClick={() => go(`/esportes?sport=${encodeURIComponent(sport)}`)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-left"
                      >
                        <p className="text-sm font-medium text-foreground">{league}</p>
                        <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full shrink-0">{sport}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Esportes */}
                {results!.sports.length > 0 && (
                  <div className="px-2 py-2">
                    <p className="px-2 py-1 text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3 h-3" /> Esportes
                    </p>
                    {results!.sports.map((sport) => (
                      <button
                        key={sport}
                        onClick={() => go(`/esportes?sport=${encodeURIComponent(sport)}`)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-left"
                      >
                        <p className="text-sm font-medium text-foreground">{sport}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;

