import express from 'express';
import * as surveysController from '../controllers/surveys.controller.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/questions', surveysController.getQuestions);
router.get('/stats', surveysController.getSurveyStats);
router.post('/', optionalAuth, surveysController.submitSurvey);

export default router;
