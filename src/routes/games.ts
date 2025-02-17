import { Router } from 'express';
import { getGamesByTeam, getGamesByTeamAndSeason } from '@controllers';
import { checkCache, memcached } from '@cache';

const router = Router();

router.get('/:teamId', checkCache, async (req, res) => {
  const key = req.originalUrl;
  const data = await getGamesByTeam(req, res);

  memcached.set(key, JSON.stringify(data), { expires: 60 }, (err) => {
    if (err) console.error;
  });

  res.json(data);
});

router.get('/:teamId/:season', checkCache, async (req, res) => {
  const key = req.originalUrl;
  const data = await getGamesByTeamAndSeason(req, res);

  // memcached.set(key, data, 60, (err) => {
  //   if (err) console.error(err);
  // });
  memcached.set(key, JSON.stringify(data), { expires: 60 }, (err) => {
    if (err) console.error(err);
  });

  res.json(data);
});

export default router;
