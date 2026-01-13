import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import {
    getStock,
    recordMovement,
    getMovementHistory,
    getWarehouses,
    createWarehouse
} from '../controllers/inventory.controller';

const router = Router();

router.use(protect);

router.get('/stock', getStock);
router.get('/warehouses', getWarehouses);
router.post('/warehouses', createWarehouse);
router.post('/movement', recordMovement);
router.get('/movement', getMovementHistory);

export default router;
