
import express from 'express';
import authRoutes from './auth.routes';
import companyRoutes from './company.routes';
import transactionRoutes from './transaction.routes';
import invoiceRoutes from './invoice.routes';
import paymentRoutes from './payment.routes';
import productRoutes from './product.routes';
import coaRoutes from './coa.routes';
import reportingRoutes from './reporting.routes';
import auditRoutes from './audit.routes';
import hrRoutes from './hr.routes';
import documentRoutes from './documents.routes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/companies', companyRoutes);
router.use('/transactions', transactionRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/payments', paymentRoutes);
router.use('/products', productRoutes);
router.use('/coa', coaRoutes);
router.use('/reports', reportingRoutes);
router.use('/system/audit', auditRoutes);
router.use('/hr', hrRoutes);
router.use('/documents', documentRoutes);

export default router;
