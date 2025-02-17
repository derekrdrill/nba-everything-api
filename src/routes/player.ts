import { Router } from 'express';
import { getPlayer, getPlayerSeasonStats } from '@controllers';
import { checkCache, memcached, requestDataBasedOnCache } from '@cache';

const router = Router();

router.get('/:playerId', checkCache, async (req, res) => {
  const key = req.originalUrl;
  const data = await getPlayer(req, res);

  memcached.set(key, data, 60, (err) => {
    if (err) console.error(err);
  });

  res.json(data);
});

router.get('/:playerId/stats/:season', checkCache, async (req, res) => {
  const key = req.originalUrl;
  const data = await getPlayerSeasonStats(req, res);
  memcached.set(key, data, 60, (err) => {
    if (err) console.error(err);
  });
  res.json(data);
});

export default router;
