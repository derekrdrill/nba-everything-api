import { Router } from 'express';
import { getSeasons } from '@controllers';

const router = Router();

router.get('/', async (req, res) => {
  const data = await getSeasons(req, res);
  res.json(data);
});

export default router;
