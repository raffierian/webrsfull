import express from 'express';
import * as homepageController from '../controllers/homepage.controller.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public: Get content
router.get('/:section', homepageController.getSection);

// Admin: Update content
// Protected with Admin check
router.put('/:section', verifyToken, requireAdmin, homepageController.updateSection);

export default router;
