import { SuggestedBet } from "@/data/matches";
import { dreamBets, bestOfDayBets } from "@/data/matches";

/**
 * Service layer for suggested bets
 * Future: Replace with actual API calls to backend
 */

export async function getDreamBets(): Promise<SuggestedBet[]> {
  // TODO: Replace with actual API call
  // return fetch(`${API_BASE_URL}/bets/dream`).then(r => r.json());
  return Promise.resolve(dreamBets);
}

export async function getBestOfDayBets(): Promise<SuggestedBet[]> {
  // TODO: Replace with actual API call
  // return fetch(`${API_BASE_URL}/bets/best-of-day`).then(r => r.json());
  return Promise.resolve(bestOfDayBets);
}

export async function getAllSuggestedBets(): Promise<SuggestedBet[]> {
  // TODO: Replace with actual API call
  // return fetch(`${API_BASE_URL}/bets/suggested`).then(r => r.json());
  return Promise.resolve([...dreamBets, ...bestOfDayBets]);
}
