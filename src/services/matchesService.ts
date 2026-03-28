import axios from 'axios'
import type { MatchData, MatchStatistics, MatchEvent, MatchLineup } from "@/data/matches";
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
    odds: raw.odds ?? [1.50, 3.50, 4.00] as [number, number, number],
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
 *
 * Cache em memória no cliente: evita que navegar entre páginas esvazie a lista
 * enquanto aguarda a resposta da API. O cache é invalidado quando o backend
 * responde com dados mais novos (cacheComplete ou mais jogos do que o atual).
 */
interface ClientCache {
  matches: MatchData[];
  cacheComplete: boolean;
  ts: number;
}
let _clientCache: ClientCache | null = null;
const CLIENT_CACHE_TTL = 5 * 60 * 1000; // 5 minutos no cliente

export async function getAllMatchesWithStatus(): Promise<{ matches: MatchData[]; cacheComplete: boolean }> {
  // Retorna o cache do cliente imediatamente enquanto a request acontece em paralelo
  const now = Date.now();
  const cachedSnapshot = _clientCache && (now - _clientCache.ts) < CLIENT_CACHE_TTL
    ? { matches: _clientCache.matches, cacheComplete: _clientCache.cacheComplete }
    : null;

  try {
    const response = await axios.get(`${API_BASE_URL}/api/matches/upcoming-with-odds`);
    const { matches: raw, cacheComplete } = response.data as { matches: any[]; cacheComplete: boolean };
    const mapped = raw.map(mapEnrichedToMatchData);
    _clientCache = { matches: mapped, cacheComplete: !!cacheComplete, ts: Date.now() };
    return { matches: mapped, cacheComplete: !!cacheComplete };
  } catch (error) {
    console.error("Erro ao buscar partidas:", error);
    // Em caso de erro, devolve o cache antigo se existir
    if (cachedSnapshot) return cachedSnapshot;
    return { matches: [], cacheComplete: false };
  }
}

/**
 * Retorna o cache do cliente sincronamente (sem fazer request).
 * Usado pelo hook useMatches para popular o estado inicial e evitar flash vazio.
 */
export function getCachedMatches(): { matches: MatchData[]; cacheComplete: boolean } | null {
  if (!_clientCache) return null;
  return { matches: _clientCache.matches, cacheComplete: _clientCache.cacheComplete };
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

export interface ApiMatchEvent {
  minute: number;
  type: "goal" | "yellow" | "red" | "substitution";
  team: "home" | "away";
  player: string;
}

export async function getMatchEvents(matchId: string): Promise<{ events: ApiMatchEvent[]; homeTeam: string; awayTeam: string } | null> {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/match/${matchId}/events`);
    return response.data;
  } catch {
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

// ─── Full Odds types ─────────────────────────────────────────────────────────

export interface FullOddsData {
  resultado?: { home: number; draw: number; away: number };
  goalsOverUnder?: { line: string; over: number; under: number }[];
  handicap?: { label: string; odd: number }[];
  corners?: { line: string; over: number; under: number }[];
  cards?: { line: string; over: number; under: number }[];
  doubleChance?: { homeOrDraw: number; homeOrAway: number; drawOrAway: number };
  correctScore?: {
    homeScores: { s: string; o: number }[];
    draws: { s: string; o: number }[];
    awayScores: { s: string; o: number }[];
  };
  halfTime?: { home: number; draw: number; away: number };
  oddsHistory?: { time: string; home: number; draw: number; away: number }[];
}

export interface H2HMatch {
  id: string;
  date: string;
  home: string;
  away: string;
  score: string;
  winner: 'home' | 'away' | 'draw';
  league: string;
}

export interface H2HApiData {
  h2h: H2HMatch[];
  homeLastMatches: H2HMatch[];
  awayLastMatches: H2HMatch[];
  stats: {
    totalMatches: number;
    homeWins: number;
    awayWins: number;
    draws: number;
    avgGoals: number;
    bttsPercentage: number;
    homeWinPercentage: number;
    awayWinPercentage: number;
    drawPercentage: number;
  };
}

export async function getFullOddsForMatch(eventId: string): Promise<FullOddsData | null> {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/match/${eventId}/full-odds`, { timeout: 10000 });
    return response.data as FullOddsData;
  } catch {
    return null;
  }
}

export async function getMatchH2H(matchId: string): Promise<H2HApiData | null> {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/match/${matchId}/h2h`, { timeout: 35000 });
    return response.data as H2HApiData;
  } catch {
    return null;
  }
}

export interface H2HBulkData {
  h2h: Record<string, H2HApiData>;
  total: number;
  preloading: boolean;
}

export interface TeamAvgStats {
  avgGoalsScored: number;
  avgGoalsConceded: number;
  avgShots: number | null;
  avgShotsOnTarget: number | null;
  avgPossession: number | null;
  avgCorners: number | null;
  avgYellowCards: number | null;
  avgSaves: number | null;
}

export interface TeamHistoricSummary {
  teamId: string;
  teamName: string;
  games: {
    eventId: string;
    date: string;
    opponent: string;
    league: string;
    venue: "home" | "away";
    goalsScored: number;
    goalsConceded: number;
    result: "W" | "D" | "L";
    score: string;
  }[];
  totals: {
    matches: number;
    wins: number;
    draws: number;
    losses: number;
    goalsScored: number;
    goalsConceded: number;
    cleanSheets: number;
    btts: number;
    winPercentage: number;
    form: string;
  };
  avg: TeamAvgStats;
}

export interface MatchHistoricData {
  eventId: string;
  home: TeamHistoricSummary;
  away: TeamHistoricSummary;
}

export async function getMatchHistoric(matchId: string, limit = 10): Promise<MatchHistoricData | null> {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/match/${matchId}/historic`, {
      params: { limit },
      timeout: 35000,
    });
    return response.data as MatchHistoricData;
  } catch {
    return null;
  }
}

export interface TeamLiveStats {
  name: string;
  shots: number | null;
  shotsOnTarget: number | null;
  possession: number | null;
  corners: number | null;
  yellowCards: number | null;
  redCards: number | null;
  attacks: number | null;
  dangerousAttacks: number | null;
  saves: number | null;
}

export interface MatchLiveStats {
  eventId: string;
  minute: number | null;
  score: string;
  home: TeamLiveStats;
  away: TeamLiveStats;
}

export async function getMatchLiveStats(matchId: string): Promise<MatchLiveStats | null> {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/match/${matchId}/live-stats`, { timeout: 10000 });
    return response.data as MatchLiveStats;
  } catch {
    return null;
  }
}

/**
 * Retorna as estatísticas ao vivo de TODOS os jogos de uma vez.
 * Usa o endpoint bulk para reduzir N requests → 1 request.
 */
export async function getMatchLiveStatsBulk(): Promise<Record<string, MatchLiveStats>> {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/live-stats/bulk`, { timeout: 10000 });
    return response.data as Record<string, MatchLiveStats>;
  } catch {
    return {};
  }
}

export async function getAllH2H(): Promise<H2HBulkData | null> {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/matches/h2h-bulk`, { timeout: 10000 });
    return response.data as H2HBulkData;
  } catch {
    return null;
  }
}
