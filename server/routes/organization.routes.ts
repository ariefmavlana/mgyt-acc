import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import * as controller from '../controllers/organization.controller';

const router = Router();

router.use(protect);

// Cost Centers
router.get('/cost-centers', controller.getCostCenters);
router.post('/cost-centers', controller.createCostCenter);
router.put('/cost-centers/:id', controller.updateCostCenter);
router.delete('/cost-centers/:id', controller.deleteCostCenter);

// Profit Centers
router.get('/profit-centers', controller.getProfitCenters);
router.post('/profit-centers', controller.createProfitCenter);
router.put('/profit-centers/:id', controller.updateProfitCenter);
router.delete('/profit-centers/:id', controller.deleteProfitCenter);

export default router;
