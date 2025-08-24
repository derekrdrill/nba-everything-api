import { NBAStats } from '@balldontlie/sdk';
import conn from '@data/connection';
import { PlayerGameStats } from '@data/models';

async function getPlayerGameStatsByGameId({ gameId }: { gameId: number }): Promise<NBAStats[]> {
  await conn();
  const playerGameStats = await PlayerGameStats.find(
    {
      'game.id': gameId,
    },
    { __v: 0, _id: 0 },
  );
  return playerGameStats;
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
  });
  return playerGameStats;
}

export { getPlayerGameStatsByGameId, getPlayerGameStatsByTeamAndSeason };
