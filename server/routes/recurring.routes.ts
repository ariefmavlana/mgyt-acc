import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import * as controller from '../controllers/recurring.controller';

const router = Router();

router.use(protect);

router.get('/', controller.getRecurringTransactions);
router.post('/', controller.createRecurringTransaction);
router.post('/trigger', controller.processRecurringTrigger);

export default router;
