import express from 'express';
import * as doctorsController from '../controllers/doctors.controller.js';

const router = express.Router();

router.get('/', doctorsController.getAllDoctors);
router.get('/:id', doctorsController.getDoctorById);
router.get('/:id/schedules', doctorsController.getDoctorSchedules);

export default router;
