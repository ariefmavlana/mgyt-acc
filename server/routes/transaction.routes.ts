import { Router } from 'express';
import { getTransactions, createTransaction, getAccounts, voidTransaction } from '../controllers/transaction.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Apply auth to all routes
router.use(protect);

router.get('/', getTransactions);
router.post('/', createTransaction);
router.get('/accounts', getAccounts);
router.delete('/:id/void', voidTransaction);

export default router;
