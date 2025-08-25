import conn from '@data/connection';
import { PlayerGameStats } from '@data/models';

async function getSeasonsFromGameData(): Promise<{ season: number }[]> {
  await conn();

  const seasons = await PlayerGameStats.aggregate([
    {
      $group: {
        _id: '$game.season',
      },
    },
    {
      $project: {
        _id: 0,
        season: '$_id',
      },
    },
  ]);

  return seasons;
}

export default getSeasonsFromGameData;
