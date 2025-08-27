import { NBAPlayer } from '@balldontlie/sdk';
import { NBAPlayerStatValue } from '@types';

type NBAPlayerStat = {
  player: NBAPlayer;
  min: NBAPlayerStatValue;
  pts: NBAPlayerStatValue;
  ppg: NBAPlayerStatValue;
  apg: NBAPlayerStatValue;
  rpg: NBAPlayerStatValue;
  orpg: NBAPlayerStatValue;
  drpg: NBAPlayerStatValue;
  spg: NBAPlayerStatValue;
  bpg: NBAPlayerStatValue;
  topg: NBAPlayerStatValue;
  fgm: NBAPlayerStatValue;
  fga: NBAPlayerStatValue;
  fgPct: NBAPlayerStatValue;
  fg3m: NBAPlayerStatValue;
  fg3a: NBAPlayerStatValue;
  fg3Pct: NBAPlayerStatValue;
  ftm: NBAPlayerStatValue;
  fta: NBAPlayerStatValue;
  ftPct: NBAPlayerStatValue;
  effectiveFgPct: NBAPlayerStatValue;
  trueFgPct: NBAPlayerStatValue;
  usgRate: NBAPlayerStatValue;
};

export type { NBAPlayerStat };
