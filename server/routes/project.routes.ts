import express from 'express';
import { getProjects, createProject } from '../controllers/project.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect);

router.get('/', getProjects);
router.post('/', createProject);

export default router;
