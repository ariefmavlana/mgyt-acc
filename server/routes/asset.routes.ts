import express from 'express';
import { protect } from '../middleware/auth.middleware';
import {
    getAssets,
    getAssetById,
    createAsset,
    calculateDepreciation,
    deleteAsset
} from '../controllers/asset.controller';

const router = express.Router();

router.use(protect);

router.get('/', getAssets);
router.get('/:id', getAssetById);
router.post('/', createAsset);
router.post('/:id/depreciate', calculateDepreciation);
router.delete('/:id', deleteAsset);

export default router;
