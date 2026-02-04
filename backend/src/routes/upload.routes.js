import express from 'express';
import { uploadFile } from '../controllers/upload.controller.js';
import { upload } from '../middleware/upload.js';
import { verifyToken, requireAdmin, requirePpidAccess } from '../middleware/auth.js';

const router = express.Router();

// Upload single file
// Protected: Allow Admin, PKRS, Staff
router.post('/', verifyToken, requirePpidAccess, upload.single('file'), uploadFile);

export default router;
