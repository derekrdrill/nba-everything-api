import { Request, Response } from 'express';
import { useBallDontLieApi, useSportsDataIOApi } from '@api';
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

    const sportsDataIOTeam = await useSportsDataIOApi.getTeams();

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

    const gameDataWithWinsAndLogo = gamesWithData.map((game) => {
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

    const wins = gameDataWithWinsAndLogo.filter((game) => game?.win).length;
    const losses = gameDataWithWinsAndLogo.filter((game) => !game?.win).length;

    const gamesData = { gameData: gameDataWithWinsAndLogo, ppg, rpg, apg, spg, bpg, wins, losses };

    return { data: gamesData };
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export { getGamesByTeam, getGamesByTeamAndSeason };
