import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { receivePayment, getPaymentSuggestions } from '../controllers/payment.controller';

const router = Router();

router.use(protect);

router.post('/', receivePayment);
router.get('/suggestions', getPaymentSuggestions);

export default router;
