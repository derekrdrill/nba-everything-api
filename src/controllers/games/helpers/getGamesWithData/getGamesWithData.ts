import { NBAGame } from '@balldontlie/sdk';

const getGamesWithData = ({ games }: { games: NBAGame[] }) => {
  return games.filter((game) => game.home_team_score && game.visitor_team_score);
};

export { getGamesWithData };
