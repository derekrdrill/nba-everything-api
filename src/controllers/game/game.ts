import { Request, Response } from 'express';
import { useBallDontLieApi, useGameSummary, useSportsDataIOApi } from '@api';
import { localCache } from '@cache';
import {
  getGameBoxScore,
  getGameStatsById,
  getGameStatLeadersByTeam,
  getEnhancedStatLeaders,
} from '@controllers/game/helpers';
import { getPlayerGameStatsByGameId, getPlayerHeadshots } from '@data/services';
import { NBAGameWithTeamIds } from '@types';

const ballDontLie = useBallDontLieApi();

const getGame = async (req: Request, res: Response) => {
  const gameId = Number(req.params.gameId);

  try {
    const cachedGame = localCache.get(`game_${gameId}`);
    if (cachedGame) {
      return cachedGame;
    }

    const [gameStatsFromMongoDB, playerHeadshots, sportsDataIOTeam] = await Promise.all([
      getPlayerGameStatsByGameId({ gameId }),
      getPlayerHeadshots(),
      useSportsDataIOApi.getTeams(),
    ]);

    const homeTeamGame = gameStatsFromMongoDB[0].game as NBAGameWithTeamIds;
    const visitorTeamGame = gameStatsFromMongoDB[0].game as NBAGameWithTeamIds;
    const homeTeamID = homeTeamGame.home_team_id;
    const visitorTeamID = visitorTeamGame.visitor_team_id;

    const homeTeamStats = getGameStatsById({ gameId: homeTeamID, gameStats: gameStatsFromMongoDB });
    const visitorTeamStats = getGameStatsById({
      gameId: visitorTeamID,
      gameStats: gameStatsFromMongoDB,
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

    const homeTeamStatLeadersWithHeadshots = getEnhancedStatLeaders({
      playerHeadshots,
      statLeaders: homeTeamStatLeaders,
    });

    const visitorTeamStatLeadersWithHeadshots = getEnhancedStatLeaders({
      playerHeadshots,
      statLeaders: visitorTeamStatLeaders,
    });

    const gameData = {
      homeTeam: {
        abbrName: homeTeamStats[0].team.abbreviation,
        boxScoreData: homeTeamBoxScore,
        boxScoreDataShort: homeTeamBoxScoreShort,
        fullName: homeTeamStats[0].team.full_name,
        locale: 'home',
        logo: homeLogo,
        score: homeTeamStats[0].game.home_team_score,
        statLeaders: homeTeamStatLeadersWithHeadshots,
      },
      visitorTeam: {
        abbrName: visitorTeamStats[0].team.abbreviation,
        boxScoreData: visitorTeamBoxScore,
        boxScoreDataShort: visitorTeamBoxScoreShort,
        fullName: visitorTeamStats[0].team.full_name,
        locale: 'vistor',
        logo: visitorLogo,
        score: visitorTeamStats[0].game.visitor_team_score,
        statLeaders: visitorTeamStatLeadersWithHeadshots,
      },
    };

    const gameSummaryGameData = {
      homeTeam: {
        abbrName: gameData.homeTeam.abbrName,
        boxScoreData: gameData.homeTeam.boxScoreDataShort,
        fullName: gameData.homeTeam.fullName,
        score: gameData.homeTeam.score,
        statLeaders: gameData.homeTeam.statLeaders,
      },
      visitorTeam: {
        abbrName: gameData.visitorTeam.abbrName,
        boxScoreData: gameData.visitorTeam.boxScoreDataShort,
        fullName: gameData.visitorTeam.fullName,
        score: gameData.visitorTeam.score,
        statLeaders: gameData.visitorTeam.statLeaders,
      },
    };

    const gameSummary = await useGameSummary({
      gameId: gameId.toString(),
      gameData: JSON.stringify(gameSummaryGameData),
    });

    const result = {
      data: {
        ...gameData,
        gameSummary,
      },
    };

    localCache.set(`game_${gameId}`, result, 24 * 60 * 60 * 1000);

    return result;
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export { getGame };
