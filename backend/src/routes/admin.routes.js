import express from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { verifyToken, requireAdmin, requireRole, requireMenuAccess } from '../middleware/auth.js';
import { excelUpload } from '../middleware/upload.js';

const router = express.Router();

// All admin routes require authentication
router.use(verifyToken);

// --- SPECIFIC ACCESS ROUTES ---

// Trainings (Accessible by Admin, Super Admin, and anyone with '/admin/training' menu access)
const requireTrainingAccess = requireMenuAccess('/admin/training'); // Key from DB: '/admin/training'

router.get('/trainings', requireTrainingAccess, adminController.getAllTrainingsAdmin);
router.post('/trainings', requireTrainingAccess, adminController.createTraining);
router.put('/trainings/:id', requireTrainingAccess, adminController.updateTraining);
router.delete('/trainings/:id', requireTrainingAccess, adminController.deleteTraining);

// --- GENERAL ADMIN ROUTES ---

// Remove global requireAdmin to allow granular access
// router.use(requireAdmin);

// Dashboard
const requireDashboard = requireMenuAccess('/admin/dashboard');
router.get('/dashboard/stats', requireDashboard, adminController.getDashboardStats);
router.get('/dashboard/visits', requireDashboard, adminController.getVisitTrends);
router.get('/dashboard/poli', requireDashboard, adminController.getPoliDistribution);
router.post('/dashboard/stats', requireDashboard, adminController.updateDailyStats);

// Appointments
const requireAppointments = requireMenuAccess('/admin/appointments');
router.get('/appointments', requireAppointments, adminController.getAllAppointments);
router.put('/appointments/:id', requireAppointments, adminController.updateAppointmentStatus);

// Doctors
const requireDoctors = requireMenuAccess('/admin/doctors');
router.post('/doctors', requireDoctors, adminController.createDoctor);
router.post('/doctors/import', excelUpload.single('file'), requireDoctors, adminController.importDoctors);
router.put('/doctors/:id', requireDoctors, adminController.updateDoctor);
router.delete('/doctors/:id', requireDoctors, adminController.deleteDoctor);

// Articles
const requireArticles = requireMenuAccess('/admin/articles');
router.get('/articles', requireArticles, adminController.getAllArticlesAdmin);
router.post('/articles', requireArticles, adminController.createArticle);
router.put('/articles/:id', requireArticles, adminController.updateArticle);
router.delete('/articles/:id', requireArticles, adminController.deleteArticle);
router.put('/articles/:id/publish', requireArticles, adminController.toggleArticlePublish);

// Users
const requireUsers = requireMenuAccess('/admin/users');
router.get('/users', requireUsers, adminController.getAllUsers);
router.post('/users', requireUsers, adminController.createUser);
router.put('/users/:id', requireUsers, adminController.updateUser);
router.delete('/users/:id', requireUsers, adminController.deleteUser);
router.put('/users/:id/role', requireUsers, adminController.updateUserRole);

// Complaints
const requireComplaints = requireMenuAccess('/admin/complaints');
router.get('/complaints', requireComplaints, adminController.getAllComplaintsAdmin);
router.put('/complaints/:id/respond', requireComplaints, adminController.respondToComplaint);
router.delete('/complaints/:id', requireComplaints, adminController.deleteComplaint);

// Services
const requireServices = requireMenuAccess('/admin/services');
router.get('/services', requireServices, adminController.getAllServicesAdmin);
router.post('/services', requireServices, adminController.createService);
router.put('/services/:id', requireServices, adminController.updateService);
router.delete('/services/:id', requireServices, adminController.deleteService);

// Tariffs
const requireTariffs = requireMenuAccess('/admin/tariffs');
router.get('/tariffs', requireTariffs, adminController.getAllTariffs);
router.post('/tariffs', requireTariffs, adminController.createTariff);
router.post('/tariffs/import', excelUpload.single('file'), requireTariffs, adminController.importTariffs);
router.put('/tariffs/:id', requireTariffs, adminController.updateTariff);
router.delete('/tariffs/:id', requireTariffs, adminController.deleteTariff);

export default router;
