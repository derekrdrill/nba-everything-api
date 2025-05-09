import { Request, Response } from 'express';
import { ApiResponse, NBAStats } from '@balldontlie/sdk';
import { useBallDontLieApi, useSportsDataIOApi } from '@api';
import {
  getGameBoxScore,
  getGameStatsById,
  getGameStatLeadersByTeam,
} from '@controllers/game/helpers';
import { NBAGameWithTeamIds } from '@types';

const ballDontLie = useBallDontLieApi();

const getGame = async (req: Request, res: Response) => {
  const gameId = Number(req.params.gameId);

  try {
    const ballDontLieGameStats: ApiResponse<NBAStats[]> = await ballDontLie.nba.getStats({
      game_ids: [gameId],
      per_page: 50,
    });

    const sportsDataIOTeam = await useSportsDataIOApi.getTeams();

    const gameStatsFull = ballDontLieGameStats.data;
    const homeTeamGame = gameStatsFull[0].game as NBAGameWithTeamIds;
    const visitorTeamGame = gameStatsFull[0].game as NBAGameWithTeamIds;
    const homeTeamID = homeTeamGame.home_team_id;
    const visitorTeamID = visitorTeamGame.visitor_team_id;

    const homeTeamStats = getGameStatsById({ gameId: homeTeamID, gameStats: gameStatsFull });
    const visitorTeamStats = getGameStatsById({
      gameId: visitorTeamID,
      gameStats: gameStatsFull,
    });
    const homeTeamBoxScore = getGameBoxScore({ load: 'full', teamData: homeTeamStats });
    const homeTeamBoxScoreShort = getGameBoxScore({ load: 'lite', teamData: homeTeamStats });
    const visitorTeamBoxScore = getGameBoxScore({ load: 'full', teamData: visitorTeamStats });
    const visitorTeamBoxScoreShort = getGameBoxScore({ load: 'lite', teamData: visitorTeamStats });

    const statLeadersByTeam = getGameStatLeadersByTeam({
      homeTeamStats,
      visitorTeamStats,
    });
    const homeTeamStatLeaders = statLeadersByTeam.homeStatLeaders;
    const visitorTeamStatLeaders = statLeadersByTeam.visitorStatLeaders;
    const homeLogo = sportsDataIOTeam.find(
      (team) => team?.Key === homeTeamStats[0].team.abbreviation,
    )?.WikipediaLogoUrl;

    const visitorLogo = sportsDataIOTeam.find(
      (team) => team?.Key === visitorTeamStats[0].team.abbreviation,
    )?.WikipediaLogoUrl;

    const gameData = {
      homeTeam: {
        abbrName: homeTeamStats[0].team.abbreviation,
        boxScoreData: homeTeamBoxScore,
        boxScoreDataShort: homeTeamBoxScoreShort,
        fullName: homeTeamStats[0].team.full_name,
        locale: 'home',
        logo: homeLogo,
        score: homeTeamStats[0].game.home_team_score,
        statLeaders: homeTeamStatLeaders,
      },
      visitorTeam: {
        abbrName: visitorTeamStats[0].team.abbreviation,
        boxScoreData: visitorTeamBoxScore,
        boxScoreDataShort: visitorTeamBoxScoreShort,
        fullName: visitorTeamStats[0].team.full_name,
        locale: 'vistor',
        logo: visitorLogo,
        score: visitorTeamStats[0].game.visitor_team_score,
        statLeaders: visitorTeamStatLeaders,
      },
    };

    return { data: gameData };
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export { getGame };
