export interface MatchStatistics {
  possession?: [number, number];
  shots?: [number, number];
  shotsOnTarget?: [number, number];
  corners?: [number, number];
  fouls?: [number, number];
  yellowCards?: [number, number];
  redCards?: [number, number];
  // Basketball
  rebounds?: [number, number];
  assists?: [number, number];
  turnovers?: [number, number];
  threePointers?: [number, number];
  freeThrows?: [number, number];
  // Tennis / Volleyball
  aces?: [number, number];
  doubleFaults?: [number, number];
  firstServePercent?: [number, number];
}

export interface MatchEvent {
  id: string;
  minute: number;
  type: 'goal' | 'card' | 'substitution' | 'var' | 'penalty' | 'corner' | 'set' | 'timeout';
  team: 'A' | 'B';
  player?: string;
  detail?: string;
}

export interface PlayerInfo {
  id: string;
  name: string;
  number?: number;
  position?: string;
  photo?: string;
}

export interface MatchLineup {
  teamA: { formation?: string; starters: PlayerInfo[]; bench: PlayerInfo[] };
  teamB: { formation?: string; starters: PlayerInfo[]; bench: PlayerInfo[] };
}

export interface H2HRecord {
  date: string;
  competition: string;
  scoreA: number;
  scoreB: number;
  teamA: string;
  teamB: string;
}

export interface MatchData {
  id: string;
  league: string;
  time: string;
  live?: boolean;
  teamA: string;
  teamB: string;
  scoreA?: number;
  scoreB?: number;
  odds: [number, number, number];
  sport?: string;
  // Extended fields — populated when backend is integrated
  statistics?: MatchStatistics;
  events?: MatchEvent[];
  lineups?: MatchLineup;
  h2h?: H2HRecord[];
  venue?: string;
  referee?: string;
  logoA?: string;
  logoB?: string;
  period?: string;        // "1st Half", "Q3", "2º Set", etc.
  minuteOfPlay?: number;  // actual elapsed game minutes (for live)
}

function slugify(teamA: string, teamB: string): string {
  return `${teamA}-vs-${teamB}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const featuredMatches: MatchData[] = [
  {
    id: slugify("Flamengo", "Palmeiras"),
    league: "Brasileirão Série A",
    time: "21:30",
    live: true,
    teamA: "Flamengo",
    teamB: "Palmeiras",
    scoreA: 1,
    scoreB: 2,
    odds: [2.45, 3.20, 2.90],
    sport: "Futebol",
  },
  {
    id: slugify("Real Madrid", "Manchester City"),
    league: "Champions League",
    time: "16:00",
    teamA: "Real Madrid",
    teamB: "Manchester City",
    odds: [2.10, 3.40, 3.25],
    sport: "Futebol",
  },
  {
    id: slugify("Arsenal", "Liverpool"),
    league: "Premier League",
    time: "13:30",
    teamA: "Arsenal",
    teamB: "Liverpool",
    odds: [2.60, 3.10, 2.75],
    sport: "Futebol",
  },
  {
    id: slugify("Barcelona", "Atlético Madrid"),
    league: "La Liga",
    time: "17:00",
    teamA: "Barcelona",
    teamB: "Atlético Madrid",
    odds: [1.85, 3.50, 4.10],
    sport: "Futebol",
  },
  {
    id: slugify("Corinthians", "São Paulo"),
    league: "Brasileirão Série A",
    time: "19:00",
    live: true,
    teamA: "Corinthians",
    teamB: "São Paulo",
    scoreA: 0,
    scoreB: 0,
    odds: [2.30, 3.15, 3.05],
    sport: "Futebol",
  },
  {
    id: slugify("Inter Milan", "Juventus"),
    league: "Serie A",
    time: "15:45",
    teamA: "Inter Milan",
    teamB: "Juventus",
    odds: [2.20, 3.30, 3.15],
    sport: "Futebol",
  },
];

export const liveMatches: MatchData[] = [
  {
    id: slugify("Flamengo", "Palmeiras") + "-live",
    league: "Brasileirão Série A",
    time: "67'",
    live: true,
    teamA: "Flamengo",
    teamB: "Palmeiras",
    scoreA: 1,
    scoreB: 2,
    odds: [2.45, 3.20, 2.90],
    sport: "Futebol",
  },
  {
    id: slugify("Chelsea", "Tottenham"),
    league: "Premier League",
    time: "34'",
    live: true,
    teamA: "Chelsea",
    teamB: "Tottenham",
    scoreA: 0,
    scoreB: 1,
    odds: [3.10, 3.40, 2.15],
    sport: "Futebol",
  },
  {
    id: slugify("Sevilla", "Valencia"),
    league: "La Liga",
    time: "82'",
    live: true,
    teamA: "Sevilla",
    teamB: "Valencia",
    scoreA: 3,
    scoreB: 1,
    odds: [1.25, 5.50, 9.00],
    sport: "Futebol",
  },
  {
    id: slugify("Corinthians", "São Paulo") + "-live",
    league: "Brasileirão Série A",
    time: "12'",
    live: true,
    teamA: "Corinthians",
    teamB: "São Paulo",
    scoreA: 0,
    scoreB: 0,
    odds: [2.30, 3.15, 3.05],
    sport: "Futebol",
  },
  {
    id: slugify("Los Angeles Lakers", "Golden State Warriors"),
    league: "NBA",
    time: "42'",
    live: true,
    teamA: "Los Angeles Lakers",
    teamB: "Golden State Warriors",
    scoreA: 65,
    scoreB: 72,
    odds: [1.95, 3.50, 1.85],
    sport: "Basquete",
  },
  {
    id: slugify("Boston Celtics", "Miami Heat"),
    league: "NBA",
    time: "28'",
    live: true,
    teamA: "Boston Celtics",
    teamB: "Miami Heat",
    scoreA: 48,
    scoreB: 51,
    odds: [1.85, 3.60, 1.95],
    sport: "Basquete",
  },
  {
    id: slugify("Novak Djokovic", "Carlos Alcaraz"),
    league: "Australian Open",
    time: "2º SET - 4-3",
    live: true,
    teamA: "Novak Djokovic",
    teamB: "Carlos Alcaraz",
    odds: [1.75, 2.10, 2.05],
    sport: "Tênis",
  },
  {
    id: slugify("Iga Świątek", "Aryna Sabalenka"),
    league: "Australian Open",
    time: "1º SET - 5-4",
    live: true,
    teamA: "Iga Świątek",
    teamB: "Aryna Sabalenka",
    odds: [2.05, 1.85, 1.90],
    sport: "Tênis",
  },
];

export const carouselMatches: MatchData[] = [
  {
    id: slugify("Bayern Munich", "Borussia Dortmund"),
    league: "Bundesliga",
    time: "14:30",
    teamA: "Bayern Munich",
    teamB: "Borussia Dortmund",
    odds: [1.75, 3.80, 4.20],
    sport: "Futebol",
  },
  {
    id: slugify("PSG", "Marseille"),
    league: "Ligue 1",
    time: "17:00",
    teamA: "PSG",
    teamB: "Marseille",
    odds: [1.50, 4.10, 5.50],
    sport: "Futebol",
  },
  {
    id: slugify("Sport Recife", "Ceará"),
    league: "Brasileirão Série B",
    time: "20:00",
    teamA: "Sport Recife",
    teamB: "Ceará",
    odds: [2.40, 3.10, 2.95],
    sport: "Futebol",
  },
  {
    id: slugify("Grêmio", "Cruzeiro"),
    league: "Copa do Brasil",
    time: "21:45",
    teamA: "Grêmio",
    teamB: "Cruzeiro",
    odds: [2.15, 3.25, 3.30],
    sport: "Futebol",
  },
  {
    id: slugify("Ajax", "PSV"),
    league: "Eredivisie",
    time: "15:00",
    teamA: "Ajax",
    teamB: "PSV",
    odds: [2.50, 3.30, 2.70],
    sport: "Futebol",
  },
  {
    id: slugify("Benfica", "Porto"),
    league: "Liga Portugal",
    time: "18:30",
    teamA: "Benfica",
    teamB: "Porto",
    odds: [2.05, 3.40, 3.45],
    sport: "Futebol",
  },
  {
    id: slugify("Los Angeles Lakers", "Denver Nuggets"),
    league: "NBA",
    time: "19:00",
    teamA: "Los Angeles Lakers",
    teamB: "Denver Nuggets",
    odds: [2.30, 1.95, 1.70],
    sport: "Basquete",
  },
  {
    id: slugify("Boston Celtics", "Philadelphia 76ers"),
    league: "NBA",
    time: "20:30",
    teamA: "Boston Celtics",
    teamB: "Philadelphia 76ers",
    odds: [1.85, 2.10, 1.95],
    sport: "Basquete",
  },
  {
    id: slugify("Miami Heat", "Chicago Bulls"),
    league: "NBA",
    time: "21:00",
    teamA: "Miami Heat",
    teamB: "Chicago Bulls",
    odds: [1.65, 2.20, 2.30],
    sport: "Basquete",
  },
  {
    id: slugify("Novak Djokovic", "Carlos Alcaraz") + "-pre",
    league: "Australian Open",
    time: "12:00",
    teamA: "Novak Djokovic",
    teamB: "Carlos Alcaraz",
    odds: [2.75, 1.45, 1.55],
    sport: "Tênis",
  },
  {
    id: slugify("Iga Swiatek", "Aryna Sabalenka") + "-pre",
    league: "Australian Open",
    time: "14:30",
    teamA: "Iga Swiatek",
    teamB: "Aryna Sabalenka",
    odds: [2.45, 1.50, 1.65],
    sport: "Tênis",
  },
  {
    id: slugify("Jannik Sinner", "Daniil Medvedev"),
    league: "ATP Finals",
    time: "16:00",
    teamA: "Jannik Sinner",
    teamB: "Daniil Medvedev",
    odds: [1.95, 1.85, 1.90],
    sport: "Tênis",
  },
];

export const volleyballMatches: MatchData[] = [
  {
    id: slugify("Sada Cruzeiro", "Minas Tênis"),
    league: "Superliga Masculina",
    time: "19:30",
    teamA: "Sada Cruzeiro",
    teamB: "Minas Tênis",
    odds: [1.85, 2.20, 3.50],
    sport: "Vôlei",
  },
  {
    id: slugify("Osasco Audax", "Praia Clube"),
    league: "Superliga Feminina",
    time: "20:00",
    teamA: "Osasco Audax",
    teamB: "Praia Clube",
    odds: [2.10, 1.95, 3.20],
    sport: "Vôlei",
  },
  {
    id: slugify("Vedacit Vôlei", "Marechal"),
    league: "Superliga Masculina",
    time: "21:00",
    teamA: "Vedacit Vôlei",
    teamB: "Marechal",
    odds: [1.70, 2.50, 3.80],
    sport: "Vôlei",
  },
];

export interface SuggestedBet {
  id: string;
  matchId: string;
  teamA: string;
  teamB: string;
  league: string;
  pick: string;
  odds: number;
  probability?: number;
}

export const dreamBets: SuggestedBet[] = [
  {
    id: "dream-1",
    matchId: slugify("PSG", "Marseille"),
    teamA: "PSG",
    teamB: "Marseille",
    league: "Ligue 1",
    pick: "Vitória do Marseille",
    odds: 5.50,
    probability: Math.round((1 / 5.50) * 100),
  },
  {
    id: "dream-2",
    matchId: slugify("Barcelona", "Atlético Madrid"),
    teamA: "Barcelona",
    teamB: "Atlético Madrid",
    league: "La Liga",
    pick: "Vitória Atlético Madrid",
    odds: 4.10,
    probability: Math.round((1 / 4.10) * 100),
  },
  {
    id: "dream-3",
    matchId: slugify("Sevilla", "Valencia"),
    teamA: "Sevilla",
    teamB: "Valencia",
    league: "La Liga",
    pick: "Vitória Valencia",
    odds: 9.00,
    probability: Math.round((1 / 9.00) * 100),
  },
  {
    id: "dream-4",
    matchId: slugify("Ajax", "PSV"),
    teamA: "Ajax",
    teamB: "PSV",
    league: "Eredivisie",
    pick: "Vitória PSV",
    odds: 2.70,
    probability: Math.round((1 / 2.70) * 100),
  },
  {
    id: "dream-5",
    matchId: slugify("Benfica", "Porto"),
    teamA: "Benfica",
    teamB: "Porto",
    league: "Liga Portugal",
    pick: "Vitória Porto",
    odds: 3.45,
    probability: Math.round((1 / 3.45) * 100),
  },
];

export const bestOfDayBets: SuggestedBet[] = [
  {
    id: "best-1",
    matchId: slugify("Real Madrid", "Manchester City"),
    teamA: "Real Madrid",
    teamB: "Manchester City",
    league: "Champions League",
    pick: "Empate",
    odds: 3.40,
    probability: Math.round((1 / 3.40) * 100),
  },
  {
    id: "best-2",
    matchId: slugify("Arsenal", "Liverpool"),
    teamA: "Arsenal",
    teamB: "Liverpool",
    league: "Premier League",
    pick: "Vitória Arsenal",
    odds: 2.60,
    probability: Math.round((1 / 2.60) * 100),
  },
  {
    id: "best-3",
    matchId: slugify("Corinthians", "São Paulo"),
    teamA: "Corinthians",
    teamB: "São Paulo",
    league: "Brasileirão Série A",
    pick: "Empate",
    odds: 3.15,
    probability: Math.round((1 / 3.15) * 100),
  },
  {
    id: "best-4",
    matchId: slugify("Bayern Munich", "Borussia Dortmund"),
    teamA: "Bayern Munich",
    teamB: "Borussia Dortmund",
    league: "Bundesliga",
    pick: "Vitória Bayern Munich",
    odds: 1.75,
    probability: Math.round((1 / 1.75) * 100),
  },
  {
    id: "best-5",
    matchId: slugify("Inter Milan", "Juventus"),
    teamA: "Inter Milan",
    teamB: "Juventus",
    league: "Serie A",
    pick: "Empate",
    odds: 3.30,
    probability: Math.round((1 / 3.30) * 100),
  },
];

export const allMatches: MatchData[] = [
  ...featuredMatches,
  ...liveMatches,
  ...carouselMatches,
  ...volleyballMatches,
];

export function getMatchById(id: string): MatchData | undefined {
  return allMatches.find((m) => m.id === id);
}
