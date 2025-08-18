import axios from 'axios';
import {
  SportsDataIONBAPlayerHeadshot,
  SportsDataIONBATeam,
  SportsDataIONBATeamStadium,
} from '@types';

const getTeams = async (): Promise<SportsDataIONBATeam[]> => {
  const sportsDataIOTeamOptions = {
    method: 'GET',
    url: `${process.env.SPORTS_DATA_IO_API_URL}/scores/json/AllTeams`,
    params: { key: process.env.SPORTS_DATA_IO_API_KEY },
  };

  const sportsDataIOTeamRequest = await axios.request(sportsDataIOTeamOptions);
  const sportsDataIOTeam = sportsDataIOTeamRequest.data as SportsDataIONBATeam[];
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
  }) as SportsDataIONBATeam[];

  return sportsDataIOTeamFormatted;
};

const getStadiums = async (): Promise<SportsDataIONBATeamStadium[]> => {
  const sportsDataIOTeamStadiumOptions = {
    method: 'GET',
    url: `${process.env.SPORTS_DATA_IO_API_URL}/scores/json/Stadiums`,
    params: { key: process.env.SPORTS_DATA_IO_API_KEY },
  };

  const sportsDataIOTeamStadiumRequest = await axios.request(sportsDataIOTeamStadiumOptions);
  const sportsDataIOTeamStadium =
    sportsDataIOTeamStadiumRequest.data as SportsDataIONBATeamStadium[];

  return sportsDataIOTeamStadium;
};

const getPlayerHeadshots = async (): Promise<SportsDataIONBAPlayerHeadshot[]> => {
  const sportsDataIOPlayerHeadshotOptions = {
    method: 'GET',
    url: `${process.env.SPORTS_DATA_IO_API_URL}/headshots/json/Headshots?key=${process.env.SPORTS_DATA_IO_HEADSHOTS_API_KEY}`,
    params: { key: process.env.SPORTS_DATA_IO_API_KEY },
  };

  const sportsDataIOPlayerHeadshotRequest = await axios.request(sportsDataIOPlayerHeadshotOptions);
  const sportsDataIOPlayerHeadshot =
    sportsDataIOPlayerHeadshotRequest.data as SportsDataIONBAPlayerHeadshot[];
  return sportsDataIOPlayerHeadshot;
};

export { getPlayerHeadshots, getStadiums, getTeams };
