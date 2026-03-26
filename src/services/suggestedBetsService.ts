import { SuggestedBet } from "@/data/matches";
import { API_CONFIG } from "@/config/api";

/**
 * Service layer for suggested bets
 * Timeout extended to 60s because the endpoint fetches odds + calls AI
 */

async function suggestionsRequest<T>(endpoint: string): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60_000);

  try {
    const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function getDreamBets(): Promise<SuggestedBet[]> {
  try {
    return await suggestionsRequest<SuggestedBet[]>("/suggestions/dream");
  } catch (error) {
    console.error("Erro ao buscar dream bets:", error);
    return [];
  }
}

export async function getBestOfDayBets(): Promise<SuggestedBet[]> {
  try {
    return await suggestionsRequest<SuggestedBet[]>("/suggestions/best");
  } catch (error) {
    console.error("Erro ao buscar best of day:", error);
    return [];
  }
}

export async function getAllSuggestedBets(): Promise<SuggestedBet[]> {
  try {
    return await suggestionsRequest<SuggestedBet[]>("/suggestions");
  } catch (error) {
    console.error("Erro ao buscar sugestões:", error);
    return [];
  }
}

export async function getFeaturedMatchIds(): Promise<string[]> {
  try {
    return await suggestionsRequest<string[]>("/suggestions/featured");
  } catch (error) {
    console.error("Erro ao buscar destaques:", error);
    return [];
  }
}
