import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { checkCompanyContext } from '../middleware/company.middleware';
import { receivePayment } from '../controllers/payment.controller';

const router = Router();

router.use(protect);
router.use(checkCompanyContext);

router.post('/', receivePayment);

export default router;
