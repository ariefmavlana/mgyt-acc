import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { checkCompanyContext } from '../middleware/company.middleware';
import { createInvoice, getInvoices, getInvoiceDetail, generateInvoicePDF, getAgingSchedule, getInvoiceAging } from '../controllers/invoice.controller';

const router = Router();

router.use(protect);
router.use(checkCompanyContext);

router.get('/aging-schedule', getAgingSchedule); // Specific route first
router.post('/', createInvoice);
router.get('/', getInvoices);
router.get('/:id', getInvoiceDetail);
router.get('/:id/print', generateInvoicePDF);
router.get('/:id/aging', getInvoiceAging);

export default router;
