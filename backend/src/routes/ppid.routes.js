import express from 'express';
import * as ppidController from '../controllers/ppid.controller.js';
import { verifyToken, requireAdmin, requirePpidAccess } from '../middleware/auth.js';

const router = express.Router();

router.get('/', ppidController.getDocuments);
router.post('/', verifyToken, requirePpidAccess, ppidController.createDocument);
router.put('/:id', verifyToken, requirePpidAccess, ppidController.updateDocument);
router.delete('/:id', verifyToken, requirePpidAccess, ppidController.deleteDocument);

export default router;
