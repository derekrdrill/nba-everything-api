import { NBAPlayer, NBAGame, NBATeam } from '@balldontlie/sdk';
import { NBAPlayerHeadshot } from '@types';
import { getPlayerFromHeadshotData } from '@controllers/game/helpers';

const getEnhancedStatLeaders = ({
  playerHeadshots,
  statLeaders,
}: {
  playerHeadshots: NBAPlayerHeadshot[];
  statLeaders: {
    type: string;
    player: NBAPlayer;
    total: string | number | NBATeam | NBAPlayer | NBAGame;
  }[];
}) => {
  return statLeaders.map((statLeader) => ({
    ...statLeader,
    ...{
      player: {
        ...statLeader.player,
        proper_last_name: getPlayerFromHeadshotData({
          playerHeadshots,
          statLeader: statLeader,
        })?.Name.split(' ')[1],
        head_shot: getPlayerFromHeadshotData({
          playerHeadshots,
          statLeader: statLeader,
        })?.HostedHeadshotNoBackgroundUrl,
      },
    },
  }));
};

export { getEnhancedStatLeaders };
