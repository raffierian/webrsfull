import express from 'express';
import * as ppidController from '../controllers/ppid.controller.js';

const router = express.Router();

router.get('/documents', ppidController.getDocuments);

export default router;
