import { Router } from 'express';
import {
    getCOATree,
    getCOADetail,
    createCOA,
    updateCOA,
    deleteCOA,
    getAccountLedger,
    getAccountBalance,
    getNextAccountCode,
    updateOpeningBalances,
    exportCOA,
    importCOA
} from '../controllers/coa.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.use(protect);

router.get('/', getCOATree);
router.get('/next-code', getNextAccountCode);
router.put('/opening-balances', updateOpeningBalances);
router.post('/', createCOA);
router.get('/export', exportCOA);
router.post('/import', upload.single('file'), importCOA);
router.get('/:id', getCOADetail);
router.put('/:id', updateCOA);
router.delete('/:id', restrictTo('ADMIN', 'SUPERADMIN'), deleteCOA);
router.get('/:id/transactions', getAccountLedger);
router.get('/:id/balance', getAccountBalance);

export default router;
