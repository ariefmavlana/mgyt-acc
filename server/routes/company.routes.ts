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
    createBranch,
    updateBranch,
    deleteBranch,
    getCompanyUsers,
    addUserToCompany,
    removeUserFromCompany
} from '../controllers/company.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

// Basic Company Retrieval
router.get('/', getCompanies);
router.get('/warehouses', getWarehouses);
router.get('/branches', getBranches);

// Restricted Company Management
router.post('/', restrictTo('ADMIN', 'CEO'), createCompany);
router.get('/:id', getCompany);
router.put('/:id', restrictTo('ADMIN', 'CEO'), updateCompany);
router.delete('/:id', restrictTo('ADMIN', 'CEO'), deleteCompany);
router.put('/:id/settings', restrictTo('ADMIN', 'CEO'), updateSettings);

// Branch Management
router.post('/branches', restrictTo('ADMIN', 'CEO'), createBranch);
router.put('/branches/:branchId', restrictTo('ADMIN', 'CEO'), updateBranch);
router.delete('/branches/:branchId', restrictTo('ADMIN', 'CEO'), deleteBranch);

// User Management within Company
router.get('/:id/users', restrictTo('ADMIN', 'CEO', 'MANAGER'), getCompanyUsers);
router.post('/:id/users', restrictTo('ADMIN', 'CEO'), addUserToCompany);
router.delete('/:id/users/:userId', restrictTo('ADMIN', 'CEO'), removeUserFromCompany);

export default router;
