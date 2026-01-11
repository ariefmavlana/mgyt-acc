
import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { getDashboardStats } from '../controllers/dashboard.controller';

const router = Router();

router.use(protect);

router.get('/stats', getDashboardStats);

export default router;
