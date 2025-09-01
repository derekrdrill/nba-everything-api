import { Router } from 'express';
import { getPlayer, getPlayerSeasonStats, getPlayerStatsByTeamAndSeason } from '@controllers';
import { checkCache, memcached, requestDataBasedOnCache } from '@cache';

const router = Router();

router.get('/:playerId', checkCache, async (req, res) => {
  const key = req.originalUrl;
  const data = await getPlayer(req, res);

  memcached.set(key, JSON.stringify(data), { expires: 60 }, (err) => {
    if (err) console.error;
  });

  res.json(data);
});

router.get('/:playerId/stats/:season', checkCache, async (req, res) => {
  const key = req.originalUrl;
  const data = await getPlayerSeasonStats(req, res);

  memcached.set(key, JSON.stringify(data), { expires: 60 }, (err) => {
    if (err) console.error;
  });

  res.json(data);
});

router.get('/season-stats/:teamId/:season', checkCache, async (req, res) => {
  const key = req.originalUrl;
  const data = await getPlayerStatsByTeamAndSeason(req, res);

  memcached.set(key, JSON.stringify(data), { expires: 60 }, (err) => {
    if (err) console.error;
  });

  res.json(data);
});

export default router;
