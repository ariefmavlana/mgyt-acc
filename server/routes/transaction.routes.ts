import { Router } from 'express';
import {
    getTransactions,
    createTransaction,
    getAccounts,
    voidTransaction,
    duplicateTransaction,
    exportTransactions
} from '../controllers/transaction.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

// Apply auth to all routes
router.use(protect);

router.get('/export', restrictTo('ADMIN', 'ACCOUNTANT', 'MANAGER', 'CEO', 'CFO'), exportTransactions);
router.get('/', getTransactions);
router.post('/', restrictTo('ADMIN', 'ACCOUNTANT', 'CASHIER', 'MANAGER'), createTransaction);
router.get('/accounts', getAccounts);
router.get('/:id/duplicate', restrictTo('ADMIN', 'ACCOUNTANT', 'MANAGER'), duplicateTransaction);
router.delete('/:id/void', restrictTo('ADMIN', 'ACCOUNTANT', 'MANAGER'), voidTransaction);

export default router;
