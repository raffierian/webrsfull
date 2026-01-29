import express from 'express';
import * as trainingController from '../controllers/training.controller.js';

const router = express.Router();

router.get('/', trainingController.getAllPrograms);
router.get('/:slug', trainingController.getProgramBySlug);

export default router;
