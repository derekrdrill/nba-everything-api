import { NBAStats } from '@balldontlie/sdk';
import { NBAGameStatsWithTeamIds } from '@types';

const getStatPerGameTotal = ({
  gamesPlayed,
  gameStats,
  stat,
}: {
  gamesPlayed: number;
  gameStats: (NBAStats[] | undefined)[] | NBAGameStatsWithTeamIds[][];
  stat: keyof NBAStats;
}) => {
  const statTotal = gameStats
    ?.map((game) =>
      game?.map((gameStat) => gameStat[stat]).reduce((a, b) => Number(a) + Number(b), 0),
    )
    .reduce((a, b) => Number(a) + Number(b), 0) as number;

  const perGameStat = statTotal / gamesPlayed;

  return perGameStat;
};

export { getStatPerGameTotal };
