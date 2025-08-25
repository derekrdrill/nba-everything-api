import { NBAPlayerHeadshot } from '@types';
import { NBAPlayer, NBATeam, NBAGame } from '@balldontlie/sdk';

function normalizePlayerName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters, keep letters, numbers, spaces
    .trim();
}

const getPlayerFromHeadshotData = ({
  playerHeadshots,
  statLeader,
}: {
  playerHeadshots: NBAPlayerHeadshot[];
  statLeader: {
    type: string;
    player: NBAPlayer;
    total: string | number | NBATeam | NBAPlayer | NBAGame;
  };
}) => {
  return playerHeadshots.find((playerHeadshot) => {
    const normalizedPlayerName = normalizePlayerName(
      `${statLeader.player.first_name} ${statLeader.player.last_name}`,
    );
    const normalizedHeadshotName = normalizePlayerName(playerHeadshot.Name);
    return normalizedPlayerName === normalizedHeadshotName;
  });
};

export { getPlayerFromHeadshotData };
