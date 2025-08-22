import { Request, Response } from 'express';

import { useBallDontLieApi } from '@api';
import { localCache } from '@cache';
import { getPlayerGamesWithData } from '@controllers/player/helpers';
import { getStatPerGameTotal } from '@controllers/games/helpers';
import { NBAGameStatsWithTeamIds } from '@types';

const ballDontLie = useBallDontLieApi();

const getPlayer = async (req: Request, res: Response) => {
  try {
    const playerId = Number(req.params.playerId);

    const cachedPlayer = localCache.get(`player_${playerId}`);
    if (cachedPlayer) {
      return cachedPlayer;
    }

    const player = await ballDontLie.nba.getPlayer(playerId);

    localCache.set(`player_${playerId}`, player, 24 * 60 * 60 * 1000);

    return player;
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

const getPlayerSeasonStats = async (req: Request, res: Response) => {
  try {
    const playerId = Number(req.params.playerId);
    const season = Number(req.params.season);

    const cacheKey = `player_stats_${playerId}_${season}`;
    const cachedStats = localCache.get(cacheKey);
    if (cachedStats) {
      return cachedStats;
    }

    const playerGameStatsBySeason = await ballDontLie.nba.getStats({
      per_page: 82,
      player_ids: [playerId],
      seasons: [season],
    });

    const playerGameStatsBySeasonData = playerGameStatsBySeason.data as NBAGameStatsWithTeamIds[];

    const gamesPlayed = getPlayerGamesWithData({ gameStats: playerGameStatsBySeasonData }).length;

    const ppg = getStatPerGameTotal({
      gamesPlayed,
      gameStats: [playerGameStatsBySeasonData],
      stat: 'pts',
    });

    const apg = getStatPerGameTotal({
      gamesPlayed,
      gameStats: [playerGameStatsBySeasonData],
      stat: 'ast',
    });

    const rpg = getStatPerGameTotal({
      gamesPlayed,
      gameStats: [playerGameStatsBySeasonData],
      stat: 'reb',
    });

    const spg = getStatPerGameTotal({
      gamesPlayed,
      gameStats: [playerGameStatsBySeasonData],
      stat: 'stl',
    });

    const bpg = getStatPerGameTotal({
      gamesPlayed,
      gameStats: [playerGameStatsBySeasonData],
      stat: 'blk',
    });

    const topg = getStatPerGameTotal({
      gamesPlayed,
      gameStats: [playerGameStatsBySeasonData],
      stat: 'turnover',
    });

    const result = {
      data: {
        player: playerGameStatsBySeasonData[0].player,
        ppg,
        apg,
        rpg,
        spg,
        bpg,
        topg,
      },
    };

    localCache.set(cacheKey, result, 12 * 60 * 60 * 1000);

    return result;
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export { getPlayer, getPlayerSeasonStats };
