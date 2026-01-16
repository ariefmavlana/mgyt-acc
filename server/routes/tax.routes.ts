import { Router } from 'express';
import {
    getTaxes,
    createTax,
    updateTax,
    deleteTax,
    getTaxReport,
    fileTaxReport,
    getFiledTaxReports
} from '../controllers/tax.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);
router.use(restrictTo('ADMIN', 'TAX_OFFICER', 'ACCOUNTANT', 'SENIOR_ACCOUNTANT', 'CFO'));

router.get('/', getTaxes);
router.post('/', createTax);
router.get('/report', getTaxReport);
router.get('/history', getFiledTaxReports);
router.post('/file', fileTaxReport);
router.put('/:id', updateTax);
router.delete('/:id', deleteTax);

export default router;
