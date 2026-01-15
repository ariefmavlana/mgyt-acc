import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { getTaxes, createTax, updateTax, deleteTax } from '../controllers/tax.controller';

const router = Router();

router.use(protect);

router.get('/', getTaxes);
router.post('/', createTax);
router.put('/:id', updateTax);
router.delete('/:id', deleteTax);

export default router;
