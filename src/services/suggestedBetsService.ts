import axios from 'axios';
import { SuggestedBet } from "@/data/matches";
import { dreamBets, bestOfDayBets } from "@/data/matches";

const API_BASE_URL = 'http://localhost:3000';

/**
 * Faz a chamada individual para o endpoint de Machine Learning
 */
export async function getMLPrediction(homeTeam: string, awayTeam: string): Promise<any> {
  try {
    const response = await axios.post(`${API_BASE_URL}/ml/predict/match`, {
      home_team: homeTeam,
      away_team: awayTeam
    });
    return response.data; 
  } catch (error) {
    console.error(`Erro na predição para ${homeTeam} vs ${awayTeam}:`, error);
    return null;
  }
}

export async function getDreamBets(): Promise<SuggestedBet[]> {
  return Promise.resolve(dreamBets);
}

export async function getBestOfDayBets(): Promise<SuggestedBet[]> {
  return Promise.resolve(bestOfDayBets);
}

/**
 * Integra os mocks estáticos com as predições dinâmicas da ML
 */
export async function getAllSuggestedBets(): Promise<SuggestedBet[]> {
  try {
    // 1. Busca as partidas ao vivo do back-end
    const matchesResponse = await axios.get(`${API_BASE_URL}/api/live`);
    const liveMatches = matchesResponse.data;

    // 2. Cria as predições para as partidas encontradas
    const mlSuggestionsPromises = liveMatches.slice(0, 4).map(async (match: any) => {
      const homeTeam = match.home?.name ?? 'Time A';
      const awayTeam = match.away?.name ?? 'Time B';
      const prediction = await getMLPrediction(homeTeam, awayTeam);
      
      if (!prediction) return null;

      return {
        id: `ml-${match.id}`,
        matchId: String(match.id),
        teamA: homeTeam,
        teamB: awayTeam,
        league: match.league?.name || 'Geral',
        pick: prediction.label || 'Vitória',
        odds: prediction.odds || 1.80,
        probability: prediction.probability || 0
      } as SuggestedBet;
    });

    // Aguarda todas as promessas do map resolverem e filtra os nulos
    const results = await Promise.all(mlSuggestionsPromises);
    const mlBets = results.filter((bet): bet is SuggestedBet => bet !== null);

    // 3. Retorna a união dos mocks com as sugestões reais da ML
    return [...dreamBets, ...bestOfDayBets, ...mlBets];

  } catch (error) {
    console.error("Erro ao carregar sugestões completas:", error);
    // Fallback: se o back-end ou a ML falharem, retorna apenas os mocks
    return [...dreamBets, ...bestOfDayBets];
  }
}

/**
 * Busca partidas próximas com odds e gera sugestões via ML para cada uma
 */
export async function getUpcomingBets(): Promise<SuggestedBet[]> {
  const response = await axios.get(`${API_BASE_URL}/api/matches/upcoming-with-odds`);
  const matches: any[] = response.data;

  if (!matches.length) return [];

  const promises = matches.slice(0, 6).map(async (match: any) => {
    const homeTeam = match.home?.name ?? match.homeTeam ?? 'Time A';
    const awayTeam = match.away?.name ?? match.awayTeam ?? 'Time B';
    const prediction = await getMLPrediction(homeTeam, awayTeam);

    if (!prediction) return null;

    return {
      id: `upcoming-${match.id}`,
      matchId: String(match.id),
      teamA: homeTeam,
      teamB: awayTeam,
      league: match.league?.name ?? match.league ?? 'Geral',
      pick: prediction.label || 'Vitória',
      odds: prediction.odds || match.odds?.[0] || 1.80,
      probability: prediction.probability || 0,
    } as SuggestedBet;
  });

  const results = await Promise.all(promises);
  return results.filter((bet): bet is SuggestedBet => bet !== null);
}