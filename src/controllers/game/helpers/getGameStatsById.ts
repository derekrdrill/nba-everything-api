import { NBAStats } from '@balldontlie/sdk';

const getGameStatsById = ({ gameId, gameStats }: { gameId: number; gameStats: NBAStats[] }) => {
  return gameStats.filter((stat) => stat.team.id === gameId);
};

export { getGameStatsById };
