import { Router } from 'express';
import { getTransactions, createTransaction, getAccounts, voidTransaction, duplicateTransaction, exportTransactions } from '../controllers/transaction.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Apply auth to all routes
router.use(protect);

router.get('/export', exportTransactions);
router.get('/', getTransactions);
router.post('/', createTransaction);
router.get('/accounts', getAccounts);
router.get('/:id/duplicate', duplicateTransaction);
router.delete('/:id/void', voidTransaction);

export default router;
