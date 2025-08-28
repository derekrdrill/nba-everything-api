import { NBAStats } from '@balldontlie/sdk';
import { NBAGameStatsWithTeamIds, NBAPlayerStatValue } from '@types';

const getStatPerGameTotal = ({
  gamesPlayed,
  gameStats,
  isTotal,
  stat,
}: {
  gamesPlayed: number;
  gameStats: (NBAStats[] | undefined)[] | NBAGameStatsWithTeamIds[][];
  isTotal?: boolean;
  stat: keyof NBAStats;
}): NBAPlayerStatValue => {
  const statTotal = gameStats
    ?.map((game) =>
      game?.map((gameStat) => gameStat[stat]).reduce((a, b) => Number(a) + Number(b), 0),
    )
    .reduce((a, b) => Number(a) + Number(b), 0) as number;

  const perGameStat = isTotal ? Number(statTotal) : Number(statTotal) / gamesPlayed;

  if (isNaN(perGameStat)) {
    return 'DNP';
  }

  return perGameStat;
};

export { getStatPerGameTotal };
