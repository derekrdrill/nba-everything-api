import { Router } from 'express';
import { getGamesByTeam, getGamesByTeamAndSeason } from '@controllers';

const router = Router();

router.get('/:teamId', getGamesByTeam);
router.get('/:teamId/:season', getGamesByTeamAndSeason);

export default router;
