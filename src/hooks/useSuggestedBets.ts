import { SuggestedBet, dreamBets as mockDreamBets, bestOfDayBets as mockBestOfDay } from "@/data/matches";

export interface UseSuggestedBetsResult {
  bets: SuggestedBet[];
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch dream bets (mock data)
 */
export function useDreamBets(): UseSuggestedBetsResult {
  return { bets: mockDreamBets, loading: false, error: null };
}

/**
 * Hook to fetch best of day bets (mock data)
 */
export function useBestOfDayBets(): UseSuggestedBetsResult {
  return { bets: mockBestOfDay, loading: false, error: null };
}

/**
 * Hook to fetch all suggested bets (mock data)
 */
export function useAllSuggestedBets(): UseSuggestedBetsResult {
  const allBets = [...mockDreamBets, ...mockBestOfDay];
  return { bets: allBets, loading: false, error: null };
}
