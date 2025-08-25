import { Request, Response } from 'express';
import { getSeasonsFromGameData } from '@data/services';

const getSeasons = async (req: Request, res: Response) => {
  try {
    const seasons = await getSeasonsFromGameData();
    const seasonsFormatted = seasons
      .map((season) => ({
        label: `${season.season}-${season.season + 1}`,
        value: season.season.toString(),
      }))
      .sort((a, b) => (a.value > b.value ? -1 : 1));
    return seasonsFormatted;
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export { getSeasons };
