import { MatchData } from "@/data/matches";
import {
  allMatches,
  carouselMatches,
  featuredMatches,
  liveMatches,
  volleyballMatches,
} from "@/data/matches";

/**
 * Service layer for matches data
 * Future: Replace with actual API calls to backend
 * 
 * Example API integration:
 * const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
 * 
 * export async function getAllMatches(): Promise<MatchData[]> {
 *   const response = await fetch(`${API_BASE_URL}/matches`);
 *   if (!response.ok) throw new Error('Failed to fetch matches');
 *   return response.json();
 * }
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
  // return fetch(`${API_BASE_URL}/leagues?sport=${sport}`).then(r => r.json());
  const matches = await getMatchesBySport(sport);
  const leagues = new Set<string>();
  matches.forEach((match) => {
    leagues.add(match.league);
  });
  return Array.from(leagues).sort();
}
