import express from 'express';
import * as appointmentsController from '../controllers/appointments.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// All appointment routes require authentication
router.use(verifyToken);

router.post('/', appointmentsController.createAppointment);
router.get('/', appointmentsController.getUserAppointments);
router.get('/:id', appointmentsController.getAppointmentById);
router.delete('/:id', appointmentsController.cancelAppointment);

export default router;
