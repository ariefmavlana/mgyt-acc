import { Router } from 'express';
import { getPeriods, closePeriod, createPeriod } from '../controllers/period.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.get('/', getPeriods);
router.post('/', createPeriod);
router.post('/:id/close', closePeriod);

export default router;
