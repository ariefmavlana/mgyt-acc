import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { receivePayment } from '../controllers/payment.controller';

const router = Router();

router.use(protect);

router.post('/', receivePayment);

export default router;
