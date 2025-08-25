import { NBAStats } from '@balldontlie/sdk';
import { FlattenMaps } from 'mongoose';

const getPlayerGameStatsMapped = ({
  playerGameStats,
}: {
  playerGameStats: (FlattenMaps<any> &
    Required<{
      _id: unknown;
    }> & {
      __v: number;
    })[];
}): NBAStats[] =>
  playerGameStats.map((stat) => ({
    id: stat.id,
    min: stat.min,
    fgm: stat.fgm,
    fga: stat.fga,
    fg_pct: stat.fg_pct,
    fg3m: stat.fg3m,
    fg3a: stat.fg3a,
    fg3_pct: stat.fg3_pct,
    ftm: stat.ftm,
    fta: stat.fta,
    ft_pct: stat.ft_pct,
    oreb: stat.oreb,
    dreb: stat.dreb,
    reb: stat.reb,
    ast: stat.ast,
    stl: stat.stl,
    blk: stat.blk,
    turnover: stat.turnover,
    pf: stat.pf,
    pts: stat.pts,
    player: stat.player,
    team: stat.team,
    game: stat.game,
  }));

export { getPlayerGameStatsMapped };
