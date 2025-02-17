import { Request, Response } from 'express';
import { useBallDontLieApi } from '@api';
import { ApiResponse, NBAGame } from '@balldontlie/sdk';
import { getGamesWithData, getStatPerGameTotal } from '@controllers/games/helpers';

const ballDontLie = useBallDontLieApi();

const getGamesByTeam = async (req: Request, res: Response) => {
  const teamId = Number(req.params.teamId);

  try {
    const games: ApiResponse<NBAGame[]> = await ballDontLie.nba.getGames({
      per_page: 82,
      team_ids: [teamId],
    });

    return games;
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

const getGamesByTeamAndSeason = async (req: Request, res: Response) => {
  const teamId = Number(req.params.teamId);
  const season = Number(req.params.season);

  try {
    const games: ApiResponse<NBAGame[]> = await ballDontLie.nba.getGames({
      per_page: 82,
      seasons: [season],
      team_ids: [teamId],
    });

    const gamesWithData = getGamesWithData({
      games: games.data,
    });

    const gamePlayerStatsPromises = gamesWithData.map(async (game) => {
      if (game?.id) {
        const gamePlayerStats = await ballDontLie.nba.getStats({
          game_ids: [game.id],
          per_page: 50,
        });

        const gamePlayerStatsByTeam = gamePlayerStats.data.filter(
          (stat) => stat.team.id === teamId,
        );

        return gamePlayerStatsByTeam;
      }
    });

    const gamePlayerStatsResults = await Promise.all(gamePlayerStatsPromises);

    const gameDataWithWins = gamesWithData.map((game) => {
      const { home_team, home_team_score, visitor_team, visitor_team_score } = game;

      if (home_team.id === teamId) {
        return { ...game, ...{ win: home_team_score > visitor_team_score } };
      } else if (visitor_team.id === teamId) {
        return { ...game, ...{ win: home_team_score < visitor_team_score } };
      }
    });

    const gamesPlayed = gamesWithData.length;

    const ppg = getStatPerGameTotal({
      gamesPlayed,
      gameStats: gamePlayerStatsResults,
      stat: 'pts',
    });

    const rpg = getStatPerGameTotal({
      gamesPlayed,
      gameStats: gamePlayerStatsResults,
      stat: 'reb',
    });

    const apg = getStatPerGameTotal({
      gamesPlayed,
      gameStats: gamePlayerStatsResults,
      stat: 'ast',
    });

    const spg = getStatPerGameTotal({
      gamesPlayed,
      gameStats: gamePlayerStatsResults,
      stat: 'stl',
    });

    const bpg = getStatPerGameTotal({
      gamesPlayed,
      gameStats: gamePlayerStatsResults,
      stat: 'blk',
    });

    const wins = gameDataWithWins.filter((game) => game?.win).length;
    const losses = gameDataWithWins.filter((game) => !game?.win).length;

    const gamesData = { gameData: gameDataWithWins, ppg, rpg, apg, spg, bpg, wins, losses };

    return { data: gamesData };
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export { getGamesByTeam, getGamesByTeamAndSeason };
