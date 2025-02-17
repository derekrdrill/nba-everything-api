import { Router } from 'express';
import { getGame } from '@controllers';
import { checkCache, memcached } from '@cache';

const router = Router();

router.get('/:gameId', checkCache, async (req, res) => {
  const key = req.originalUrl;
  const data = await getGame(req, res);

  // memcached.set(key, data, 60, (err) => {
  //   if (err) console.error(err);
  // });
  memcached.set(key, JSON.stringify(data), { expires: 60 }, (err) => {
    if (err) console.error(err);
  });

  res.json(data);
});

export default router;
