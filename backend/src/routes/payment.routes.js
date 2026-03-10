import express from 'express';
import { requireAuth, requireAdmin, optionalAuth } from '../middleware/auth.js';
import * as paymentController from '../controllers/payment.controller.js';

const router = express.Router();

// Patient routes
router.post('/payments', optionalAuth, paymentController.createPayment);
router.post('/payments/:paymentId/proof', requireAuth, paymentController.uploadPaymentProof);
router.get('/payments/:paymentId/status', requireAuth, paymentController.getPaymentStatus);

// Webhook (no auth, verified by Midtrans signature)
router.post('/payments/midtrans/notification', paymentController.handleMidtransNotification);

// Admin routes
router.get('/admin/payments', requireAdmin, paymentController.getAllPayments);
router.put('/admin/payments/:paymentId/confirm', requireAdmin, paymentController.confirmManualPayment);
router.delete('/admin/payments/:paymentId', requireAdmin, paymentController.deletePayment);

export default router;
