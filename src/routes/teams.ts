import { Router } from 'express';
import { getTeams, getTeamsCurrent } from '@controllers';

const router = Router();

router.get('/', getTeams);
router.get('/current', getTeamsCurrent);

export default router;
