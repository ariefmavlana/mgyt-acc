import express from 'express';
import * as controller from '../controllers/project.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect);

router.get('/', controller.getProjects);
router.post('/', controller.createProject);
router.put('/:id', controller.updateProject);
router.delete('/:id', controller.deleteProject);
router.get('/:id/profitability', controller.getProjectProfitability);

export default router;
