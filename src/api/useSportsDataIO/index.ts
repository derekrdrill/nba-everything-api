import axios from 'axios';
import { localCache } from '@cache';
import { SportsDataIONBATeam, SportsDataIONBATeamStadium } from '@types';

const getTeams = async (): Promise<SportsDataIONBATeam[]> => {
  const cachedTeams = localCache.get('sportsdataio_teams');
  if (cachedTeams) {
    return cachedTeams;
  }

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

  localCache.set('sportsdataio_teams', sportsDataIOTeamFormatted, 24 * 60 * 60 * 1000);

  return sportsDataIOTeamFormatted;
};

const getStadiums = async (): Promise<SportsDataIONBATeamStadium[]> => {
  const cachedStadiums = localCache.get('sportsdataio_stadiums');
  if (cachedStadiums) {
    return cachedStadiums;
  }

  const sportsDataIOTeamStadiumOptions = {
    method: 'GET',
    url: `${process.env.SPORTS_DATA_IO_API_URL}/scores/json/Stadiums`,
    params: { key: process.env.SPORTS_DATA_IO_API_KEY },
  };

  const sportsDataIOTeamStadiumRequest = await axios.request(sportsDataIOTeamStadiumOptions);
  const sportsDataIOTeamStadium =
    sportsDataIOTeamStadiumRequest.data as SportsDataIONBATeamStadium[];

  localCache.set('sportsdataio_stadiums', sportsDataIOTeamStadium, 24 * 60 * 60 * 1000);

  return sportsDataIOTeamStadium;
};

export { getStadiums, getTeams };
