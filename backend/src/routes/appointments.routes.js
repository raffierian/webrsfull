import express from 'express';
import * as appointmentsController from '../controllers/appointments.controller.js';
import { verifyToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public/Optional-auth route for creating appointment
// optionalAuth: jika ada Bearer token, req.user akan terisi (login mode)
// Jika tidak ada token (guest), req.user tetap null → jalur guest
router.post('/', optionalAuth, appointmentsController.createAppointment);

// Protected routes
router.use(verifyToken);

router.get('/', appointmentsController.getUserAppointments);
router.get('/:id', appointmentsController.getAppointmentById);
router.put('/:id/cancel', appointmentsController.cancelAppointment); // Soft delete / cancel
router.delete('/:id', appointmentsController.deleteAppointment); // Hard delete

export default router;
