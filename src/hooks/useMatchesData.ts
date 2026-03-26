import { useEffect, useState } from "react";
import { MatchData } from "@/data/matches";
import * as matchesService from "@/services/matchesService";
import { getFeaturedMatchIds } from "@/services/suggestedBetsService";

export interface UseMatchesResult {
  matches: MatchData[];
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch all matches
 * Handles loading and error states for easier integration with backend
 */
export function useMatches(): UseMatchesResult {
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    matchesService
      .getAllMatches()
      .then((data) => {
        setMatches(data);
        // Re-busca após 8s para pegar cache completo da semana (background)
        setTimeout(() => {
          matchesService
            .getAllMatches()
            .then((fresh) => {
              if (fresh.length > data.length) setMatches(fresh);
            })
            .catch(() => {}); // silencioso
        }, 8_000);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { matches, loading, error };
}

/**
 * Hook to fetch carousel matches
 */
export function useCarouselMatches(): UseMatchesResult {
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    matchesService
      .getCarouselMatches()
      .then(setMatches)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { matches, loading, error };
}

/**
 * Hook to fetch featured matches
 */
export function useFeaturedMatches(): UseMatchesResult {
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    matchesService
      .getFeaturedMatches()
      .then(setMatches)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { matches, loading, error };
}

/**
 * Hook to fetch live matches with polling (real-time updates)
 * @param intervalMs - polling interval in ms (default: 10s)
 */
export function useLiveMatches(intervalMs = 10_000): UseMatchesResult {
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchLive = () => {
      setLoading((prev) => matches.length === 0 ? true : prev);
      matchesService
        .getLiveMatches()
        .then((data) => { if (!cancelled) { setMatches(data); setError(null); } })
        .catch((err) => { if (!cancelled) setError(err); })
        .finally(() => { if (!cancelled) setLoading(false); });
    };

    fetchLive();
    const id = setInterval(fetchLive, intervalMs);

    return () => { cancelled = true; clearInterval(id); };
  }, [intervalMs]);

  return { matches, loading, error };
}

/**
 * Hook to fetch matches by sport
 */
export function useMatchesBySport(sport: string | null): UseMatchesResult {
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Always clear stale data immediately when sport changes so the
    // previous sport's matches never bleed into the next render.
    setMatches([]);

    if (!sport) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    matchesService
      .getMatchesBySport(sport)
      .then((data) => { if (!cancelled) setMatches(data); })
      .catch((err) => { if (!cancelled) setError(err); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [sport]);

  return { matches, loading, error };
}

/**
 * Hook to fetch matches by league
 */
export function useMatchesByLeague(league: string | null): UseMatchesResult {
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!league) return;
    
    setLoading(true);
    setError(null);
    matchesService
      .getMatchesByLeague(league)
      .then(setMatches)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [league]);

  return { matches, loading, error };
}

/**
 * Hook to fetch unique sports
 */
export function useSports() {
  const [sports, setSports] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    matchesService
      .getUniqueSports()
      .then(setSports)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { sports, loading, error };
}

/**
 * Hook to fetch unique leagues by sport
 */
export function useLeaguesBySport(sport: string | null) {
  const [leagues, setLeagues] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!sport) return;
    
    setLoading(true);
    setError(null);
    matchesService
      .getUniqueLeaguesBySport(sport)
      .then(setLeagues)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [sport]);

  return { leagues, loading, error };
}

/**
 * Hook to fetch match lineup from backend
 */
export function useMatchLineup(matchId: string | null) {
  const [lineup, setLineup] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!matchId) return;
    setLoading(true);
    setError(null);
    matchesService
      .getMatchLineups(matchId)
      .then(setLineup)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [matchId]);

  return { lineup, loading, error };
}

/**
 * Hook to fetch upcoming matches with odds from backend
 */
export function useUpcomingMatchesWithOdds() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    matchesService
      .getUpcomingMatchesWithOdds()
      .then(setMatches)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { matches, loading, error };
}

/**
 * Hook to fetch team history from backend
 */
export function useTeamHistory(teamId: string | null, page = 1) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!teamId) return;
    setLoading(true);
    setError(null);
    matchesService
      .getTeamHistory(teamId, page)
      .then(setHistory)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [teamId, page]);

  return { history, loading, error };
}

/**
 * Hook to fetch player analysis from backend
 */
export function usePlayerAnalysis(playerId: string | null, context?: {
  isDerby?: boolean;
  isHome?: boolean;
  isOffensivePlayer?: boolean;
  isDefensiveOpponent?: boolean;
  expectedMinutes?: number;
}) {
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!playerId) return;
    setLoading(true);
    setError(null);
    matchesService
      .getPlayerAnalysis(playerId, context)
      .then(setAnalysis)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [playerId]);

  return { analysis, loading, error };
}

/**
 * Hook to fetch player AI recommendation from backend
 */
export function usePlayerRecommendation(playerId: string | null) {
  const [recommendation, setRecommendation] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!playerId) return;
    setLoading(true);
    setError(null);
    matchesService
      .getPlayerRecommendation(playerId)
      .then(setRecommendation)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [playerId]);

  return { recommendation, loading, error };
}

/**
 * Hook to fetch AI-selected featured match IDs
 */
export function useFeaturedMatchIds() {
  const [ids, setIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getFeaturedMatchIds()
      .then(setIds)
      .catch(() => setIds([]))
      .finally(() => setLoading(false));
  }, []);

  return { featuredIds: ids, loadingFeatured: loading };
}
