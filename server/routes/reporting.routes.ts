import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import {
    getBalanceSheet,
    getIncomeStatement,
    getCashFlow,
    exportReport
} from '../controllers/reporting.controller';

const router = Router();

router.use(protect);

router.get('/balance-sheet', getBalanceSheet);
router.get('/income-statement', getIncomeStatement);
router.get('/cash-flow', getCashFlow);
router.post('/export', exportReport);

export default router;
