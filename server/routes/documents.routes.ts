
import express from 'express';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { tenantMiddleware } from '../middleware/tenant.middleware';
import { upload } from '../middleware/upload.middleware';
import { uploadDocument, getDocuments, deleteDocument, serveDocument } from '../controllers/documents.controller';

const router = express.Router();

router.use(protect);
router.use(tenantMiddleware);

// Upload (Single file)
router.post('/upload', upload.single('file'), uploadDocument);

// List Documents
// QUERY: ?entityId=123&entityType=TRANSACTION
router.get('/', getDocuments);

// Serve File Content
router.get('/:id/download', serveDocument);

// Delete Document
router.delete('/:id', deleteDocument);

export default router;
