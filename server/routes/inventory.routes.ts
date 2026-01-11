import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import {
    getStock,
    recordMovement,
    getMovementHistory
} from '../controllers/inventory.controller';

const router = Router();

router.use(protect);

router.get('/stock', getStock);
router.post('/movement', recordMovement);
router.get('/movement', getMovementHistory);

export default router;
