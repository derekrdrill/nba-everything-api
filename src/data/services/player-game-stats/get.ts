import { NBAStats } from '@balldontlie/sdk';
import conn from '@data/connection';
import { PlayerGameStats } from '@data/models';
import { getPlayerGameStatsMapped } from '@data/helpers';

async function getPlayerGameStatsByGameId({ gameId }: { gameId: number }): Promise<NBAStats[]> {
  await conn();
  const playerGameStats = await PlayerGameStats.find({
    'game.id': gameId,
  }).lean();

  const playerGameStatsMapped = getPlayerGameStatsMapped({ playerGameStats });
  return playerGameStatsMapped;
}

async function getPlayerGameStatsByTeamAndSeason({
  season,
  teamId,
}: {
  season: number;
  teamId: number;
}): Promise<NBAStats[]> {
  await conn();
  const playerGameStats = await PlayerGameStats.find({
    'game.season': season,
    'team.id': teamId,
  }).lean();

  const playerGameStatsMapped = getPlayerGameStatsMapped({ playerGameStats });
  return playerGameStatsMapped;
}

export { getPlayerGameStatsByGameId, getPlayerGameStatsByTeamAndSeason };
