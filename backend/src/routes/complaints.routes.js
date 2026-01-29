import express from 'express';
import * as complaintsController from '../controllers/complaints.controller.js';
import { verifyToken, requireAdmin, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', optionalAuth, complaintsController.createComplaint);
router.get('/track/:id', complaintsController.getComplaintById);
router.get('/', verifyToken, requireAdmin, complaintsController.getComplaints);
router.put('/:id', verifyToken, requireAdmin, complaintsController.updateComplaint);

export default router;
