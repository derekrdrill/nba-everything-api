import { Request, Response } from 'express';
import Bottleneck from 'bottleneck';
import { NBAStats } from '@balldontlie/sdk';

import { useBallDontLieApi } from '@api';
import { addPlayerGameStats } from '@data/services';

const ballDontLie = useBallDontLieApi();
const RATE_LIMIT = 30;
const REQUEST_INTERVAL = 60000 / RATE_LIMIT;

const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: REQUEST_INTERVAL,
});

export const postPlayerStats = async (req: Request, res: Response) => {
  let allPlayerGameStats: NBAStats[] = [];
  let elapsedTimeString: string = '';
  let logMessage: string = '';

  const { season, startYear, endYear } = req.body;

  const handlePostPlayerStats = async ({ season }: { season: number }) => {
    let cursor: number | undefined;
    let hasMoreData = true;
    let requestCount = 0;
    let startTime = Date.now();

    try {
      while (hasMoreData) {
        let elapsedTime = Date.now() - startTime;
        let elapsedTimeMs = Math.floor(elapsedTime / 1000);
        let elapsedTimeH = Math.floor(elapsedTimeMs / 3600000);
        let elapsedTimeM = Math.floor(elapsedTimeMs / 60);
        let elapsedTimeS = elapsedTimeMs % 60;
        elapsedTimeString = `${elapsedTimeH}h ${elapsedTimeM}m ${elapsedTimeS}s`;

        if (requestCount === RATE_LIMIT) {
          console.log(`Rate limit reached. Waiting 60s to continue...`);
          await new Promise((resolve) => setTimeout(resolve, 60000));
          requestCount = 0;
        }

        const response = await limiter.schedule(() =>
          ballDontLie.nba.getStats({ seasons: [season], cursor, per_page: 100 }),
        );

        const playerGameStats = response.data;
        allPlayerGameStats = allPlayerGameStats.concat(playerGameStats);

        cursor = response.meta?.next_cursor;
        hasMoreData = !!cursor;
        requestCount += 1;
        logMessage = `${allPlayerGameStats.length} player game stat records added/updated for season ${season}-${Number(season) + 1} in ${elapsedTimeString}`;

        addPlayerGameStats(playerGameStats);

        console.log(logMessage);
      }
    } catch (error) {
      console.log(`Errored out during season ${startYear || season} at cursor ${cursor}:`, error);
      res.status(500).json({ error: 'Failed to fetch player stats' });
    }
  };

  if (startYear && endYear) {
    const startYear = req.body.startYear;
    const endYear = req.body.endYear;

    for (let season = startYear; season <= endYear; season++) {
      await handlePostPlayerStats({ season });

      const thisSeason = `${season}-${Number(season) + 1}`;
      const nextSeason = `${Number(season) + 1}-${Number(season) + 2}`;

      console.log(
        '*************************************************************************************',
      );
      console.log(
        `${allPlayerGameStats.length} player game stat records added for ${thisSeason}. Waiting 60s to continue to ${nextSeason}...`,
      );
      console.log(
        '*************************************************************************************',
      );

      await new Promise((resolve) => setTimeout(resolve, 60000));
    }

    const returnMessage = `${allPlayerGameStats.length} player game stat records added/updated for seasons ${startYear} - ${endYear} in ${elapsedTimeString}`;
    allPlayerGameStats = [];
    res.status(200).send(returnMessage);
  } else if (season) {
    await handlePostPlayerStats({ season });
    res.status(200).send(logMessage);
  } else {
    return res.status(400).json({ error: 'Season is required to insert player game stats' });
  }
};
