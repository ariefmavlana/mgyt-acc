import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { checkCompanyContext } from '../middleware/company.middleware';
import {
    getStock,
    recordMovement,
    getMovementHistory
} from '../controllers/inventory.controller';

const router = Router();

router.use(protect);
router.use(checkCompanyContext);

router.get('/stock', getStock);
router.post('/movement', recordMovement);
router.get('/movement', getMovementHistory);

export default router;
