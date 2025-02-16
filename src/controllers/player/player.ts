import { Request, Response } from 'express';

import { useBallDontLieApi } from '@api';
import { getPlayerGamesWithData } from '@controllers/player/helpers';
import { getStatPerGameTotal } from '@controllers/games/helpers';
import { NBAGameStatsWithTeamIds } from '@types';

const ballDontLie = useBallDontLieApi();

const getPlayer = async (req: Request, res: Response) => {
  try {
    const playerId = Number(req.params.playerId);
    const player = await ballDontLie.nba.getPlayer(playerId);
    res.json(player);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

const getPlayerSeasonStats = async (req: Request, res: Response) => {
  try {
    const playerId = Number(req.params.playerId);
    const season = Number(req.params.season);

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

    res.json({
      data: {
        player: playerGameStatsBySeasonData[0].player,
        ppg,
        apg,
        rpg,
        spg,
        bpg,
        topg,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export { getPlayer, getPlayerSeasonStats };
