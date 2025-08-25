import conn from '@data/connection';
import { PlayerHeadshots } from '@data/models';
import { NBAPlayerHeadshot } from '@types';

async function getPlayerHeadshots(): Promise<NBAPlayerHeadshot[]> {
  await conn();
  const playerHeadshots = await PlayerHeadshots.find();
  return playerHeadshots;
}

export default getPlayerHeadshots;
