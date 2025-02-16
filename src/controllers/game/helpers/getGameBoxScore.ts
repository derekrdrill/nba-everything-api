import { NBAStats } from '@balldontlie/sdk';

const getGameBoxScore = ({ load, teamData }: { load: 'lite' | 'full'; teamData: NBAStats[] }) => {
  return teamData.map((data) => ({
    ...(load === 'full' ? data : {}),
    player: `${data.player.last_name}, ${data.player.first_name}`,
    min: Number(data.min),
    pts: data.pts,
    reb: data.reb,
    ast: data.ast,
    stl: data.stl,
    blk: data.blk,
    turnover: data.turnover,
    fg_pct: data.fga === 0 ? 'N/A' : (data.fg_pct * 100).toFixed(1),
    fg3_pct: data.fg3a === 0 ? 'N/A' : (data.fg3_pct * 100).toFixed(1),
  }));
};

export { getGameBoxScore };
