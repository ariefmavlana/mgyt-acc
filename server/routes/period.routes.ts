import { Router } from 'express';
import { getPeriods, closePeriod } from '../controllers/period.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.get('/', getPeriods);
router.post('/:id/close', closePeriod);

export default router;
