import { useEffect, useState } from "react";
import { SuggestedBet } from "@/data/matches";
import * as suggestedBetsService from "@/services/suggestedBetsService";

export interface UseSuggestedBetsResult {
  bets: SuggestedBet[];
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch dream bets
 */
export function useDreamBets(): UseSuggestedBetsResult {
  const [bets, setBets] = useState<SuggestedBet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    suggestedBetsService
      .getDreamBets()
      .then(setBets)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { bets, loading, error };
}

/**
 * Hook to fetch best of day bets
 */
export function useBestOfDayBets(): UseSuggestedBetsResult {
  const [bets, setBets] = useState<SuggestedBet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    suggestedBetsService
      .getBestOfDayBets()
      .then(setBets)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { bets, loading, error };
}

/**
 * Hook to fetch all suggested bets
 */
export function useAllSuggestedBets(): UseSuggestedBetsResult {
  const [bets, setBets] = useState<SuggestedBet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    suggestedBetsService
      .getAllSuggestedBets()
      .then(setBets)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { bets, loading, error };
}
