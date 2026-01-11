import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { getCustomers, createCustomer } from '../controllers/contact.controller';

const router = Router();

router.use(protect);

router.get('/customers', getCustomers);
router.post('/customers', createCustomer);

export default router;
