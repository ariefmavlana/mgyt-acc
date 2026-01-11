import { Router } from 'express';
import { importCSV } from '../controllers/import.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.post('/csv', importCSV);

export default router;
