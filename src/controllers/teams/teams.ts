import { Request, Response } from 'express';
import { ApiResponse, NBATeam } from '@balldontlie/sdk';
import { useBallDontLieApi, useSportsDataIOApi } from '@api';

const ballDontLie = useBallDontLieApi();

const getTeams = async (req: Request, res: Response) => {
  try {
    const ballDontLieTeams: ApiResponse<NBATeam[]> = await ballDontLie.nba.getTeams();
    return ballDontLieTeams;
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

const getTeamsCurrent = async (req: Request, res: Response) => {
  try {
    const [ballDontLieTeams, sportsDataIOTeams, sportsDataIOTeamStadium] = await Promise.all([
      ballDontLie.nba.getTeams(),
      useSportsDataIOApi.getTeams(),
      useSportsDataIOApi.getStadiums(),
    ]);

    const currentTeams = {
      data: ballDontLieTeams.data.filter(
        (team) => team.conference === 'East' || team.conference === 'West',
      ),
    };

    const teamsReturn = currentTeams.data.map((team) => {
      const teamData = sportsDataIOTeams.find((sdioTeam) => sdioTeam?.Key === team.abbreviation);
      const teamStadiumID = teamData?.StadiumID;
      const teamStadium = sportsDataIOTeamStadium.find(
        (stadium) => stadium.StadiumID === teamStadiumID,
      );

      return {
        ...team,
        coach: teamData?.HeadCoach,
        colors: {
          primary: teamData?.PrimaryColor,
          secondary: teamData?.SecondaryColor,
          tertiary: teamData?.TertiaryColor,
          quaternary: teamData?.QuaternaryColor,
        },
        logo: teamData?.WikipediaLogoUrl,
        stadium: {
          name: teamStadium?.Name,
          address: teamStadium?.Address,
          city: teamStadium?.City,
          state: teamStadium?.State,
          zip: teamStadium?.Zip,
          country: teamStadium?.Country,
          capacity: teamStadium?.Capacity,
          geoLat: teamStadium?.GeoLat,
          geoLong: teamStadium?.GeoLong,
        },
      };
    });

    return { data: teamsReturn };
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export { getTeams, getTeamsCurrent };
