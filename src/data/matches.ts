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
];

export const allMatches: MatchData[] = [
  ...featuredMatches,
  ...liveMatches,
  ...carouselMatches,
];

export function getMatchById(id: string): MatchData | undefined {
  return allMatches.find((m) => m.id === id);
}
