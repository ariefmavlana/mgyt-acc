import { Router } from 'express';
import { getTransactions, createTransaction, getAccounts, voidTransaction } from '../controllers/transaction.controller';
import { protect } from '../middleware/auth.middleware';
import { checkCompanyContext } from '../middleware/company.middleware';

const router = Router();

// Apply auth to all routes
router.use(protect);

router.get('/', checkCompanyContext, getTransactions);
router.post('/', checkCompanyContext, createTransaction);
router.get('/accounts', checkCompanyContext, getAccounts);
router.delete('/:id/void', checkCompanyContext, voidTransaction);

export default router;
