import { Router } from 'express';
import { postPlayerStats } from '@controllers';

const router = Router();

router.post('/post-player-stats', async (req, res) => {
  const data = await postPlayerStats(req, res);
  res.json(data);
});

export default router;
