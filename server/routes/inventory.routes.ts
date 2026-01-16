import { Router } from 'express';
import {
    getStock,
    getWarehouses,
    createWarehouse,
    recordMovement,
    getMovementHistory
} from '../controllers/inventory.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);
router.use(restrictTo('ADMIN', 'WAREHOUSE_MANAGER', 'PURCHASING', 'FINANCE_MANAGER', 'ACCOUNTANT', 'MANAGER'));

router.get('/stock', getStock);
router.get('/warehouses', getWarehouses);
router.post('/warehouses', createWarehouse);
router.post('/movement', recordMovement);
router.get('/movement', getMovementHistory);

export default router;
