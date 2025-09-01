import { getGame } from '@controllers/game/game';
import { getGamesByTeam, getGamesByTeamAndSeason } from '@controllers/games/games';
import {
  getPlayer,
  getPlayerSeasonStats,
  getPlayerStatsByTeamAndSeason,
} from '@controllers/player/player';
import { getSeasons } from '@controllers/seasons/seasons';
import { getTeams, getTeamsCurrent } from '@controllers/teams/teams';
import { postPlayerStats } from './admin/post-player-stats';

export {
  getTeams,
  getTeamsCurrent,
  getGame,
  getGamesByTeam,
  getGamesByTeamAndSeason,
  getPlayer,
  getPlayerSeasonStats,
  getPlayerStatsByTeamAndSeason,
  postPlayerStats,
  getSeasons,
};
