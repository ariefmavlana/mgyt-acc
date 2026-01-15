import { Router } from 'express';
import {
    processPayroll,
    getPayrollHistory,
    postPayrollToJournal,
    downloadSlipGaji
} from '../controllers/payroll.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.get('/history', getPayrollHistory);
router.post('/process', processPayroll);
router.post('/post', postPayrollToJournal);
router.get('/:id/slip', downloadSlipGaji);

export default router;
