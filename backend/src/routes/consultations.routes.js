import express from 'express';
import * as consultationsController from '../controllers/consultations.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', verifyToken, consultationsController.createConsultation);

export default router;
