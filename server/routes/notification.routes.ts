import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import * as controller from '../controllers/notification.controller';

const router = Router();

router.use(protect);

router.get('/', controller.getNotifications);
router.get('/unread-count', controller.getUnreadCount);
router.put('/:id/read', controller.markAsRead);
router.post('/read-all', controller.markAllAsRead);

export default router;
