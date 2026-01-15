import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { getCustomers, createCustomer, getVendors, createVendor } from '../controllers/contact.controller';

const router = Router();

router.use(protect);

router.get('/customers', getCustomers);
router.post('/customers', createCustomer);
router.get('/vendors', getVendors);
router.post('/vendors', createVendor);

export default router;
