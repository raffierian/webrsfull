import express from 'express';
import { getHospitalSettings, updateHospitalSettings } from '../controllers/hospital-settings.controller.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public endpoint - for payment page to get bank details
router.get('/', getHospitalSettings);

// Admin only - update settings
router.put('/', verifyToken, requireAdmin, updateHospitalSettings);

export default router;
