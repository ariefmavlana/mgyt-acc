import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth.middleware';
import {
    getSubscriptionRequests,
    createSubscriptionRequest,
    approveSubscriptionRequest,
    getAvailablePackages
} from '../controllers/subscription.controller';

const router = Router();

router.use(protect);

// Anyone can see available packages
router.get('/packages', getAvailablePackages);

// Only managers/admins can see/request upgrades
router.get('/requests', restrictTo('ADMIN', 'CEO', 'MANAGER', 'FINANCE_MANAGER'), getSubscriptionRequests);
router.post('/requests', restrictTo('ADMIN', 'MANAGER', 'FINANCE_MANAGER'), createSubscriptionRequest);

// Only CEO/Owner can approve/reject
router.post('/requests/:id/process', restrictTo('ADMIN', 'CEO'), approveSubscriptionRequest);

export default router;
