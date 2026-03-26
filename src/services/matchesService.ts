import axios from 'axios'
import type { MatchData, MatchStatistics, MatchEvent, MatchLineup, H2HRecord } from "@/data/matches";
import { apiRequest, API_CONFIG } from "@/config/api";

const API_BASE_URL = API_CONFIG.baseUrl.replace(/\/api$/, '');

const SPORT_ID_MAP: Record<string, string> = {
  "1": "Futebol",
  "2": "Tênis",
  "3": "Basquete",
  "4": "Hóquei",
  "5": "Vôlei",
};

/** Mapeia um item cru da API para o formato MatchData do frontend */
function mapApiMatchToMatchData(raw: any): MatchData {
  const [scoreA, scoreB] = (raw.ss ?? "0-0").split("-").map(Number);
  const minute = raw.timer?.tm ?? 0;
  const sportName = SPORT_ID_MAP[raw.sport_id] ?? "Futebol";

  return {
    id: String(raw.id),
    league: raw.league?.name ?? "Liga desconhecida",
    time: `${minute}'`,
    live: true,
    teamA: raw.home?.name ?? "Time A",
    teamB: raw.away?.name ?? "Time B",
    scoreA,
    scoreB,
    odds: [
      raw.odds?.[0] ?? 1.50,
      raw.odds?.[1] ?? 3.50,
      raw.odds?.[2] ?? 4.00,
    ],
    sport: sportName,
    period: raw.timer?.tt === "1" ? "2T" : "1T",
  };
}

/** Mapeia um item cru de upcoming da API para MatchData */
function mapUpcomingToMatchData(raw: any): MatchData {
  const sportName = SPORT_ID_MAP[raw.sport_id] ?? "Futebol";
  const matchDate = raw.time ? new Date(Number(raw.time) * 1000) : new Date();

  // Calcula diff de dias usando timezone GMT-3
  const now = new Date();
  const nowStr = now.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
  const matchStr = matchDate.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
  const nowDay = new Date(nowStr);
  const matchDay = new Date(matchStr);
  const diffDays = Math.round((matchDay.getTime() - nowDay.getTime()) / (1000 * 60 * 60 * 24));

  let dateLabel: string;
  if (diffDays <= 0) dateLabel = "Hoje";
  else if (diffDays === 1) dateLabel = "Amanhã";
  else dateLabel = matchDate.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "America/Sao_Paulo",
  }).replace(".", "");

  const timeStr = matchDate.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });

  return {
    id: String(raw.id),
    league: raw.league?.name ?? "Liga desconhecida",
    time: timeStr,
    live: false,
    teamA: raw.home?.name ?? "Time A",
    teamB: raw.away?.name ?? "Time B",
    odds: [1.50, 3.50, 4.00],
    sport: sportName,
    date: dateLabel,
  };
}

/** Mapeia dados enriquecidos do /upcoming-with-odds para MatchData (com odds reais) */
function mapEnrichedToMatchData(raw: any): MatchData {
  const sportName = SPORT_ID_MAP[raw.sport_id] ?? "Futebol";
  const matchDate = raw.time ? new Date(Number(raw.time) * 1000) : new Date();

  // Calcula diff de dias usando timezone GMT-3
  const now = new Date();
  const nowStr = now.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
  const matchStr = matchDate.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
  const nowDay = new Date(nowStr);
  const matchDay = new Date(matchStr);
  const diffDays = Math.round((matchDay.getTime() - nowDay.getTime()) / (1000 * 60 * 60 * 24));

  let dateLabel: string;
  if (diffDays <= 0) dateLabel = "Hoje";
  else if (diffDays === 1) dateLabel = "Amanhã";
  else dateLabel = matchDate.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "America/Sao_Paulo",
  }).replace(".", "");

  const timeStr = matchDate.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });

  return {
    id: String(raw.id),
    league: raw.league ?? "Liga desconhecida",
    time: timeStr,
    live: false,
    teamA: raw.home ?? "Time A",
    teamB: raw.away ?? "Time B",
    odds: raw.simpleOdds ?? [1.50, 3.50, 4.00],
    sport: sportName,
    date: dateLabel,
  };
}

// Filtro de partidas virtuais (mesmo do backend)
const VIRTUAL_KEYWORDS = [
  "esports", "virtual", "cyber", "simulated", "srl", "e-football", "efootball",
  "esoccer", "e-soccer", "gaming", "gt leagues"
];

function isVirtualMatch(game: any): boolean {
  const leagueName = (game.league?.name || "").toLowerCase();
  return VIRTUAL_KEYWORDS.some((kw) => leagueName.includes(kw));
}

/**
 * Service layer for matches data.
 */

export async function getAllMatchesWithStatus(): Promise<{ matches: MatchData[]; cacheComplete: boolean }> {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/matches/upcoming-with-odds`);
    const { matches: raw, cacheComplete } = response.data as { matches: any[]; cacheComplete: boolean };
    return { matches: raw.map(mapEnrichedToMatchData), cacheComplete: !!cacheComplete };
  } catch (error) {
    console.error("Erro ao buscar partidas:", error);
    return { matches: [], cacheComplete: false };
  }
}

export async function getAllMatches(): Promise<MatchData[]> {
  const { matches } = await getAllMatchesWithStatus();
  return matches;
}

export async function getCarouselMatches(): Promise<MatchData[]> {
  const all = await getAllMatches();
  return all.slice(0, 12);
}

export async function getFeaturedMatches(): Promise<MatchData[]> {
  try {
    const { getFeaturedMatchIds } = await import("./suggestedBetsService");
    const [all, featuredIds] = await Promise.all([
      getAllMatches(),
      getFeaturedMatchIds(),
    ]);
    if (featuredIds.length > 0) {
      const matchMap = new Map(all.map(m => [m.id, m]));
      const featured = featuredIds
        .map(id => matchMap.get(id))
        .filter(Boolean) as MatchData[];
      if (featured.length > 0) return featured.slice(0, 6);
    }
    // fallback: primeiros 6
    return all.slice(0, 6);
  } catch {
    const all = await getAllMatches();
    return all.slice(0, 6);
  }
}

export async function getLiveMatches(): Promise<MatchData[]> {
  const response = await axios.get(`${API_BASE_URL}/api/live`);
  const raw: any[] = response.data;
  return raw.map(mapApiMatchToMatchData);
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

// ─── Extended endpoints (wired to backend) ──

export async function getMatchById(id: string): Promise<MatchData | undefined> {
  // Search pre-match first, then live — they are kept in separate endpoints.
  const preMatch = (await getAllMatches()).find((m) => m.id === id);
  if (preMatch) return preMatch;
  return (await getLiveMatches()).find((m) => m.id === id);
}

export async function getMatchOdds(eventId: string): Promise<{ simpleOdds: [number, number, number] | null; odds: any }> {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/match/${eventId}/odds`, { timeout: 8000 });
    return response.data;
  } catch {
    return { simpleOdds: null, odds: null };
  }
}

export async function getUpcomingMatchesWithOdds(): Promise<any[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/matches/upcoming-with-odds`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar partidas com odds:", error);
    return [];
  }
}

export async function getEndedMatches(): Promise<any[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/ended`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar partidas encerradas:", error);
    return [];
  }
}

export async function getMatchLineups(matchId: string): Promise<any | null> {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/match/${matchId}/lineup`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar lineup:", error);
    return null;
  }
}

export async function getTeamHistory(teamId: string, page = 1): Promise<any[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/team/${teamId}/history`, {
      params: { page },
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar histórico do time:", error);
    return [];
  }
}

export async function getPlayerAnalysis(playerId: string, context?: {
  isDerby?: boolean;
  isHome?: boolean;
  isOffensivePlayer?: boolean;
  isDefensiveOpponent?: boolean;
  expectedMinutes?: number;
}): Promise<any | null> {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/player/${playerId}/analysis`, {
      params: context,
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar análise do jogador:", error);
    return null;
  }
}

export async function getPlayerRecommendation(playerId: string, context?: {
  isDerby?: boolean;
  isHome?: boolean;
  isOffensivePlayer?: boolean;
  isDefensiveOpponent?: boolean;
  expectedMinutes?: number;
}): Promise<any | null> {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/player/${playerId}/recommendation`, {
      params: context,
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar recomendação:", error);
    return null;
  }
}

export async function getPlayerConditionalAnalysis(playerId: string, body: {
  isDerby?: boolean;
  isHome?: boolean;
  isOffensivePlayer?: boolean;
  isDefensiveOpponent?: boolean;
  expectedMinutes?: number;
  match: {
    minute: number;
    scoreDiff: number;
    possession: number;
    dangerousAttacks: number;
  };
}): Promise<any | null> {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/player/${playerId}/analysis/conditional`, body);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar análise condicional:", error);
    return null;
  }
}

export async function getMatchStatistics(matchId: string): Promise<MatchStatistics | null> {
  return Promise.resolve(null);
}

export async function getMatchEvents(matchId: string): Promise<MatchEvent[]> {
  return Promise.resolve([]);
}

export async function getMatchH2H(matchId: string): Promise<H2HRecord[]> {
  return Promise.resolve([]);
}
