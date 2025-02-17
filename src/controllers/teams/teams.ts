import { Request, Response } from 'express';
import { ApiResponse, NBATeam } from '@balldontlie/sdk';
import { useBallDontLieApi } from '@api';

const ballDontLie = useBallDontLieApi();

const getTeams = async (req: Request, res: Response) => {
  try {
    const teams: ApiResponse<NBATeam[]> = await ballDontLie.nba.getTeams();
    return teams;
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

const getTeamsCurrent = async (req: Request, res: Response) => {
  try {
    const teams: ApiResponse<NBATeam[]> = await ballDontLie.nba.getTeams();
    const currentTeams = {
      data: teams.data.filter((team) => team.conference === 'East' || team.conference === 'West'),
    };

    return currentTeams;
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export { getTeams, getTeamsCurrent };
