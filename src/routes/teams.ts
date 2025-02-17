import { Router } from 'express';
import { getTeams, getTeamsCurrent } from '@controllers';
import { checkCache, memcached } from '@cache';

const router = Router();

router.get('/', checkCache, async (req, res) => {
  const key = req.originalUrl;
  const data = await getTeams(req, res);

  memcached.set(key, JSON.stringify(data), { expires: 60 }, (err) => {
    if (err) console.error;
  });

  res.json(data);
});

router.get('/current', checkCache, async (req, res) => {
  const key = req.originalUrl;
  const data = await getTeamsCurrent(req, res);

  memcached.set(key, JSON.stringify(data), { expires: 60 }, (err) => {
    if (err) console.error;
  });

  res.json(data);
});

export default router;
