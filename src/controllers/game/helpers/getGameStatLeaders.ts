import { NBAStats } from '@balldontlie/sdk';

const getGameStatLeader = ({ statData, stat }: { statData: NBAStats[]; stat: keyof NBAStats }) => {
  const statLeaderFull = statData.reduce((a, b) => {
    return a[stat] > b[stat] ? a : b;
  });

  return {
    player: statLeaderFull.player,
    [stat]: statLeaderFull[stat],
  };
};

const getGameStatLeaders = ({
  homeTeamStats,
  visitorTeamStats,
}: {
  homeTeamStats: NBAStats[];
  visitorTeamStats: NBAStats[];
}) => {
  return {
    ast: {
      home: getGameStatLeader({ statData: homeTeamStats, stat: 'ast' }),
      visitor: getGameStatLeader({ statData: visitorTeamStats, stat: 'ast' }),
    },
    blk: {
      home: getGameStatLeader({ statData: homeTeamStats, stat: 'blk' }),
      visitor: getGameStatLeader({ statData: visitorTeamStats, stat: 'blk' }),
    },
    pts: {
      home: getGameStatLeader({ statData: homeTeamStats, stat: 'pts' }),
      visitor: getGameStatLeader({ statData: visitorTeamStats, stat: 'pts' }),
    },
    reb: {
      home: getGameStatLeader({ statData: homeTeamStats, stat: 'reb' }),
      visitor: getGameStatLeader({ statData: visitorTeamStats, stat: 'reb' }),
    },
    stl: {
      home: getGameStatLeader({ statData: homeTeamStats, stat: 'stl' }),
      visitor: getGameStatLeader({ statData: visitorTeamStats, stat: 'stl' }),
    },
    turnover: {
      home: getGameStatLeader({ statData: homeTeamStats, stat: 'turnover' }),
      visitor: getGameStatLeader({ statData: visitorTeamStats, stat: 'turnover' }),
    },
  };
};

const getGameStatLeadersByTeam = ({
  homeTeamStats,
  visitorTeamStats,
}: {
  homeTeamStats: NBAStats[];
  visitorTeamStats: NBAStats[];
}) => {
  return {
    homeStatLeaders: getGameStatLeadersSeparated({
      team: 'home',
      homeTeamStats,
      visitorTeamStats,
    }),
    visitorStatLeaders: getGameStatLeadersSeparated({
      team: 'visitor',
      homeTeamStats,
      visitorTeamStats,
    }),
  };
};

const getGameStatLeadersSeparated = ({
  team,
  homeTeamStats,
  visitorTeamStats,
}: {
  team: 'home' | 'visitor';
  homeTeamStats: NBAStats[];
  visitorTeamStats: NBAStats[];
}) => {
  const statLeaders = getGameStatLeaders({
    homeTeamStats,
    visitorTeamStats,
  });

  return [
    {
      type: 'pts',
      player: statLeaders.pts[team].player,
      total: statLeaders.pts[team].pts,
    },
    {
      type: 'ast',
      player: statLeaders.ast[team].player,
      total: statLeaders.ast[team].ast,
    },
    {
      type: 'reb',
      player: statLeaders.reb[team].player,
      total: statLeaders.reb[team].reb,
    },
    {
      type: 'stl',
      player: statLeaders.stl[team].player,
      total: statLeaders.stl[team].stl,
    },
    {
      type: 'blk',
      player: statLeaders.blk[team].player,
      total: statLeaders.blk[team].blk,
    },
    {
      type: 'turnover',
      player: statLeaders.turnover[team].player,
      total: statLeaders.turnover[team].turnover,
    },
  ];
};

export { getGameStatLeadersByTeam };
