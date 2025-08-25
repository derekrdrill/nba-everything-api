import { Request, Response } from 'express';
import { useBallDontLieApi, useSportsDataIOApi } from '@api';
import { localCache } from '@cache';
import { ApiResponse, NBAGame } from '@balldontlie/sdk';
import { getGamesWithData, getStatPerGameTotal } from '@controllers/games/helpers';
import { RateLimiter } from '@utils/rateLimiter';
import { getPlayerGameStatsByTeamAndSeason } from '@data/services';

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

const getGamesByTeamAndSeason = async (req: Request, res: Response) => {
  const teamId = Number(req.params.teamId);
  const season = Number(req.params.season);

  try {
    const cacheKey = `games_${teamId}_${season}`;
    const cachedGames = localCache.get(cacheKey);
    if (cachedGames) {
      return cachedGames;
    }

    const [allGamesFromBallDontLie, sportsDataIOTeam, mongoDBPlayerStats] = await Promise.all([
      await rateLimiter.enqueue(() =>
        ballDontLie.nba.getGames({
          per_page: 82,
          seasons: [season],
          team_ids: [teamId],
        }),
      ),
      useSportsDataIOApi.getTeams(),
      await getPlayerGameStatsByTeamAndSeason({
        season,
        teamId,
      }),
    ]);

    const allGamesFromBallDontLieWithData = getGamesWithData({
      games: allGamesFromBallDontLie.data,
    });

    const mongoDBPlayerStatsGamesOnly = mongoDBPlayerStats
      .map((stat) => stat.game)
      .sort((a, b) => (a.date > b.date ? -1 : 1));
    const mongoDBPlayerStatsGamesOnlyMap = new Map();

    mongoDBPlayerStatsGamesOnly.forEach((game) => {
      const gameId = game.id;
      if (!mongoDBPlayerStatsGamesOnlyMap.has(gameId)) {
        mongoDBPlayerStatsGamesOnlyMap.set(gameId, game);
      }
    });

    const mongoDBPlayerStatsGamesOnlyNoDups: (NBAGame & {
      home_team_id: number;
      visitor_team_id: number;
    })[] = Array.from(mongoDBPlayerStatsGamesOnlyMap.values());

    const allGamesWithWins = allGamesFromBallDontLieWithData
      .map((game) => {
        const { home_team, home_team_score, visitor_team, visitor_team_score } = game;

        if (home_team.id === teamId) {
          return { ...game, ...{ win: home_team_score > visitor_team_score } };
        } else if (visitor_team.id === teamId) {
          return { ...game, ...{ win: home_team_score < visitor_team_score } };
        }
      })
      .filter((game): game is NBAGame & { win: boolean } => game !== undefined); // Filter out undefined values

    const totalWins = allGamesWithWins.filter((game) => game?.win).length;
    const totalLosses = allGamesWithWins.filter((game) => !game?.win).length;
    const gameIds = mongoDBPlayerStatsGamesOnlyNoDups.map((game) => game.id);
    const gamePlayerStatsByTeam = mongoDBPlayerStats.filter((stat) => stat.team.id === teamId);

    const gamePlayerStatsResults = gameIds.map((gameId) =>
      gamePlayerStatsByTeam.filter((stat) => stat.game.id === gameId),
    );

    const gameDataWithWinsAndLogo = mongoDBPlayerStatsGamesOnlyNoDups.map((game) => {
      const { home_team_id, home_team_score, visitor_team_id, visitor_team_score } = game;

      const home_team = allGamesWithWins.find(
        (game) => game?.home_team.id === home_team_id,
      )?.home_team;
      const visitor_team = allGamesWithWins.find(
        (game) => game?.visitor_team.id === visitor_team_id,
      )?.visitor_team;

      const homeTeamWithLogo = {
        ...home_team,
        logo: sportsDataIOTeam.find((team) => team?.Key === home_team?.abbreviation)
          ?.WikipediaLogoUrl,
      };

      const visitorTeamWithLogo = {
        ...visitor_team,
        logo: sportsDataIOTeam.find((team) => team?.Key === visitor_team?.abbreviation)
          ?.WikipediaLogoUrl,
      };

      if (home_team_id === teamId) {
        return {
          ...game,
          ...{ win: home_team_score > visitor_team_score },
          ...{
            home_team: homeTeamWithLogo,
            visitor_team: visitorTeamWithLogo,
          },
        };
      } else if (visitor_team_id === teamId) {
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

    const gamesPlayed = mongoDBPlayerStatsGamesOnlyNoDups.length;

    const ppg =
      allGamesFromBallDontLieWithData
        .filter((game) => game.home_team.id === teamId || game.visitor_team.id === teamId)
        .map((game) =>
          game.home_team.id === teamId ? game.home_team_score : game.visitor_team_score,
        )
        .reduce((accumulator, currentValue) => accumulator + currentValue, 0) /
      allGamesFromBallDontLieWithData.length;

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
    };

    const result = { data: gamesData };

    localCache.set(cacheKey, result, 12 * 60 * 60 * 1000);

    return result;
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export { getGamesByTeam, getGamesByTeamAndSeason };
