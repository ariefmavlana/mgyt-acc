import { Router } from 'express';
import {
    getCOATree,
    getCOADetail,
    createCOA,
    updateCOA,
    deleteCOA,
    getAccountLedger,
    getAccountLedger,
    getAccountBalance,
    exportCOA,
    importCOA
} from '../controllers/coa.controller';
import { protect } from '../middleware/auth.middleware';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.use(protect);

router.get('/', getCOATree);
router.post('/', createCOA);
router.get('/export', exportCOA);
router.post('/import', upload.single('file'), importCOA);
router.get('/:id', getCOADetail);
router.put('/:id', updateCOA);
router.delete('/:id', deleteCOA);
router.get('/:id/transactions', getAccountLedger);
router.get('/:id/balance', getAccountBalance);

export default router;
