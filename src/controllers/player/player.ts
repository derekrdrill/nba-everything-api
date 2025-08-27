import { Request, Response } from 'express';

import { useBallDontLieApi } from '@api';
import { localCache } from '@cache';
import { getPlayerGamesWithData } from '@controllers/player/helpers';
import { getStatPerGameTotal } from '@controllers/games/helpers';
import { getPlayerGameStatsByTeamAndSeason } from '@data/services';
import { NBAGameStatsWithTeamIds, NBAPlayerStat } from '@types';

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

const getPlayerStatsByTeamAndSeason = async (
  req: Request,
  res: Response,
): Promise<
  | {
      data: NBAPlayerStat[];
    }
  | undefined
> => {
  try {
    const season = Number(req.params.season);
    const teamId = Number(req.params.teamId);
    let playerStatsReturn: NBAPlayerStat[] = [];

    const playerGameStats = await getPlayerGameStatsByTeamAndSeason({
      season,
      teamId,
    });

    const gameIds = playerGameStats
      .filter((playerGameStat) => !playerGameStat.game.postseason && Number(playerGameStat.min) > 0)
      .map((playerGameStat) => playerGameStat.game.id);

    const gamesPlayed = Array.from(new Set(gameIds)).length;

    const teamMin = getStatPerGameTotal({
      gamesPlayed,
      gameStats: [playerGameStats],
      isTotal: true,
      stat: 'min',
    });

    const teamFga = getStatPerGameTotal({
      gamesPlayed,
      gameStats: [playerGameStats],
      isTotal: true,
      stat: 'fga',
    });

    const teamFta = getStatPerGameTotal({
      gamesPlayed,
      gameStats: [playerGameStats],
      isTotal: true,
      stat: 'fta',
    });

    const teamTo = getStatPerGameTotal({
      gamesPlayed,
      gameStats: [playerGameStats],
      isTotal: true,
      stat: 'turnover',
    });

    const players = Array.from(
      new Map(playerGameStats.map((pgs) => [pgs.player.id, pgs.player])).values(),
    );

    players.forEach((player) => {
      const playerStats = playerGameStats.filter(
        (playerGameStat) =>
          playerGameStat.player.id === player.id &&
          !playerGameStat.game.postseason &&
          Number(playerGameStat.min) > 0,
      );
      const gameStats = [playerStats];

      const min = getStatPerGameTotal({
        gamesPlayed,
        gameStats,
        isTotal: true,
        stat: 'min',
      });

      const pts = getStatPerGameTotal({
        gamesPlayed,
        gameStats,
        isTotal: true,
        stat: 'pts',
      });

      const ppg = getStatPerGameTotal({
        gamesPlayed,
        gameStats,
        stat: 'pts',
      });
      const apg = getStatPerGameTotal({
        gamesPlayed,
        gameStats,
        stat: 'ast',
      });

      const rpg = getStatPerGameTotal({
        gamesPlayed,
        gameStats,
        stat: 'reb',
      });

      const orpg = getStatPerGameTotal({
        gamesPlayed,
        gameStats,
        stat: 'oreb',
      });

      const drpg = getStatPerGameTotal({
        gamesPlayed,
        gameStats,
        stat: 'dreb',
      });

      const spg = getStatPerGameTotal({
        gamesPlayed,
        gameStats,
        stat: 'stl',
      });

      const bpg = getStatPerGameTotal({
        gamesPlayed,
        gameStats,
        stat: 'blk',
      });

      const to = getStatPerGameTotal({
        gamesPlayed,
        gameStats,
        isTotal: true,
        stat: 'turnover',
      });

      const topg = getStatPerGameTotal({
        gamesPlayed,
        gameStats,
        stat: 'turnover',
      });

      const fgm = getStatPerGameTotal({
        gamesPlayed,
        gameStats,
        isTotal: true,
        stat: 'fgm',
      });

      const fga = getStatPerGameTotal({
        gamesPlayed,
        gameStats,
        isTotal: true,
        stat: 'fga',
      });

      const fg3m = getStatPerGameTotal({
        gamesPlayed,
        gameStats,
        isTotal: true,
        stat: 'fg3m',
      });

      const fg3a = getStatPerGameTotal({
        gamesPlayed,
        gameStats,
        isTotal: true,
        stat: 'fg3a',
      });

      const fgPct = getStatPerGameTotal({
        gamesPlayed,
        gameStats,
        stat: 'fg_pct',
      });

      const fg3Pct = getStatPerGameTotal({
        gamesPlayed,
        gameStats,
        stat: 'fg3_pct',
      });

      const ftm = getStatPerGameTotal({
        gamesPlayed,
        gameStats,
        isTotal: true,
        stat: 'ftm',
      });

      const fta = getStatPerGameTotal({
        gamesPlayed,
        gameStats,
        isTotal: true,
        stat: 'fta',
      });

      const ftPct = getStatPerGameTotal({
        gamesPlayed,
        gameStats,
        stat: 'ft_pct',
      });

      let effectiveFgPct: number | 'DNP' = 'DNP';
      let trueFgPct: number | 'DNP' = 'DNP';
      let usgRate: number | 'DNP' = 'DNP';

      if (fgm !== 'DNP' && fg3m !== 'DNP' && fga !== 'DNP') {
        effectiveFgPct = (fgm + 0.5 * fg3m) / fga;
      }

      if (pts !== 'DNP' && fga !== 'DNP' && fta !== 'DNP') {
        trueFgPct = pts / (2 * (fga + 0.44 * fta));
      }

      if (
        teamFga !== 'DNP' &&
        teamMin !== 'DNP' &&
        teamFta !== 'DNP' &&
        teamTo !== 'DNP' &&
        min !== 'DNP' &&
        fga !== 'DNP' &&
        fta !== 'DNP' &&
        to !== 'DNP'
      ) {
        usgRate =
          ((fga + 0.44 * fta + to) * (teamMin / 5)) / (min * (teamFga + 0.44 * teamFta + teamTo));
      }

      const playerStat = {
        player,
        min,
        pts,
        ppg,
        apg,
        rpg,
        orpg,
        drpg,
        spg,
        bpg,
        topg,
        fgm,
        fga,
        fgPct,
        fg3m,
        fg3a,
        fg3Pct,
        ftm,
        fta,
        ftPct,
        effectiveFgPct,
        trueFgPct,
        usgRate,
      };

      playerStatsReturn.push(playerStat);
    });

    return { data: playerStatsReturn };
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export { getPlayer, getPlayerSeasonStats, getPlayerStatsByTeamAndSeason };
