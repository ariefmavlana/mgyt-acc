import { Router } from 'express';
import {
    getCompanies,
    getCompany,
    createCompany,
    updateCompany,
    deleteCompany,
    updateSettings,
    getWarehouses,
    getBranches,
    getCompanyUsers,
    addUserToCompany,
    removeUserFromCompany
} from '../controllers/company.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect); // All company routes are protected

router.get('/', getCompanies);
router.get('/warehouses', getWarehouses);
router.get('/branches', getBranches);
router.get('/:id', getCompany);
router.post('/', createCompany);
router.put('/:id', updateCompany);
router.delete('/:id', deleteCompany);
router.post('/:id/settings', updateSettings);

// User Management
router.get('/:id/users', getCompanyUsers);
router.post('/:id/users', addUserToCompany);
router.delete('/:id/users/:userId', removeUserFromCompany);

export default router;
