import express from 'express';
import authRoutes from './auth.routes.js';
import doctorsRoutes from './doctors.routes.js';
import appointmentsRoutes from './appointments.routes.js';
import servicesRoutes from './services.routes.js';
import articlesRoutes from './articles.routes.js';
import complaintsRoutes from './complaints.routes.js';
import careersRoutes from './careers.routes.js';
import surveysRoutes from './surveys.routes.js';
import ppidRoutes from './ppid.routes.js';
import trainingRoutes from './training.routes.js';
import consultationsRoutes from './consultations.routes.js';
import adminRoutes from './admin.routes.js';
import settingsRoutes from './settings.routes.js';
import healthPromoRoutes from './healthPromo.routes.js';
import homepageRoutes from './homepage.routes.js';
import uploadRoutes from './upload.routes.js';
import tariffRoutes from './tariff.routes.js';
import chatRoutes from './chat.routes.js';
import inpatientRoomsRoutes from './inpatientRooms.routes.js';
import searchRoutes from './search.routes.js';
import roleMenuRoutes from './roleMenu.routes.js';
import roleRoutes from './role.routes.js';
import consultationChatRoutes from './consultation-chat.routes.js';
import paymentRoutes from './payment.routes.js';
import hospitalSettingsRoutes from './hospital-settings.routes.js';
import doctorRoutes from './doctor.routes.js';
import statsRoutes from './stats.routes.js';

const router = express.Router();

// API Info
router.get('/', (req, res) => {
    res.json({
        name: 'RS Soewandhie API',
        version: '1.0.0',
        description: 'Hospital Management System API',
        endpoints: {
            auth: '/api/auth',
            doctors: '/api/doctors',
            appointments: '/api/appointments',
            services: '/api/services',
            articles: '/api/articles',
            complaints: '/api/complaints',
            careers: '/api/careers',
            surveys: '/api/surveys',
            ppid: '/api/ppid',
            training: '/api/training',
            consultations: '/api/consultations',
            admin: '/api/admin',
            chat: '/api/chat',
            inpatientRooms: '/api/inpatient-rooms',
            consultationChat: '/api/consultation-chat',
        },
    });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/doctors', doctorsRoutes);
router.use('/appointments', appointmentsRoutes);
router.use('/services', servicesRoutes);
router.use('/articles', articlesRoutes);
router.use('/complaints', complaintsRoutes);
router.use('/careers', careersRoutes);
router.use('/surveys', surveysRoutes);
router.use('/ppid', ppidRoutes);
router.use('/training', trainingRoutes);
router.use('/consultations', consultationsRoutes);
router.use('/admin', adminRoutes);
router.use('/settings', settingsRoutes);
router.use('/health-promos', healthPromoRoutes);
router.use('/homepage', homepageRoutes);
router.use('/upload', uploadRoutes);
router.use('/tariffs', tariffRoutes);
router.use('/chat', chatRoutes);
router.use('/inpatient-rooms', inpatientRoomsRoutes);
router.use('/search', searchRoutes);
router.use('/role-menus', roleMenuRoutes);
router.use('/consultation-chat', consultationChatRoutes); // Realtime Chat
router.use('/', paymentRoutes); // Payment routes (includes /payments and /admin/payments)
router.use('/hospital-settings', hospitalSettingsRoutes);
router.use('/doctor', doctorRoutes);
router.use('/roles', roleRoutes);
router.use('/stats', statsRoutes);
export default router;
