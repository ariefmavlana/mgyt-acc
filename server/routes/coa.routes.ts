import { Router } from 'express';
import {
    getCOATree,
    getCOADetail,
    createCOA,
    updateCOA,
    deleteCOA,
    getAccountLedger,
    getAccountBalance
} from '../controllers/coa.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.get('/', getCOATree);
router.post('/', createCOA);
router.get('/:id', getCOADetail);
router.put('/:id', updateCOA);
router.delete('/:id', deleteCOA);
router.get('/:id/transactions', getAccountLedger);
router.get('/:id/balance', getAccountBalance);

export default router;
