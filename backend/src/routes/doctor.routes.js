import express from 'express';
import {
    getMyConsultations,
    getConsultationDetails,
    closeConsultation,
    getDoctorStats
} from '../controllers/doctor-consultation.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Get my consultations (with optional status filter)
router.get('/consultations', getMyConsultations);

// Get consultation details
router.get('/consultations/:id', getConsultationDetails);

// Close consultation
router.put('/consultations/:id/close', closeConsultation);

// Get statistics
router.get('/stats', getDoctorStats);

export default router;