import express from 'express';
import * as healthPromoController from '../controllers/healthPromo.controller.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', healthPromoController.getAllPromos);

// Admin routes
router.post('/', verifyToken, requireAdmin, healthPromoController.createPromo);
router.put('/:id', verifyToken, requireAdmin, healthPromoController.updatePromo);
router.delete('/:id', verifyToken, requireAdmin, healthPromoController.deletePromo);

export default router;
