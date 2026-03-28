import { MatchData } from "@/data/matches";

// ─────────────────────────────────────────────────────────────────────────────
// TIER 1 — Elite: top-5 European leagues, Champions League equivalents,
//           Brasileirão, Copa Libertadores/Sudamericana, full national-team
//           competitions AND any match where either side is a top-30 country.
// ─────────────────────────────────────────────────────────────────────────────
const TIER1_LEAGUES = new Set<string>([
  // UEFA club competitions
  "champions league",
  "uefa champions league",
  "europa league",
  "uefa europa league",
  "conference league",
  "uefa conference league",
  "uefa europa conference league",

  // England
  "premier league",
  "england premier league",
  "english premier league",

  // Spain
  "la liga",
  "laliga",
  "laliga ea sports",
  "spain la liga",

  // Germany
  "bundesliga",
  "1. bundesliga",
  "germany bundesliga",

  // Italy
  "serie a",
  "serie a tim",
  "italy serie a",
  "série a",

  // France
  "ligue 1",
  "france ligue 1",
  "ligue 1 mcdonald's",
  "ligue 1 uber eats",
  "ligue 1 betclic",

  // Brazil
  "brasileirão série a",
  "brasileirao serie a",
  "campeonato brasileiro série a",
  "campeonato brasileiro serie a",
  "brazil série a",
  "brazil serie a",
  "série a",           // backend shorthand

  // South America continental
  "copa libertadores",
  "conmebol libertadores",
  "copa sudamericana",
  "conmebol sudamericana",

  // National-team tournaments
  "fifa world cup",
  "world cup",
  "copa america",
  "copa américa",
  "conmebol copa america",
  "conmebol copa américa",
  "uefa nations league",
  "nations league",
  "gold cup",
  "concacaf gold cup",
  "africa cup of nations",
  "afcon",
  "caf africa cup of nations",
  "olympic games",
  "olympics",
]);

// Competitions whose names include a year (Euro 2024, World Cup 2026, …)
const TIER1_PREFIXES: string[] = [
  "euro 20",
  "uefa euro 20",
  "world cup 20",
  "fifa world cup 20",
];

// ─────────────────────────────────────────────────────────────────────────────
// TOP-30 COUNTRIES (FIFA ranking ~2026)
// Any match where teamA OR teamB is one of these → automatic Tier 1
// ─────────────────────────────────────────────────────────────────────────────
const TOP_30_COUNTRIES = new Set<string>([
  "argentina",
  "france",
  "spain",
  "england",
  "brazil",
  "portugal",
  "netherlands",
  "holland",
  "belgium",
  "germany",
  "italy",
  "croatia",
  "morocco",
  "colombia",
  "uruguay",
  "usa",
  "united states",
  "united states of america",
  "mexico",
  "switzerland",
  "japan",
  "senegal",
  "denmark",
  "austria",
  "ecuador",
  "norway",
  "south korea",
  "korea republic",
  "korea",
  "poland",
  "australia",
  "ukraine",
  "turkey",
  "peru",
  "iran",
]);

// ─────────────────────────────────────────────────────────────────────────────
// TIER 2 — Important: well-known leagues / continental cups one step below.
// ─────────────────────────────────────────────────────────────────────────────
const TIER2_LEAGUES = new Set<string>([
  // Netherlands
  "eredivisie",
  "netherlands eredivisie",

  // Portugal
  "primeira liga",
  "liga portugal",
  "portugal primeira liga",
  "liga nos",
  "liga bwin",
  "liga portugal bwin",

  // Turkey
  "super lig",
  "süper lig",
  "turkey super lig",
  "trendyol süper lig",

  // Belgium
  "jupiler pro league",
  "belgian pro league",
  "belgium pro league",
  "belgium first division a",

  // Scotland
  "scottish premiership",
  "scotland premiership",
  "premiership",

  // Saudi Arabia
  "saudi pro league",
  "saudi arabia pro league",
  "roshn saudi league",

  // USA / Mexico
  "mls",
  "major league soccer",
  "liga mx",
  "mexico liga mx",
  "liga bbva mx",
  "liga bbva expansión mx",
  "concacaf champions cup",
  "concacaf champions league",

  // Argentina
  "liga profesional",
  "liga profesional argentina",
  "argentina liga profesional",
  "torneo binance",
  "torneo apertura",
  "torneo clausura",
  "copa argentina",
  "argentina cup",
  "primera division",
  "argentina primera division",

  // Brazil Série B
  "brasileirão série b",
  "brasileirao serie b",
  "campeonato brasileiro série b",
  "campeonato brasileiro serie b",
  "brazil série b",
  "brazil serie b",

  // Continental Africa / Asia
  "caf champions league",
  "total energies caf champions league",
  "afc champions league",
  "afc champions league elite",

  // Japan / Korea / China
  "j1 league",
  "japan j1 league",
  "k league 1",
  "south korea k league 1",
  "chinese super league",
  "china super league",
  "china chinese super league",

  // Russia (still active in some markets)
  "russian premier league",
  "rpl",

  // Other important European
  "ligue 2",               // France 2nd — some APIs label it but it's lower; left as Tier 2 not 1
  "danish superliga",
  "denmark superliga",
  "allsvenskan",
  "sweden allsvenskan",
  "ekstraklasa",
  "poland ekstraklasa",
  "austrian bundesliga",
  "austria bundesliga",
  "swiss super league",
  "switzerland super league",
  "serie b",               // Italian Serie B (Tier 2 importance within Italy)
  "italy serie b",
  "2. bundesliga",
  "germany 2. bundesliga",
  "championship",          // English Championship
  "england championship",
]);

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function normalize(s: string): string {
  return s.toLowerCase().trim();
}

function isTopCountry(teamName: string): boolean {
  return TOP_30_COUNTRIES.has(normalize(teamName));
}

/** Returns 1 (elite), 2 (important) or 3 (other) for a given match. */
export function getMatchTier(match: MatchData): 1 | 2 | 3 {
  const league = normalize(match.league);

  // Tier 1 — league exact match
  if (TIER1_LEAGUES.has(league)) return 1;
  if (TIER1_PREFIXES.some((p) => league.startsWith(p))) return 1;

  // Tier 1 — either team is a top-30 national side
  if (isTopCountry(match.teamA) || isTopCountry(match.teamB)) return 1;

  // Tier 2 — league exact match
  if (TIER2_LEAGUES.has(league)) return 2;

  return 3;
}

/**
 * Returns featured matches for the "Destaques" section:
 * - All Tier 1 matches (up to 10), or
 * - Tier 1 + Tier 2 combined if Tier 1 alone is < 2 (up to 8),
 * - Empty array if nothing notable exists (hides the section).
 */
export function getFeaturedMatches<T extends MatchData>(matches: T[]): T[] {
  const tier1 = matches.filter((m) => getMatchTier(m) === 1);
  if (tier1.length >= 1) return tier1.slice(0, 10);

  const tier2 = matches.filter((m) => getMatchTier(m) === 2);
  const combined = [...tier1, ...tier2];
  return combined.length >= 1 ? combined.slice(0, 8) : [];
}
