import express from 'express';
import * as articlesController from '../controllers/articles.controller.js';

const router = express.Router();

router.get('/', articlesController.getAllArticles);
router.get('/:slug', articlesController.getArticleBySlug);

export default router;
