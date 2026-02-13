import express from 'express';
import * as statsController from '../controllers/stats.controller.js';

const router = express.Router();

router.post('/visitor', statsController.trackVisitor);

export default router;
