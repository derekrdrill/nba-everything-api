import { Router } from 'express';
import { getGame } from '@controllers';

const router = Router();

router.get('/:gameId', getGame);

export default router;
