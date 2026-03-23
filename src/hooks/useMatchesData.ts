import { useEffect, useState } from "react";
import { MatchData } from "@/data/matches";
import * as matchesService from "@/services/matchesService";

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
      .then(setMatches)
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
 * Hook to fetch live matches
 */
export function useLiveMatches(): UseMatchesResult {
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    matchesService
      .getLiveMatches()
      .then(setMatches)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

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
    if (!sport) return;
    
    setLoading(true);
    setError(null);
    matchesService
      .getMatchesBySport(sport)
      .then(setMatches)
      .catch(setError)
      .finally(() => setLoading(false));
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
