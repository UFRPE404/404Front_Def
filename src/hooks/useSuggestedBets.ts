import { useState, useEffect } from "react";
import { SuggestedBet } from "@/data/matches";
import { getDreamBets, getBestOfDayBets, getAllSuggestedBets } from "@/services/suggestedBetsService";

export interface UseSuggestedBetsResult {
  bets: SuggestedBet[];
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch dream bets from API (no mock fallback)
 */
export function useDreamBets(): UseSuggestedBetsResult {
  const [bets, setBets] = useState<SuggestedBet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    getDreamBets()
      .then((data) => {
        if (cancelled) return;
        setBets(data);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Erro ao buscar dream bets:", err);
        setError(err);
        setBets([]);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  return { bets, loading, error };
}

/**
 * Hook to fetch best of day bets from API (no mock fallback)
 */
export function useBestOfDayBets(): UseSuggestedBetsResult {
  const [bets, setBets] = useState<SuggestedBet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    getBestOfDayBets()
      .then((data) => {
        if (cancelled) return;
        setBets(data);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Erro ao buscar best of day:", err);
        setError(err);
        setBets([]);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  return { bets, loading, error };
}

/**
 * Hook to fetch all suggested bets from API (no mock fallback)
 */
export function useAllSuggestedBets(): UseSuggestedBetsResult {
  const [bets, setBets] = useState<SuggestedBet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    getAllSuggestedBets()
      .then((data) => {
        if (cancelled) return;
        setBets(data);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Erro ao buscar sugestões:", err);
        setError(err);
        setBets([]);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  return { bets, loading, error };
}
