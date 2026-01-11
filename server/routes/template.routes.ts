import { Router } from 'express';
import { getTemplates, getTemplate } from '../controllers/template.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.get('/', getTemplates);
router.get('/:id', getTemplate);

export default router;
