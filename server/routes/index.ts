
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
import inventoryRoutes from './inventory.routes';
import importRoutes from './import.routes';
import periodRoutes from './period.routes';
import onboardingRoutes from './onboarding.routes';
import dashboardRoutes from './dashboard.routes';
import contactRoutes from './contact.routes';
import purchaseRoutes from './purchase.routes';
import templateRoutes from './template.routes';

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
router.use('/inventory', inventoryRoutes);
router.use('/import', importRoutes);
router.use('/periods', periodRoutes);
router.use('/onboarding', onboardingRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/contacts', contactRoutes);
router.use('/purchases', purchaseRoutes);
router.use('/templates', templateRoutes);

export default router;
