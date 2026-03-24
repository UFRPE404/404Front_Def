import type { MatchData, MatchStatistics, MatchEvent, MatchLineup, H2HRecord } from "@/data/matches";
import { apiRequest } from "@/config/api";
import {
  allMatches,
  carouselMatches,
  featuredMatches,
  liveMatches,
  volleyballMatches,
} from "@/data/matches";

/**
 * Service layer for matches data.
 *
 * To switch from mocks to a real backend:
 *   1. Set VITE_API_URL in your .env (e.g. https://api.myapp.com)
 *   2. Replace the `Promise.resolve(...)` bodies below with `apiRequest<T>(...)`.
 *      Example stubs are commented out next to each function.
 *   3. The hooks that consume these services already handle loading / error states,
 *      so the UI will "just work" once the API is live.
 */

export async function getAllMatches(): Promise<MatchData[]> {
  // TODO: Replace with actual API call
  // return fetch(`${API_BASE_URL}/matches`).then(r => r.json());
  return Promise.resolve(allMatches);
}

export async function getCarouselMatches(): Promise<MatchData[]> {
  // TODO: Replace with actual API call
  // return fetch(`${API_BASE_URL}/matches/carousel`).then(r => r.json());
  return Promise.resolve(carouselMatches);
}

export async function getFeaturedMatches(): Promise<MatchData[]> {
  // TODO: Replace with actual API call
  // return fetch(`${API_BASE_URL}/matches/featured`).then(r => r.json());
  return Promise.resolve(featuredMatches);
}

export async function getLiveMatches(): Promise<MatchData[]> {
  // TODO: Replace with actual API call
  // return fetch(`${API_BASE_URL}/matches/live`).then(r => r.json());
  return Promise.resolve(liveMatches);
}

export async function getMatchesBySport(sport: string): Promise<MatchData[]> {
  // TODO: Replace with actual API call
  // return fetch(`${API_BASE_URL}/matches?sport=${sport}`).then(r => r.json());
  const matches = await getAllMatches();
  return matches.filter((match) => match.sport === sport);
}

export async function getMatchesByDate(date: Date): Promise<MatchData[]> {
  // TODO: Replace with actual API call
  // return fetch(`${API_BASE_URL}/matches?date=${date.toISOString()}`).then(r => r.json());
  const matches = await getAllMatches();
  // Simple implementation - distribute matches across days
  const dayIndex = Math.floor(
    (date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  return matches.filter((_, idx) => idx % 7 === dayIndex);
}

export async function getMatchesByLeague(league: string): Promise<MatchData[]> {
  // TODO: Replace with actual API call
  // return fetch(`${API_BASE_URL}/matches/league/${league}`).then(r => r.json());
  const matches = await getAllMatches();
  return matches.filter((match) => match.league === league);
}

export async function getUniqueSports(): Promise<string[]> {
  // TODO: Replace with actual API call
  // return fetch(`${API_BASE_URL}/sports`).then(r => r.json());
  const matches = await getAllMatches();
  const sports = new Set<string>();
  matches.forEach((match) => {
    if (match.sport) sports.add(match.sport);
  });
  return Array.from(sports).sort();
}

export async function getUniqueLeaguesBySport(sport: string): Promise<string[]> {
  // TODO: Replace with actual API call
  // return apiRequest<string[]>(`/leagues?sport=${sport}`);
  const matches = await getMatchesBySport(sport);
  const leagues = new Set<string>();
  matches.forEach((match) => {
    leagues.add(match.league);
  });
  return Array.from(leagues).sort();
}

// ─── Extended endpoints (return empty data until backend is wired) ──

export async function getMatchById(id: string): Promise<MatchData | undefined> {
  // return apiRequest<MatchData>(`/matches/${id}`);
  // Search pre-match first, then live — they are kept in separate endpoints.
  const preMatch = (await getAllMatches()).find((m) => m.id === id);
  if (preMatch) return preMatch;
  return (await getLiveMatches()).find((m) => m.id === id);
}

export async function getMatchStatistics(matchId: string): Promise<MatchStatistics | null> {
  // return apiRequest<MatchStatistics>(`/matches/${matchId}/statistics`);
  return Promise.resolve(null);
}

export async function getMatchEvents(matchId: string): Promise<MatchEvent[]> {
  // return apiRequest<MatchEvent[]>(`/matches/${matchId}/events`);
  return Promise.resolve([]);
}

export async function getMatchLineups(matchId: string): Promise<MatchLineup | null> {
  // return apiRequest<MatchLineup>(`/matches/${matchId}/lineups`);
  return Promise.resolve(null);
}

export async function getMatchH2H(matchId: string): Promise<H2HRecord[]> {
  // return apiRequest<H2HRecord[]>(`/matches/${matchId}/h2h`);
  return Promise.resolve([]);
}
