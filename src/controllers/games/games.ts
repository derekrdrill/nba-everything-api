import { Request, Response } from 'express';
import { useBallDontLieApi, useSportsDataIOApi } from '@api';
import { ApiResponse, NBAGame } from '@balldontlie/sdk';
import { getGamesWithData, getStatPerGameTotal } from '@controllers/games/helpers';
import { RateLimiter } from '@utils/rateLimiter';

const ballDontLie = useBallDontLieApi();
const rateLimiter = new RateLimiter(55); // Set slightly below the 60 requests/minute limit

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
    const paginatedGames: ApiResponse<NBAGame[]> = await rateLimiter.enqueue(() =>
      ballDontLie.nba.getGames({
        per_page: perPage,
        cursor,
        seasons: [season],
        team_ids: [teamId],
      }),
    );

    const paginatedGamesWithData = getGamesWithData({
      games: paginatedGames.data,
    });

    // Get all games for the season to calculate accurate W-L record
    const allGames: ApiResponse<NBAGame[]> = await rateLimiter.enqueue(() =>
      ballDontLie.nba.getGames({
        per_page: 82, // Get all games for the season
        seasons: [season],
        team_ids: [teamId],
      }),
    );

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

    // Batch game IDs for stats request
    const gameIds = paginatedGamesWithData
      .filter((game): game is NonNullable<typeof game> => game?.id !== undefined)
      .map((game) => game.id);

    // Get stats for all games in one request
    const gamePlayerStats = await rateLimiter.enqueue(() =>
      ballDontLie.nba.getStats({
        game_ids: gameIds,
        per_page: 50 * gameIds.length, // Request all stats for all games
      }),
    );

    const gamePlayerStatsByTeam = gamePlayerStats.data.filter((stat) => stat.team.id === teamId);

    // Group stats by game
    const gamePlayerStatsResults = gameIds.map((gameId) =>
      gamePlayerStatsByTeam.filter((stat) => stat.game.id === gameId),
    );

    const sportsDataIOTeam = await useSportsDataIOApi.getTeams();

    const gameDataWithWinsAndLogo = paginatedGamesWithData.map((game) => {
      const { home_team, home_team_score, visitor_team, visitor_team_score } = game;

      const homeTeamWithLogo = {
        ...home_team,
        logo: sportsDataIOTeam.find((team) => team?.Key === home_team.abbreviation)
          ?.WikipediaLogoUrl,
      };

      const visitorTeamWithLogo = {
        ...visitor_team,
        logo: sportsDataIOTeam.find((team) => team?.Key === visitor_team.abbreviation)
          ?.WikipediaLogoUrl,
      };

      if (home_team.id === teamId) {
        return {
          ...game,
          ...{ win: home_team_score > visitor_team_score },
          ...{
            home_team: homeTeamWithLogo,
            visitor_team: visitorTeamWithLogo,
          },
        };
      } else if (visitor_team.id === teamId) {
        return {
          ...game,
          ...{ win: home_team_score < visitor_team_score },
          ...{
            home_team: homeTeamWithLogo,
            visitor_team: visitorTeamWithLogo,
          },
        };
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
      gameData: gameDataWithWinsAndLogo,
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
