import express from 'express';
import * as doctorsController from '../controllers/doctors.controller.js';

import { verifyToken, requireRole } from '../middleware/auth.js';
import * as reviewController from '../controllers/reviews.controller.js';

const router = express.Router();

router.get('/', doctorsController.getAllDoctors);
router.get('/:id', doctorsController.getDoctorById);
router.get('/:id/schedules', doctorsController.getDoctorSchedules);

// Reviews
router.get('/:doctorId/reviews', reviewController.getDoctorReviews);
router.post('/:doctorId/reviews', verifyToken, reviewController.createReview);

export default router;
