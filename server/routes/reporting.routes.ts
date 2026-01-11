import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import {
    getBalanceSheet,
    getIncomeStatement,
    getCashFlow,
    getARAging,
    getAPAging,
    triggerReminders,
    exportReport
} from '../controllers/reporting.controller';

const router = Router();

router.use(protect);

router.get('/balance-sheet', getBalanceSheet);
router.get('/income-statement', getIncomeStatement);
router.get('/cash-flow', getCashFlow);
router.get('/ar-aging', getARAging);
router.get('/ap-aging', getAPAging);
router.post('/trigger-reminders', triggerReminders);
router.post('/export', exportReport);

export default router;
