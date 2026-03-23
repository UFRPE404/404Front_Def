// Arquivo de documentação para futura integração com backend
// Não é um arquivo efetivamente usado, apenas serve como guia

/**
 * REFACTORING GUIDE FOR BACKEND INTEGRATION
 * ==========================================
 * 
 * A refatoração foi realizada para deixar a integração com backend simples e direta.
 * 
 * ESTRUTURA CRIADA:
 * 
 * 1. SERVICES LAYER
 *    - src/services/matchesService.ts - Serviço para dados de partidas
 *    - src/services/suggestedBetsService.ts - Serviço para apostas sugeridas
 *    
 *    Cada serviço exporta funções async que retornam Promise<T>
 *    As funções estão prontas para receber chamadas HTTP
 *
 * 2. HOOKS LAYER
 *    - src/hooks/useMatchesData.ts - Hooks para dados de partidas
 *      * useMatches() - Todas as partidas
 *      * useCarouselMatches() - Partidas para carrossel
 *      * useFeaturedMatches() - Partidas em destaque
 *      * useLiveMatches() - Partidas ao vivo
 *      * useMatchesBySport(sport) - Por esporte
 *      * useMatchesByLeague(league) - Por liga
 *      * useSports() - Lista de esportes
 *      * useLeaguesBySport(sport) - Ligas de um esporte
 *    
 *    - src/hooks/useSuggestedBets.ts - Hooks para apostas sugeridas
 *      * useDreamBets() - Apostas para sonhar
 *      * useBestOfDayBets() - Melhores apostas do dia
 *      * useAllSuggestedBets() - Todas as apostas
 *
 * 3. COMPONENTES REFATORADOS
 *    - src/pages/Sports.tsx - Usa useMatches, useCarouselMatches, useSports
 *    - src/pages/Live.tsx - Usa useLiveMatches
 *    - src/components/FeaturedMatches.tsx - Usa useFeaturedMatches
 *    - src/components/LiveMatches.tsx - Usa useLiveMatches
 *    - src/components/GamesCarousel.tsx - Usa useCarouselMatches
 *    - src/components/SuggestedBets.tsx - Usa useDreamBets, useBestOfDayBets
 *
 * COMO INTEGRAR COM BACKEND:
 * ===========================
 *
 * 1. Configure a URL da API:
 *    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
 *
 * 2. Atualize as funções no arquivo de service:
 *    
 *    Exemplo (antes):
 *    export async function getAllMatches(): Promise<MatchData[]> {
 *      return Promise.resolve(allMatches);
 *    }
 *    
 *    Exemplo (depois):
 *    export async function getAllMatches(): Promise<MatchData[]> {
 *      const response = await fetch(`${API_BASE_URL}/matches`);
 *      if (!response.ok) throw new Error('Failed to fetch matches');
 *      return response.json();
 *    }
 *
 * 3. Cada hook já trata:
 *    - Estados de loading
 *    - Estados de erro
 *    - Atualização automática quando dependências mudam
 *
 * 4. Nenhuma mudança necessária nos componentes!
 *    Os hooks abstraem toda a complexidade
 *
 * ESTRUTURA DE DADOS:
 * ===================
 *
 * MatchData {
 *   id: string
 *   league: string
 *   time: string
 *   live?: boolean
 *   teamA: string
 *   teamB: string
 *   scoreA?: number
 *   scoreB?: number
 *   odds: [number, number, number]
 *   sport?: string
 * }
 *
 * SuggestedBet {
 *   id: string
 *   theme: 'dream' | 'best'
 *   pick: string
 *   probability: number
 *   odds: number
 *   reason: string
 *   match: MatchData
 *   riskLevel: 'Baixo' | 'Médio' | 'Alto'
 * }
 *
 * TRATAMENTO DE ERROS:
 * ====================
 *
 * Cada hook retorna { data, loading, error }
 * Você pode usar o estado de erro para mostrar mensagens ao usuário:
 *
 * const { matches, loading, error } = useMatches();
 *
 * if (error) return <ErrorBoundary error={error} />;
 * if (loading) return <LoadingSpinner />;
 * return <MatchCard match={matches[0]} />;
 *
 * CACHING (OPCIONAL):
 * ===================
 *
 * Para implementar caching, você pode:
 * 1. Usar React Query (recomendado): npm install @tanstack/react-query
 * 2. Usar SWR: npm install swr
 * 3. Implementar caching simples com localStorage
 *
 * Exemplo com React Query:
 * 
 * import { useQuery } from '@tanstack/react-query';
 *
 * export function useMatches() {
 *   return useQuery({
 *     queryKey: ['matches'],
 *     queryFn: () => matchesService.getAllMatches(),
 *     staleTime: 1000 * 60 * 5, // 5 minutos
 *   });
 * }
 */
