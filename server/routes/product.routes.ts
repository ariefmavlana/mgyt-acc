import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct
} from '../controllers/product.controller';

const router = Router();

router.use(protect);

router.get('/', getProducts);
router.post('/', createProduct);
router.get('/:id', getProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
