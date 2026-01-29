import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-otp', authController.verifyOTP);
router.post('/resend-otp', authController.resendOTP);

// Protected routes
router.get('/me', verifyToken, authController.getMe);
router.put('/profile', verifyToken, authController.updateProfile);
router.put('/password', verifyToken, authController.changePassword);
router.post('/2fa/setup', verifyToken, authController.setup2FA);
router.post('/2fa/verify', verifyToken, authController.verifyAndEnable2FA);
router.post('/2fa/disable', verifyToken, authController.disable2FA);
router.post('/logout', verifyToken, authController.logout);

export default router;
