import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { getTaxes, createTax, updateTax, deleteTax, getTaxReport, fileTaxReport, getFiledTaxReports } from '../controllers/tax.controller';

const router = Router();

router.use(protect);

router.get('/', getTaxes);
router.post('/', createTax);
router.get('/report', getTaxReport);
router.get('/history', getFiledTaxReports);
router.post('/file', fileTaxReport);
router.put('/:id', updateTax);
router.delete('/:id', deleteTax);

export default router;
