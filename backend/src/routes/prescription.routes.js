import express from 'express';
import {
    getPrescriptionBySession,
    upsertPrescription,
    issuePrescription
} from '../controllers/prescription.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

router.get('/session/:sessionId', getPrescriptionBySession);
router.post('/session/:sessionId', upsertPrescription);
router.post('/session/:sessionId/issue', issuePrescription);

export default router;
