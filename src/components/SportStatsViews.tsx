import { StatBar } from "./StatBars";
import { type BasketballStats, type TennisStats, type VolleyballStats, type MatchStats } from "@/data/matchDetails";

/** Section header used inside stat views */
const StatSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <div className="flex items-center gap-2 mb-1 mt-2 first:mt-0">
      <div className="w-1 h-4 rounded-full bg-primary/60" />
      <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{title}</h4>
    </div>
    <div className="divide-y divide-border/30">
      {children}
    </div>
  </div>
);

/* ════════════════════════════════ FOOTBALL STATS ════════════════════════════════ */
export const FootballStatsView = ({ teamA, teamB, stats }: { teamA: string; teamB: string; stats: MatchStats }) => (
  <div className="space-y-2">
    <StatSection title="Ataque">
      <StatBar label="Posse de Bola" home={stats.possession[0]} away={stats.possession[1]} unit="%" />
      <StatBar label="Finalizações" home={stats.shots[0]} away={stats.shots[1]} />
      <StatBar label="Chutes no Alvo" home={stats.shotsOnTarget[0]} away={stats.shotsOnTarget[1]} />
    </StatSection>
    <StatSection title="Passes">
      <StatBar label="Passes Totais" home={stats.passes[0]} away={stats.passes[1]} />
      <StatBar label="Precisão de Passe" home={stats.passAccuracy[0]} away={stats.passAccuracy[1]} unit="%" />
    </StatSection>
    <StatSection title="Defesa e Disciplina">
      <StatBar label="Desarmes" home={stats.tackles[0]} away={stats.tackles[1]} />
      <StatBar label="Faltas" home={stats.fouls[0]} away={stats.fouls[1]} />
      <StatBar label="Impedimentos" home={stats.offsides[0]} away={stats.offsides[1]} />
      <StatBar label="Defesas do Goleiro" home={stats.saves[0]} away={stats.saves[1]} />
    </StatSection>
    <StatSection title="Outros">
      <StatBar label="Escanteios" home={stats.corners[0]} away={stats.corners[1]} />
    </StatSection>
  </div>
);

/* ════════════════════════════════ BASKETBALL STATS ════════════════════════════════ */
export const BasketballStatsView = ({ teamA, teamB, stats }: { teamA: string; teamB: string; stats: BasketballStats }) => (
  <div className="space-y-2">
    <StatSection title="Pontuação">
      <StatBar label="Pontos" home={stats.points[0]} away={stats.points[1]} />
      <StatBar label="Assistências" home={stats.assists[0]} away={stats.assists[1]} />
    </StatSection>
    <StatSection title="Arremessos de Campo">
      <StatBar label="FG Convertidos" home={stats.fieldGoalsMade[0]} away={stats.fieldGoalsMade[1]} />
      <StatBar label="FG Tentados" home={stats.fieldGoalsAttempted[0]} away={stats.fieldGoalsAttempted[1]} />
      <StatBar label="FG %" home={stats.fieldGoalPercentage[0]} away={stats.fieldGoalPercentage[1]} unit="%" />
    </StatSection>
    <StatSection title="Arremessos de 3 Pontos">
      <StatBar label="3P Convertidos" home={stats.threePointersMade[0]} away={stats.threePointersMade[1]} />
      <StatBar label="3P Tentados" home={stats.threePointersAttempted[0]} away={stats.threePointersAttempted[1]} />
      <StatBar label="3P %" home={stats.threePointPercentage[0]} away={stats.threePointPercentage[1]} unit="%" />
    </StatSection>
    <StatSection title="Lances Livres">
      <StatBar label="LL Convertidos" home={stats.freeThrowsMade[0]} away={stats.freeThrowsMade[1]} />
      <StatBar label="LL Tentados" home={stats.freeThrowsAttempted[0]} away={stats.freeThrowsAttempted[1]} />
      <StatBar label="LL %" home={stats.freeThrowPercentage[0]} away={stats.freeThrowPercentage[1]} unit="%" />
    </StatSection>
    <StatSection title="Rebotes">
      <StatBar label="Rebotes Totais" home={stats.rebounds[0]} away={stats.rebounds[1]} />
      <StatBar label="Ofensivos" home={stats.offensiveRebounds[0]} away={stats.offensiveRebounds[1]} />
      <StatBar label="Defensivos" home={stats.defensiveRebounds[0]} away={stats.defensiveRebounds[1]} />
    </StatSection>
    <StatSection title="Defesa e Erros">
      <StatBar label="Roubos de Bola" home={stats.steals[0]} away={stats.steals[1]} />
      <StatBar label="Bloqueios" home={stats.blocks[0]} away={stats.blocks[1]} />
      <StatBar label="Turnovers" home={stats.turnovers[0]} away={stats.turnovers[1]} />
      <StatBar label="Faltas Pessoais" home={stats.fouls[0]} away={stats.fouls[1]} />
    </StatSection>
  </div>
);

/* ════════════════════════════════ TENNIS STATS ════════════════════════════════ */
export const TennisStatsView = ({ teamA, teamB, stats }: { teamA: string; teamB: string; stats: TennisStats }) => (
  <div className="space-y-2">
    <StatSection title="Saque">
      <StatBar label="Aces" home={stats.aces[0]} away={stats.aces[1]} />
      <StatBar label="Duplas Faltas" home={stats.doubleFaults[0]} away={stats.doubleFaults[1]} />
      <StatBar label="1º Saque %" home={stats.firstServePercentage[0]} away={stats.firstServePercentage[1]} unit="%" />
      <StatBar label="Pontos c/ 1º Saque" home={stats.firstServeWinPercentage[0]} away={stats.firstServeWinPercentage[1]} unit="%" />
      <StatBar label="Pontos c/ 2º Saque" home={stats.secondServeWinPercentage[0]} away={stats.secondServeWinPercentage[1]} unit="%" />
      <StatBar label="Veloc. Máx. (km/h)" home={stats.maxSpeed[0]} away={stats.maxSpeed[1]} />
    </StatSection>
    <StatSection title="Break Points">
      <StatBar label="Conquistados" home={stats.breakPointsWon[0]} away={stats.breakPointsWon[1]} />
      <StatBar label="Oportunidades" home={stats.breakPointsAttempted[0]} away={stats.breakPointsAttempted[1]} />
    </StatSection>
    <StatSection title="Geral">
      <StatBar label="Pontos Ganhos" home={stats.totalPointsWon[0]} away={stats.totalPointsWon[1]} />
      <StatBar label="Vencedoras" home={stats.winners[0]} away={stats.winners[1]} />
      <StatBar label="Erros Não Forçados" home={stats.unforceErrors[0]} away={stats.unforceErrors[1]} />
      <StatBar label="Total de Shots" home={stats.totalShots[0]} away={stats.totalShots[1]} />
      <StatBar label="Ida à Rede" home={stats.netRushes[0]} away={stats.netRushes[1]} />
    </StatSection>
  </div>
);

/* ════════════════════════════════ VOLLEYBALL STATS ════════════════════════════════ */
export const VolleyballStatsView = ({ teamA, teamB, stats }: { teamA: string; teamB: string; stats: VolleyballStats }) => (
  <div className="space-y-2">
    <StatSection title="Resultado">
      <StatBar label="Pontos" home={stats.points[0]} away={stats.points[1]} />
      <StatBar label="Sets Vencidos" home={stats.setsWon[0]} away={stats.setsWon[1]} />
    </StatSection>
    <StatSection title="Ataque">
      <StatBar label="Kills" home={stats.kills[0]} away={stats.kills[1]} />
      <StatBar label="Ataques Tentados" home={stats.totalAttacks[0]} away={stats.totalAttacks[1]} />
      <StatBar label="Aces" home={stats.aces[0]} away={stats.aces[1]} />
    </StatSection>
    <StatSection title="Defesa">
      <StatBar label="Defesas (Digs)" home={stats.digs[0]} away={stats.digs[1]} />
      <StatBar label="Bloqueios" home={stats.blockingPoints[0]} away={stats.blockingPoints[1]} />
    </StatSection>
    <StatSection title="Construção">
      <StatBar label="Recepções" home={stats.receptions[0]} away={stats.receptions[1]} />
      <StatBar label="Levantamentos" home={stats.sets[0]} away={stats.sets[1]} />
      <StatBar label="Erros" home={stats.errors[0]} away={stats.errors[1]} />
    </StatSection>
  </div>
);
