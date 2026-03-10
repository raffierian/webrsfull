import express from 'express';
import * as chatController from '../controllers/consultation-chat.controller.js';
import { verifyToken, optionalAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Create session (optional auth for guest)
router.post('/sessions', optionalAuth, chatController.createSession);

// Protected routes (require auth)
router.get('/sessions', verifyToken, chatController.getMySessions);
router.get('/sessions/:sessionId', verifyToken, chatController.getSession);
router.get('/sessions/:sessionId/messages', verifyToken, chatController.getMessages);
router.patch('/sessions/:sessionId/soap', verifyToken, chatController.updateSOAP);
router.post('/sessions/:sessionId/close', verifyToken, chatController.closeSession);

// Admin routes
router.delete('/admin/sessions/:sessionId', verifyToken, requireAdmin, chatController.deleteSession);

export default router;

