
import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { tenantMiddleware } from '../middleware/tenant.middleware';
import * as HRController from '../controllers/hr.controller';

const router = Router();

router.use(protect);
router.use(tenantMiddleware);

// Employees
router.get('/employees', HRController.getEmployees);
router.post('/employees', HRController.createEmployee);
router.get('/employees/:id', HRController.getEmployeeById);
router.put('/employees/:id', HRController.updateEmployee);

// Payrolls
router.get('/payrolls', HRController.getPayrolls);
router.post('/payrolls/generate', HRController.generatePayroll);

export default router;
