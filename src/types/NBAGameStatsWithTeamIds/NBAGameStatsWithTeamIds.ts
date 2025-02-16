import { NBAStats } from '@balldontlie/sdk';
import { NBAGameWithTeamIds } from '@types';

type NBAGameStatsWithTeamIds = NBAStats & {
  game: NBAGameWithTeamIds;
};

export { NBAGameStatsWithTeamIds };
