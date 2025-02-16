import { Router } from 'express';
import { getPlayer, getPlayerSeasonStats } from '@controllers';

const router = Router();

router.get('/:playerId', getPlayer);
router.get('/:playerId/stats/:season', getPlayerSeasonStats);
router.get('/:playerId/stats/career', () => {
  console.log('career stats');
});

export default router;
