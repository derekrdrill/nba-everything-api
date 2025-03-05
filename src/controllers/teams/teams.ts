import axios from 'axios';
import { Request, Response } from 'express';
import { ApiResponse, NBATeam } from '@balldontlie/sdk';
import { useBallDontLieApi } from '@api';
import { SportsDataIONBATeamStadium, SportsDataIONBATeam } from '@types';

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

    const sportsDataIOTeamOptions = {
      method: 'GET',
      url: 'https://api.sportsdata.io/v3/nba/scores/json/AllTeams',
      params: { key: process.env.SPORTS_DATA_IO_API_KEY },
    };

    const sportsDataIOTeamStadiumOptions = {
      method: 'GET',
      url: 'https://api.sportsdata.io/v3/nba/scores/json/Stadiums',
      params: { key: process.env.SPORTS_DATA_IO_API_KEY },
    };

    const sportsDataIOTeamRequest = await axios.request(sportsDataIOTeamOptions);
    const sportsDataIOTeamStadiumRequest = await axios.request(sportsDataIOTeamStadiumOptions);
    const sportsDataIOTeam = sportsDataIOTeamRequest.data as SportsDataIONBATeam[];
    const sportsDataIOTeamStadium =
      sportsDataIOTeamStadiumRequest.data as SportsDataIONBATeamStadium[];
    const sportsDataIOTeamFormatted = sportsDataIOTeam.map((team) => {
      if (team.Active) {
        if (team.Key === 'NY') {
          return { ...team, Key: 'NYK' };
        } else if (team.Key === 'NO') {
          return { ...team, Key: 'NOP' };
        } else if (team.Key === 'SA') {
          return { ...team, Key: 'SAS' };
        } else if (team.Key === 'GS') {
          return { ...team, Key: 'GSW' };
        } else if (team.Key === 'PHO') {
          return { ...team, Key: 'PHX' };
        } else {
          return { ...team, Key: team.Key };
        }
      }
    });

    const teamsReturn = currentTeams.data.map((team) => {
      const teamData = sportsDataIOTeamFormatted.find(
        (sdioTeam) => sdioTeam?.Key === team.abbreviation,
      );
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
        stadium: {
          name: teamStadium?.Name,
          city: teamStadium?.City,
          state: teamStadium?.State,
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
