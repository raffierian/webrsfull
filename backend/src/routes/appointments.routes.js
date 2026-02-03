import express from 'express';
import * as appointmentsController from '../controllers/appointments.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Public route for creating appointment
router.post('/', appointmentsController.createAppointment);

// Protected routes
router.use(verifyToken);

router.get('/', appointmentsController.getUserAppointments);
router.get('/:id', appointmentsController.getAppointmentById);
router.put('/:id/cancel', appointmentsController.cancelAppointment); // Soft delete / cancel
router.delete('/:id', appointmentsController.deleteAppointment); // Hard delete

export default router;
