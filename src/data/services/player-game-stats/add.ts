import { NBAStats } from '@balldontlie/sdk';
import conn from '@data/connection';
import { PlayerGameStats as PlayerGameStatsModel } from '@data/models';

async function addPlayerGameStats(playerGameStats: NBAStats[]) {
  await conn();

  const bulkPlayerGameStats = playerGameStats.map((playerGameStat) => ({
    updateOne: {
      filter: { id: playerGameStat.id },
      update: { $set: playerGameStat },
      upsert: true,
    },
  }));

  await PlayerGameStatsModel.bulkWrite(bulkPlayerGameStats);
}

export default addPlayerGameStats;
