import express from 'express';
import * as tariffController from '../controllers/tariff.controller.js';

const router = express.Router();

router.get('/', tariffController.getAllTariffsPublic);

export default router;
