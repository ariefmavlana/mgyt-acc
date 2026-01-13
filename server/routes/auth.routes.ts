import { Router } from 'express';
import { register, login, logout, getMe, refresh, changePassword, switchCompany, updateProfile } from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.post('/refresh', refresh);
router.post('/change-password', protect, changePassword);
router.post('/switch-company', protect, switchCompany);
router.put('/profile', protect, updateProfile);

export default router;
