import { NBAStats } from '@balldontlie/sdk';

const getPlayerGamesWithData = ({ gameStats }: { gameStats: NBAStats[] }) => {
  return gameStats.filter((game) => Number(game.min));
};

export { getPlayerGamesWithData };
