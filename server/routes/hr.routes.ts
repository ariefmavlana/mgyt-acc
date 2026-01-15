
import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { tenantMiddleware } from '../middleware/tenant.middleware';
import * as HRController from '../controllers/hr.controller';

const router = Router();

router.use(protect);
router.use(tenantMiddleware);

// Employees
router.get('/employees/export', HRController.exportEmployees);
router.get('/employees', HRController.getEmployees);
router.post('/employees', HRController.createEmployee);
router.get('/employees/:id', HRController.getEmployeeById);
router.put('/employees/:id', HRController.updateEmployee);

// Payrolls
router.get('/payrolls', HRController.getPayrolls);
router.post('/payrolls/generate', HRController.generatePayroll);

// Departments
router.get('/departments', HRController.getDepartments);
router.post('/departments', HRController.createDepartment);
router.put('/departments/:id', HRController.updateDepartment);
router.delete('/departments/:id', HRController.deleteDepartment);

export default router;
