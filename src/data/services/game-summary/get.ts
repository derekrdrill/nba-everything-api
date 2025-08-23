import conn from '@data/connection';
import { GameSummaries } from '@data/models';

async function getGameSummary({ gameId }: { gameId: string }): Promise<{
  gameId: string;
  gameSummary: { insight: string; overview: string; keyHiglights: string[] };
}> {
  await conn();
  const gameSummaryFromDB = await GameSummaries.findOne({ gameId });
  return gameSummaryFromDB;
}

export default getGameSummary;
