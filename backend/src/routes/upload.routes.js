import express from 'express';
import { uploadFile } from '../controllers/upload.controller.js';
import { upload } from '../middleware/upload.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Upload single file
// Protected: Only admin can upload for now
router.post('/', verifyToken, requireAdmin, upload.single('file'), uploadFile);

export default router;
