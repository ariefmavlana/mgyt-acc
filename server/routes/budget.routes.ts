import { Router } from 'express';
import {
    getBudgets,
    getBudgetById,
    createBudget,
    updateBudget,
    deleteBudget,
    calculateBudgetRealization,
    getVarianceReport
} from '../controllers/budget.controller';

const router = Router();

router.get('/', getBudgets);
router.get('/report/variance', getVarianceReport);
router.get('/:id', getBudgetById);
router.post('/', createBudget);
router.put('/:id', updateBudget);
router.delete('/:id', deleteBudget);
router.post('/:id/realization', calculateBudgetRealization);

export default router;
