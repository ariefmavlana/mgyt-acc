
import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { getAuditLogs, getAuditLogById } from '../controllers/audit.controller';

const router = Router();

router.use(protect); // Ensure user is logged in

router.get('/', getAuditLogs);
router.get('/:id', getAuditLogById);

export default router;
