import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { checkCompanyContext } from '../middleware/company.middleware';
import { getCustomers, createCustomer } from '../controllers/contact.controller';

const router = Router();

router.use(protect);
router.use(checkCompanyContext);

router.get('/customers', getCustomers);
router.post('/customers', createCustomer);

export default router;
