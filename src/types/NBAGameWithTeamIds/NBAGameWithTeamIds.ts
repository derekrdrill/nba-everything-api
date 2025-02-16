import { NBAGame } from '@balldontlie/sdk';

type NBAGameWithTeamIds = NBAGame & {
  home_team_id: number;
  visitor_team_id: number;
};

export { NBAGameWithTeamIds };
