import conn from '@data/connection';
import { GameSummaries } from '@data/models';

async function addGameSummary({
  gameId,
  gameSummary,
}: {
  gameId: string;
  gameSummary: { insight: string; overview: string; keyHiglights: string[] };
}) {
  await conn();
  await GameSummaries.insertOne({
    gameId,
    gameSummary,
  });
}

export default addGameSummary;
