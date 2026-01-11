import { Router } from 'express';
import {
    getOnboardingStatus,
    setupCompany,
    setupBranches,
    setupCOA,
    finalizeOnboarding
} from '../controllers/onboarding.controller';
import { protect } from '../middleware/auth.middleware';
import { tenantMiddleware } from '../middleware/tenant.middleware';

const router = Router();

// All onboarding routes require authentication and tenant context
router.use(protect);
router.use(tenantMiddleware as any);

router.get('/status', getOnboardingStatus as any);
router.post('/step1', setupCompany as any);
router.post('/step2', setupBranches as any);
router.post('/step3', setupCOA as any);
router.post('/finalize', finalizeOnboarding as any);

export default router;
