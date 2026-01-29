import express from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { excelUpload } from '../middleware/upload.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(verifyToken);
router.use(requireAdmin);

// Dashboard
router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/dashboard/visits', adminController.getVisitTrends);
router.get('/dashboard/poli', adminController.getPoliDistribution);
router.post('/dashboard/stats', adminController.updateDailyStats);

// Appointments
router.get('/appointments', adminController.getAllAppointments);
router.put('/appointments/:id', adminController.updateAppointmentStatus);

// Doctors
router.post('/doctors', adminController.createDoctor);
router.post('/doctors/import', excelUpload.single('file'), adminController.importDoctors);
router.put('/doctors/:id', adminController.updateDoctor);
router.delete('/doctors/:id', adminController.deleteDoctor);

// Articles
router.get('/articles', adminController.getAllArticlesAdmin);
router.post('/articles', adminController.createArticle);
router.put('/articles/:id', adminController.updateArticle);
router.delete('/articles/:id', adminController.deleteArticle);
router.put('/articles/:id/publish', adminController.toggleArticlePublish);

// Users
router.get('/users', adminController.getAllUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.put('/users/:id/role', adminController.updateUserRole);

// Complaints
router.get('/complaints', adminController.getAllComplaintsAdmin);
router.put('/complaints/:id/respond', adminController.respondToComplaint);
router.delete('/complaints/:id', adminController.deleteComplaint);

// Services
router.get('/services', adminController.getAllServicesAdmin);
router.post('/services', adminController.createService);
router.put('/services/:id', adminController.updateService);
router.delete('/services/:id', adminController.deleteService);

// Tariffs
router.get('/tariffs', adminController.getAllTariffs);
router.post('/tariffs', adminController.createTariff);
router.post('/tariffs/import', excelUpload.single('file'), adminController.importTariffs);
router.put('/tariffs/:id', adminController.updateTariff);
router.delete('/tariffs/:id', adminController.deleteTariff);

// Trainings
router.get('/trainings', adminController.getAllTrainingsAdmin);
router.post('/trainings', adminController.createTraining);
router.put('/trainings/:id', adminController.updateTraining);
router.delete('/trainings/:id', adminController.deleteTraining);

export default router;
