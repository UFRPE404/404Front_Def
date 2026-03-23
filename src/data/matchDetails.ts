export interface Player {
  name: string;
  number: number;
  position: string;
  age: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  minutesPlayed: number;
  rating: number;
  photo?: string;
}

export interface TeamLineup {
  formation: string;
  coach: string;
  players: Player[];
  substitutes: Player[];
}

export interface MatchEvent {
  minute: number;
  type: "goal" | "yellow" | "red" | "substitution" | "var";
  team: "home" | "away";
  player: string;
  detail?: string;
}

export interface MatchStats {
  possession: [number, number];
  shots: [number, number];
  shotsOnTarget: [number, number];
  corners: [number, number];
  fouls: [number, number];
  offsides: [number, number];
  passes: [number, number];
  passAccuracy: [number, number];
  tackles: [number, number];
  saves: [number, number];
}

export interface BasketballStats {
  fieldGoalsMade: [number, number];
  fieldGoalsAttempted: [number, number];
  fieldGoalPercentage: [number, number];
  threePointersMade: [number, number];
  threePointersAttempted: [number, number];
  threePointPercentage: [number, number];
  freeThrowsMade: [number, number];
  freeThrowsAttempted: [number, number];
  freeThrowPercentage: [number, number];
  rebounds: [number, number];
  offensiveRebounds: [number, number];
  defensiveRebounds: [number, number];
  assists: [number, number];
  fouls: [number, number];
  steals: [number, number];
  blocks: [number, number];
  turnovers: [number, number];
  points: [number, number];
}

export interface TennisStats {
  aces: [number, number];
  doubleFaults: [number, number];
  firstServePercentage: [number, number];
  firstServeWinPercentage: [number, number];
  secondServeWinPercentage: [number, number];
  breakPointsWon: [number, number];
  breakPointsAttempted: [number, number];
  totalPointsWon: [number, number];
  maxSpeed: [number, number];
  totalShots: [number, number];
  winners: [number, number];
  unforceErrors: [number, number];
  netRushes: [number, number];
}

export interface VolleyballStats {
  aces: [number, number];
  kills: [number, number];
  totalAttacks: [number, number];
  blockingPoints: [number, number];
  digs: [number, number];
  receptions: [number, number];
  sets: [number, number];
  errors: [number, number];
  points: [number, number];
  setsWon: [number, number];
}

export interface MatchDetails {
  stadium: string;
  referee: string;
  weather: string;
  temperature: string;
  attendance: string;
  homeLineup: TeamLineup;
  awayLineup: TeamLineup;
  events: MatchEvent[];
  stats: MatchStats;
  basketballStats?: BasketballStats;
  tennisStats?: TennisStats;
  volleyballStats?: VolleyballStats;
}

// Deterministic lineup generator based on team name
function generateLineup(teamName: string, sport: string = "Futebol"): TeamLineup {
  const lineups: Record<string, { formation: string; coach: string; players: Player[]; subs: Player[] }> = {
    "Flamengo": {
      formation: "4-3-3",
      coach: "Filipe Luís",
      players: [
        { name: "Rossi", number: 1, position: "GOL", age: 29, goals: 0, assists: 0, yellowCards: 1, redCards: 0, minutesPlayed: 2340, rating: 7.2 },
        { name: "Wesley", number: 2, position: "LD", age: 21, goals: 2, assists: 5, yellowCards: 3, redCards: 0, minutesPlayed: 2100, rating: 7.0 },
        { name: "Léo Pereira", number: 4, position: "ZAG", age: 28, goals: 3, assists: 1, yellowCards: 5, redCards: 1, minutesPlayed: 2520, rating: 7.4 },
        { name: "Fabrício Bruno", number: 15, position: "ZAG", age: 28, goals: 1, assists: 0, yellowCards: 4, redCards: 0, minutesPlayed: 2160, rating: 7.1 },
        { name: "Ayrton Lucas", number: 6, position: "LE", age: 27, goals: 1, assists: 7, yellowCards: 2, redCards: 0, minutesPlayed: 2400, rating: 7.3 },
        { name: "Pulgar", number: 5, position: "VOL", age: 31, goals: 2, assists: 3, yellowCards: 6, redCards: 0, minutesPlayed: 2250, rating: 7.2 },
        { name: "De la Cruz", number: 18, position: "MC", age: 27, goals: 4, assists: 8, yellowCards: 2, redCards: 0, minutesPlayed: 1980, rating: 7.6 },
        { name: "Gerson", number: 8, position: "MC", age: 27, goals: 5, assists: 6, yellowCards: 3, redCards: 0, minutesPlayed: 2340, rating: 7.8 },
        { name: "Luiz Araújo", number: 7, position: "PD", age: 27, goals: 8, assists: 4, yellowCards: 1, redCards: 0, minutesPlayed: 1800, rating: 7.3 },
        { name: "Pedro", number: 9, position: "CA", age: 27, goals: 15, assists: 3, yellowCards: 2, redCards: 0, minutesPlayed: 2070, rating: 8.1 },
        { name: "Everton Cebolinha", number: 11, position: "PE", age: 28, goals: 6, assists: 5, yellowCards: 1, redCards: 0, minutesPlayed: 1620, rating: 7.4 },
      ],
      subs: [
        { name: "Matheus Cunha", number: 22, position: "GOL", age: 24, goals: 0, assists: 0, yellowCards: 0, redCards: 0, minutesPlayed: 180, rating: 6.5 },
        { name: "Varela", number: 13, position: "LD", age: 30, goals: 0, assists: 2, yellowCards: 2, redCards: 0, minutesPlayed: 540, rating: 6.8 },
        { name: "Bruno Henrique", number: 27, position: "ATA", age: 33, goals: 4, assists: 2, yellowCards: 3, redCards: 1, minutesPlayed: 900, rating: 7.0 },
        { name: "Lorran", number: 19, position: "MC", age: 18, goals: 1, assists: 2, yellowCards: 0, redCards: 0, minutesPlayed: 450, rating: 6.9 },
        { name: "Allan", number: 21, position: "VOL", age: 27, goals: 0, assists: 1, yellowCards: 4, redCards: 0, minutesPlayed: 720, rating: 6.7 },
      ],
    },
    "Palmeiras": {
      formation: "4-4-2",
      coach: "Abel Ferreira",
      players: [
        { name: "Weverton", number: 21, position: "GOL", age: 37, goals: 0, assists: 0, yellowCards: 1, redCards: 0, minutesPlayed: 2520, rating: 7.5 },
        { name: "Marcos Rocha", number: 2, position: "LD", age: 35, goals: 0, assists: 3, yellowCards: 4, redCards: 0, minutesPlayed: 2070, rating: 6.9 },
        { name: "Gustavo Gómez", number: 15, position: "ZAG", age: 31, goals: 4, assists: 0, yellowCards: 5, redCards: 0, minutesPlayed: 2430, rating: 7.6 },
        { name: "Murilo", number: 26, position: "ZAG", age: 27, goals: 1, assists: 0, yellowCards: 3, redCards: 0, minutesPlayed: 2160, rating: 7.2 },
        { name: "Piquerez", number: 22, position: "LE", age: 26, goals: 1, assists: 6, yellowCards: 2, redCards: 0, minutesPlayed: 2250, rating: 7.3 },
        { name: "Zé Rafael", number: 8, position: "VOL", age: 30, goals: 2, assists: 4, yellowCards: 6, redCards: 0, minutesPlayed: 2160, rating: 7.1 },
        { name: "Raphael Veiga", number: 23, position: "MC", age: 29, goals: 10, assists: 7, yellowCards: 2, redCards: 0, minutesPlayed: 2340, rating: 7.9 },
        { name: "Estêvão", number: 41, position: "PD", age: 18, goals: 9, assists: 6, yellowCards: 1, redCards: 0, minutesPlayed: 1800, rating: 8.0 },
        { name: "Dudu", number: 7, position: "PE", age: 32, goals: 5, assists: 4, yellowCards: 1, redCards: 0, minutesPlayed: 1440, rating: 7.2 },
        { name: "Endrick", number: 9, position: "CA", age: 18, goals: 12, assists: 2, yellowCards: 1, redCards: 0, minutesPlayed: 1620, rating: 8.2 },
        { name: "Rony", number: 10, position: "CA", age: 29, goals: 7, assists: 5, yellowCards: 3, redCards: 0, minutesPlayed: 1980, rating: 7.3 },
      ],
      subs: [
        { name: "Marcelo Lomba", number: 12, position: "GOL", age: 37, goals: 0, assists: 0, yellowCards: 0, redCards: 0, minutesPlayed: 90, rating: 6.3 },
        { name: "Mayke", number: 14, position: "LD", age: 32, goals: 0, assists: 1, yellowCards: 1, redCards: 0, minutesPlayed: 450, rating: 6.6 },
        { name: "Lázaro", number: 17, position: "PE", age: 22, goals: 2, assists: 3, yellowCards: 0, redCards: 0, minutesPlayed: 630, rating: 6.8 },
        { name: "Gabriel Menino", number: 25, position: "MC", age: 24, goals: 1, assists: 2, yellowCards: 2, redCards: 0, minutesPlayed: 540, rating: 6.9 },
        { name: "Flaco López", number: 42, position: "CA", age: 24, goals: 5, assists: 1, yellowCards: 1, redCards: 0, minutesPlayed: 720, rating: 7.1 },
      ],
    },
    "Real Madrid": {
      formation: "4-3-3",
      coach: "Carlo Ancelotti",
      players: [
        { name: "Courtois", number: 1, position: "GOL", age: 32, goals: 0, assists: 0, yellowCards: 0, redCards: 0, minutesPlayed: 2520, rating: 7.8 },
        { name: "Carvajal", number: 2, position: "LD", age: 33, goals: 1, assists: 4, yellowCards: 5, redCards: 0, minutesPlayed: 2250, rating: 7.3 },
        { name: "Rüdiger", number: 22, position: "ZAG", age: 31, goals: 2, assists: 0, yellowCards: 4, redCards: 0, minutesPlayed: 2430, rating: 7.5 },
        { name: "Alaba", number: 4, position: "ZAG", age: 32, goals: 0, assists: 1, yellowCards: 2, redCards: 0, minutesPlayed: 1800, rating: 7.2 },
        { name: "Mendy", number: 23, position: "LE", age: 29, goals: 0, assists: 3, yellowCards: 3, redCards: 0, minutesPlayed: 2160, rating: 7.1 },
        { name: "Tchouaméni", number: 18, position: "VOL", age: 24, goals: 3, assists: 2, yellowCards: 5, redCards: 0, minutesPlayed: 2340, rating: 7.4 },
        { name: "Bellingham", number: 5, position: "MC", age: 21, goals: 18, assists: 8, yellowCards: 3, redCards: 0, minutesPlayed: 2520, rating: 8.5 },
        { name: "Modric", number: 10, position: "MC", age: 39, goals: 4, assists: 9, yellowCards: 2, redCards: 0, minutesPlayed: 1620, rating: 7.7 },
        { name: "Rodrygo", number: 11, position: "PD", age: 23, goals: 10, assists: 7, yellowCards: 1, redCards: 0, minutesPlayed: 2070, rating: 7.9 },
        { name: "Vinícius Jr.", number: 7, position: "PE", age: 24, goals: 20, assists: 10, yellowCards: 4, redCards: 0, minutesPlayed: 2430, rating: 8.8 },
        { name: "Mbappé", number: 9, position: "CA", age: 27, goals: 24, assists: 6, yellowCards: 1, redCards: 0, minutesPlayed: 2340, rating: 8.9 },
      ],
      subs: [
        { name: "Lunin", number: 13, position: "GOL", age: 25, goals: 0, assists: 0, yellowCards: 0, redCards: 0, minutesPlayed: 270, rating: 6.8 },
        { name: "Camavinga", number: 6, position: "MC", age: 21, goals: 2, assists: 3, yellowCards: 3, redCards: 0, minutesPlayed: 900, rating: 7.3 },
        { name: "Valverde", number: 15, position: "MC", age: 26, goals: 6, assists: 5, yellowCards: 4, redCards: 0, minutesPlayed: 1800, rating: 7.6 },
        { name: "Nacho", number: 6, position: "ZAG", age: 34, goals: 1, assists: 0, yellowCards: 3, redCards: 0, minutesPlayed: 630, rating: 6.9 },
        { name: "Joselu", number: 14, position: "CA", age: 34, goals: 8, assists: 1, yellowCards: 1, redCards: 0, minutesPlayed: 810, rating: 7.2 },
      ],
    },
    "Manchester City": {
      formation: "4-2-3-1",
      coach: "Pep Guardiola",
      players: [
        { name: "Ederson", number: 31, position: "GOL", age: 31, goals: 0, assists: 1, yellowCards: 1, redCards: 0, minutesPlayed: 2430, rating: 7.6 },
        { name: "Walker", number: 2, position: "LD", age: 34, goals: 0, assists: 3, yellowCards: 4, redCards: 0, minutesPlayed: 2070, rating: 7.1 },
        { name: "Dias", number: 3, position: "ZAG", age: 27, goals: 2, assists: 0, yellowCards: 3, redCards: 0, minutesPlayed: 2340, rating: 7.5 },
        { name: "Akanji", number: 25, position: "ZAG", age: 29, goals: 1, assists: 1, yellowCards: 2, redCards: 0, minutesPlayed: 2160, rating: 7.3 },
        { name: "Gvardiol", number: 24, position: "LE", age: 22, goals: 3, assists: 4, yellowCards: 3, redCards: 0, minutesPlayed: 2250, rating: 7.4 },
        { name: "Rodri", number: 16, position: "VOL", age: 28, goals: 5, assists: 7, yellowCards: 6, redCards: 0, minutesPlayed: 2430, rating: 8.2 },
        { name: "De Bruyne", number: 17, position: "MC", age: 33, goals: 8, assists: 15, yellowCards: 2, redCards: 0, minutesPlayed: 1980, rating: 8.6 },
        { name: "Bernardo Silva", number: 20, position: "PD", age: 30, goals: 7, assists: 9, yellowCards: 1, redCards: 0, minutesPlayed: 2250, rating: 7.9 },
        { name: "Foden", number: 47, position: "MC", age: 24, goals: 14, assists: 8, yellowCards: 2, redCards: 0, minutesPlayed: 2160, rating: 8.3 },
        { name: "Grealish", number: 10, position: "PE", age: 29, goals: 4, assists: 6, yellowCards: 1, redCards: 0, minutesPlayed: 1620, rating: 7.2 },
        { name: "Haaland", number: 9, position: "CA", age: 24, goals: 27, assists: 4, yellowCards: 2, redCards: 0, minutesPlayed: 2340, rating: 9.0 },
      ],
      subs: [
        { name: "Ortega", number: 18, position: "GOL", age: 31, goals: 0, assists: 0, yellowCards: 0, redCards: 0, minutesPlayed: 360, rating: 6.9 },
        { name: "Stones", number: 5, position: "ZAG", age: 30, goals: 2, assists: 1, yellowCards: 2, redCards: 0, minutesPlayed: 900, rating: 7.1 },
        { name: "Kovacic", number: 8, position: "MC", age: 30, goals: 3, assists: 2, yellowCards: 3, redCards: 0, minutesPlayed: 1080, rating: 7.0 },
        { name: "Doku", number: 11, position: "PE", age: 22, goals: 5, assists: 7, yellowCards: 1, redCards: 0, minutesPlayed: 1260, rating: 7.4 },
        { name: "Álvarez", number: 19, position: "CA", age: 24, goals: 9, assists: 5, yellowCards: 1, redCards: 0, minutesPlayed: 1350, rating: 7.5 },
      ],
    },
  };

  // Generic fallback lineup generator
  const generic = generateGenericLineup(teamName, sport);
  const known = lineups[teamName];
  if (known) {
    const lineup = { formation: known.formation, coach: known.coach, players: known.players, substitutes: known.subs };
    // Ajustar número de jogadores por esporte
    if (sport === "Basquete") {
      return { ...lineup, players: lineup.players.slice(0, 5), formation: "" };
    } else if (sport === "Vôlei") {
      return { ...lineup, players: lineup.players.slice(0, 6), formation: "" };
    } else if (sport === "Tênis") {
      return { ...lineup, players: [], formation: "", substitutes: [] };
    }
    return lineup;
  }
  return generic;
}

function generateGenericLineup(teamName: string, sport: string = "Futebol"): TeamLineup {
  const seed = teamName.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const formations = sport === "Futebol" ? ["4-3-3", "4-4-2", "3-5-2", "4-2-3-1"] : [];
  const formation = formations[seed % formations.length] || "";
  const coaches = ["Roberto Mancini", "Diego Simeone", "Thomas Tuchel", "Luis Enrique", "Marco Rose", "Xavi Hernández", "Unai Emery", "Simone Inzaghi"];
  const coach = coaches[seed % coaches.length];

  // Determine positions based on sport
  let positions: string[];
  let playerCount: number;
  let subCount: number;

  if (sport === "Basquete") {
    positions = ["Base", "Escolta", "Ala", "Ala-Pivô", "Pivô"];
    playerCount = 5;
    subCount = 5;
  } else if (sport === "Vôlei") {
    positions = ["Levantador", "Central", "Central", "Oposto", "Ponta", "Ponta"];
    playerCount = 6;
    subCount = 5;
  } else if (sport === "Tênis") {
    return { formation: "", coach: "", players: [], substitutes: [] };
  } else {
    // Futebol
    positions = ["GOL", "LD", "ZAG", "ZAG", "LE", "VOL", "MC", "MC", "PD", "CA", "PE"];
    playerCount = 11;
    subCount = 5;
  }

  const firstNames = ["Lucas", "Gabriel", "Matheus", "Rafael", "Bruno", "André", "Carlos", "Diego", "Thiago", "Felipe", "João"];
  const lastNames = ["Silva", "Santos", "Oliveira", "Souza", "Lima", "Ferreira", "Almeida", "Ribeiro", "Costa", "Rodrigues", "Pereira"];

  const r = (i: number) => ((seed * (i + 1) * 13) % 100);

  const players: Player[] = Array.from({ length: playerCount }, (_, i) => ({
    name: `${firstNames[(seed + i) % firstNames.length]} ${lastNames[(seed + i + 3) % lastNames.length]}`,
    number: i + 1,
    position: positions[i] || positions[0],
    age: 20 + (r(i) % 16),
    goals: sport === "Basquete" ? r(i) % 30 : sport === "Vôlei" ? r(i) % 15 : (positions[i]?.includes("GOL") ? 0 : r(i) % 8),
    assists: r(i + 1) % 10,
    yellowCards: sport === "Tênis" ? 0 : r(i + 2) % 7,
    redCards: sport === "Tênis" ? 0 : r(i + 3) % 2,
    minutesPlayed: sport === "Basquete" || sport === "Vôlei" ? 1800 + (r(i + 4) % 800) : 900 + (r(i + 4) % 1600),
    rating: +(6.5 + (r(i + 5) % 25) / 10).toFixed(1),
  }));

  const subs: Player[] = Array.from({ length: subCount }, (_, i) => ({
    name: `${firstNames[(seed + i + 5) % firstNames.length]} ${lastNames[(seed + i + 8) % lastNames.length]}`,
    number: playerCount + i + 1,
    position: sport === "Basquete" ? "Ala" : sport === "Vôlei" ? "Ponta" : ["GOL", "ZAG", "MC", "ATA", "PE"][i],
    age: 19 + (r(i + 20) % 17),
    goals: sport === "Basquete" ? r(i + 21) % 20 : sport === "Vôlei" ? r(i + 21) % 8 : r(i + 21) % 6,
    assists: r(i + 22) % 5,
    yellowCards: sport === "Tênis" ? 0 : r(i + 23) % 4,
    redCards: 0,
    minutesPlayed: 90 + (r(i + 24) % 900),
    rating: +(6.0 + (r(i + 25) % 25) / 10).toFixed(1),
  }));

  return { formation, coach, players, substitutes: subs };
}

function generateMatchEvents(teamA: string, teamB: string, scoreA?: number, scoreB?: number): MatchEvent[] {
  const events: MatchEvent[] = [];

  if (scoreA !== undefined && scoreB !== undefined) {
    // Generate events based on actual score
    for (let i = 0; i < scoreA; i++) {
      events.push({ minute: 15 + i * 25, type: "goal", team: "home", player: `Jogador ${teamA}` });
    }
    for (let i = 0; i < scoreB; i++) {
      events.push({ minute: 22 + i * 20, type: "goal", team: "away", player: `Jogador ${teamB}` });
    }
  }

  // Add card events
  events.push({ minute: 33, type: "yellow", team: "home", player: `Jogador ${teamA}` });
  events.push({ minute: 55, type: "yellow", team: "away", player: `Jogador ${teamB}` });
  events.push({ minute: 70, type: "substitution", team: "home", player: `Substituição ${teamA}`, detail: "Entra reserva" });
  events.push({ minute: 75, type: "substitution", team: "away", player: `Substituição ${teamB}`, detail: "Entra reserva" });

  return events.sort((a, b) => a.minute - b.minute);
}

function generateMatchStats(odds: [number, number, number]): MatchStats {
  const homeBias = odds[0] < odds[2] ? 1.1 : 0.9;
  return {
    possession: [Math.round(50 * homeBias), Math.round(50 * (2 - homeBias))],
    shots: [Math.round(14 * homeBias), Math.round(12 * (2 - homeBias))],
    shotsOnTarget: [Math.round(6 * homeBias), Math.round(5 * (2 - homeBias))],
    corners: [Math.round(6 * homeBias), Math.round(5 * (2 - homeBias))],
    fouls: [Math.round(12 * (2 - homeBias)), Math.round(14 * homeBias)],
    offsides: [Math.round(3 * homeBias), Math.round(2 * (2 - homeBias))],
    passes: [Math.round(450 * homeBias), Math.round(400 * (2 - homeBias))],
    passAccuracy: [Math.round(85 * homeBias), Math.round(82 * (2 - homeBias))],
    tackles: [Math.round(18 * (2 - homeBias)), Math.round(20 * homeBias)],
    saves: [Math.round(4 * (2 - homeBias)), Math.round(5 * homeBias)],
  };
}

function generateBasketballStats(odds: [number, number, number]): BasketballStats {
  const homeBias = odds[0] < odds[2] ? 1.1 : 0.9;
  const homeShots = Math.round(62 * homeBias);
  const awayShots = Math.round(58 * (2 - homeBias));
  return {
    fieldGoalsMade: [Math.round(homeShots * 0.42), Math.round(awayShots * 0.40)],
    fieldGoalsAttempted: [homeShots, awayShots],
    fieldGoalPercentage: [42, 40],
    threePointersMade: [Math.round(homeShots * 0.15), Math.round(awayShots * 0.14)],
    threePointersAttempted: [Math.round(homeShots * 0.35), Math.round(awayShots * 0.35)],
    threePointPercentage: [43, 40],
    freeThrowsMade: [Math.round(homeShots * 0.14), Math.round(awayShots * 0.12)],
    freeThrowsAttempted: [Math.round(homeShots * 0.16), Math.round(awayShots * 0.15)],
    freeThrowPercentage: [88, 80],
    rebounds: [Math.round(40 * homeBias), Math.round(38 * (2 - homeBias))],
    offensiveRebounds: [Math.round(12 * homeBias), Math.round(10 * (2 - homeBias))],
    defensiveRebounds: [Math.round(28 * homeBias), Math.round(28 * (2 - homeBias))],
    assists: [Math.round(24 * homeBias), Math.round(22 * (2 - homeBias))],
    fouls: [Math.round(16 * (2 - homeBias)), Math.round(18 * homeBias)],
    steals: [Math.round(8 * homeBias), Math.round(7 * (2 - homeBias))],
    blocks: [Math.round(5 * homeBias), Math.round(4 * (2 - homeBias))],
    turnovers: [Math.round(14 * (2 - homeBias)), Math.round(16 * homeBias)],
    points: [Math.round((homeShots * 0.42 * 2 + homeShots * 0.15 * 3 + homeShots * 0.14 * 1)), Math.round((awayShots * 0.40 * 2 + awayShots * 0.14 * 3 + awayShots * 0.12 * 1))],
  };
}

function generateTennisStats(odds: [number, number, number]): TennisStats {
  const firstServerAdvantage = odds[0] < odds[2] ? 1.15 : 0.85;
  return {
    aces: [Math.round(8 * firstServerAdvantage), Math.round(6 * (2 - firstServerAdvantage))],
    doubleFaults: [Math.round(2 * (2 - firstServerAdvantage)), Math.round(3 * firstServerAdvantage)],
    firstServePercentage: [Math.round(65 * firstServerAdvantage), Math.round(62 * (2 - firstServerAdvantage))],
    firstServeWinPercentage: [Math.round(72 * firstServerAdvantage), Math.round(68 * (2 - firstServerAdvantage))],
    secondServeWinPercentage: [Math.round(55 * firstServerAdvantage), Math.round(52 * (2 - firstServerAdvantage))],
    breakPointsWon: [Math.round(3 * firstServerAdvantage), Math.round(2 * (2 - firstServerAdvantage))],
    breakPointsAttempted: [Math.round(6 * firstServerAdvantage), Math.round(7 * (2 - firstServerAdvantage))],
    totalPointsWon: [Math.round(95 * firstServerAdvantage), Math.round(88 * (2 - firstServerAdvantage))],
    maxSpeed: [195 + Math.round(15 * firstServerAdvantage), 188 + Math.round(12 * (2 - firstServerAdvantage))],
    totalShots: [Math.round(156 * firstServerAdvantage), Math.round(148 * (2 - firstServerAdvantage))],
    winners: [Math.round(38 * firstServerAdvantage), Math.round(32 * (2 - firstServerAdvantage))],
    unforceErrors: [Math.round(24 * (2 - firstServerAdvantage)), Math.round(28 * firstServerAdvantage)],
    netRushes: [Math.round(18 * firstServerAdvantage), Math.round(14 * (2 - firstServerAdvantage))],
  };
}

function generateVolleyballStats(odds: [number, number, number]): VolleyballStats {
  const homeAttackAdvantage = odds[0] < odds[2] ? 1.12 : 0.88;
  return {
    aces: [Math.round(7 * homeAttackAdvantage), Math.round(5 * (2 - homeAttackAdvantage))],
    kills: [Math.round(28 * homeAttackAdvantage), Math.round(24 * (2 - homeAttackAdvantage))],
    totalAttacks: [Math.round(65 * homeAttackAdvantage), Math.round(62 * (2 - homeAttackAdvantage))],
    blockingPoints: [Math.round(6 * homeAttackAdvantage), Math.round(5 * (2 - homeAttackAdvantage))],
    digs: [Math.round(32 * (2 - homeAttackAdvantage)), Math.round(36 * homeAttackAdvantage)],
    receptions: [Math.round(28 * (2 - homeAttackAdvantage)), Math.round(32 * homeAttackAdvantage)],
    sets: [Math.round(22 * homeAttackAdvantage), Math.round(20 * (2 - homeAttackAdvantage))],
    errors: [Math.round(12 * (2 - homeAttackAdvantage)), Math.round(14 * homeAttackAdvantage)],
    points: [Math.round(65 * homeAttackAdvantage), Math.round(58 * (2 - homeAttackAdvantage))],
    setsWon: [2, 1],
  };
}

export function getMatchDetails(teamA: string, teamB: string, scoreA?: number, scoreB?: number, odds: [number, number, number] = [2, 3, 3], sport: string = "Futebol"): MatchDetails {
  const stadiums: Record<string, string> = {
    "Flamengo": "Maracanã, Rio de Janeiro",
    "Palmeiras": "Allianz Parque, São Paulo",
    "Real Madrid": "Santiago Bernabéu, Madrid",
    "Manchester City": "Etihad Stadium, Manchester",
    "Barcelona": "Camp Nou, Barcelona",
    "Arsenal": "Emirates Stadium, Londres",
    "Liverpool": "Anfield, Liverpool",
    "Chelsea": "Stamford Bridge, Londres",
    "Corinthians": "Neo Química Arena, São Paulo",
    "Inter Milan": "San Siro, Milão",
    "Bayern Munich": "Allianz Arena, Munique",
    "PSG": "Parc des Princes, Paris",
    "Benfica": "Estádio da Luz, Lisboa",
  };

  const matchDetails: MatchDetails = {
    stadium: stadiums[teamA] || "Estádio Nacional",
    referee: "Wilton Pereira Sampaio",
    weather: "Parcialmente nublado",
    temperature: "24°C",
    attendance: `${Math.floor(30000 + Math.random() * 40000).toLocaleString("pt-BR")}`,
    homeLineup: generateLineup(teamA, sport),
    awayLineup: generateLineup(teamB, sport),
    events: generateMatchEvents(teamA, teamB, scoreA, scoreB),
    stats: generateMatchStats(odds),
  };

  // Generate sport-specific stats
  if (sport === "Basquete") {
    matchDetails.basketballStats = generateBasketballStats(odds);
  } else if (sport === "Tênis") {
    matchDetails.tennisStats = generateTennisStats(odds);
  } else if (sport === "Vôlei") {
    matchDetails.volleyballStats = generateVolleyballStats(odds);
  }

  return matchDetails;
}
