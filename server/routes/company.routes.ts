import { Router } from 'express';
import {
    getCompanies,
    getCompany,
    createCompany,
    updateCompany,
    deleteCompany,
    updateSettings,
    getWarehouses
} from '../controllers/company.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect); // All company routes are protected

router.get('/', getCompanies);
router.get('/:id', getCompany);
router.post('/', createCompany);
router.put('/:id', updateCompany);
router.delete('/:id', deleteCompany);
router.post('/:id/settings', updateSettings);
router.get('/warehouses', getWarehouses);

export default router;
