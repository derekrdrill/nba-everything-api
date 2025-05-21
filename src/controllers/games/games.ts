import { Request, Response } from 'express';
import { useBallDontLieApi } from '@api';
import { ApiResponse, NBAGame } from '@balldontlie/sdk';
import { getGamesWithData, getStatPerGameTotal } from '@controllers/games/helpers';

const ballDontLie = useBallDontLieApi();

interface PaginationParams {
  perPage: number;
  cursor?: number;
}

const getGamesByTeam = async (req: Request, res: Response, pagination: PaginationParams) => {
  const teamId = Number(req.params.teamId);
  const { perPage, cursor } = pagination;

  try {
    const games: ApiResponse<NBAGame[]> = await ballDontLie.nba.getGames({
      per_page: perPage,
      cursor,
      team_ids: [teamId],
    });

    return games;
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

const getGamesByTeamAndSeason = async (
  req: Request,
  res: Response,
  pagination: PaginationParams,
) => {
  const teamId = Number(req.params.teamId);
  const season = Number(req.params.season);
  const { perPage, cursor } = pagination;

  try {
    // Get paginated games for display
    const paginatedGames: ApiResponse<NBAGame[]> = await ballDontLie.nba.getGames({
      per_page: perPage,
      cursor,
      seasons: [season],
      team_ids: [teamId],
    });

    const paginatedGamesWithData = getGamesWithData({
      games: paginatedGames.data,
    });

    // Get all games for the season to calculate accurate W-L record
    const allGames: ApiResponse<NBAGame[]> = await ballDontLie.nba.getGames({
      per_page: 82, // Get all games for the season
      seasons: [season],
      team_ids: [teamId],
    });

    const allGamesWithData = getGamesWithData({
      games: allGames.data,
    });

    // Calculate W-L record from all games
    const allGamesWithWins = allGamesWithData.map((game) => {
      const { home_team, home_team_score, visitor_team, visitor_team_score } = game;

      if (home_team.id === teamId) {
        return { ...game, ...{ win: home_team_score > visitor_team_score } };
      } else if (visitor_team.id === teamId) {
        return { ...game, ...{ win: home_team_score < visitor_team_score } };
      }
    });

    const totalWins = allGamesWithWins.filter((game) => game?.win).length;
    const totalLosses = allGamesWithWins.filter((game) => !game?.win).length;

    // Get stats for the current page of games only
    const gamePlayerStatsPromises = paginatedGamesWithData.map(async (game) => {
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

    const gameDataWithWins = paginatedGamesWithData.map((game) => {
      const { home_team, home_team_score, visitor_team, visitor_team_score } = game;

      if (home_team.id === teamId) {
        return { ...game, ...{ win: home_team_score > visitor_team_score } };
      } else if (visitor_team.id === teamId) {
        return { ...game, ...{ win: home_team_score < visitor_team_score } };
      }
    });

    // Calculate stats for the current page only
    const gamesPlayed = paginatedGamesWithData.length;

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

    const gamesData = {
      gameData: gameDataWithWins,
      ppg,
      rpg,
      apg,
      spg,
      bpg,
      wins: totalWins,
      losses: totalLosses,
      pagination: {
        perPage,
        totalGames: allGamesWithData.length,
        nextCursor: paginatedGames.meta?.next_cursor,
      },
    };

    return { data: gamesData };
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export { getGamesByTeam, getGamesByTeamAndSeason };
