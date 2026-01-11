import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import {
    getBalanceSheet,
    getIncomeStatement,
    getCashFlow,
    getARAging,
    getAPAging,
    getTrialBalance,
    getGeneralLedger,
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
router.get('/trial-balance', getTrialBalance);
router.get('/general-ledger', getGeneralLedger);
router.post('/trigger-reminders', triggerReminders);
router.post('/export', exportReport);

export default router;
