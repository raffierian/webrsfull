import express from 'express';
import * as careersController from '../controllers/careers.controller.js';

const router = express.Router();

router.get('/', careersController.getAllCareers);
router.get('/:slug', careersController.getCareerBySlug);
router.post('/:id/apply', careersController.applyForJob);

export default router;
