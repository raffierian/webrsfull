import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import prisma from '../config/database.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { sendOTP } from '../services/email.service.js';
import crypto from 'crypto';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const authenticator = require('otplib');
import QRCode from 'qrcode';

/**
 * Register new user
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
    try {
        const { username, email, password, name, phone, dateOfBirth, gender } = req.body;

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { username },
                    { email },
                ],
            },
        });

        if (existingUser) {
            return errorResponse(res, 'Username or email already exists', 409);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                name,
                phone,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                gender,
                role: 'PATIENT',
            },
            select: {
                id: true,
                username: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
        });

        // Generate token
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
        );

        return successResponse(res, { user, token }, 'Registration successful', 201);
    } catch (error) {
        next(error);
    }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        // Find user
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { username },
                    { email: username },
                ],
            },
        });

        if (!user) {
            return errorResponse(res, 'Invalid credentials', 401);
        }

        // Check if user is active
        if (!user.isActive) {
            return errorResponse(res, 'Account is inactive', 403);
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return errorResponse(res, 'Invalid credentials', 401);
        }

        // Check for 2FA setting
        const securitySettings = await prisma.setting.findUnique({
            where: { key: 'security_settings' }
        });

        const isGlobal2FAEnabled = securitySettings?.value?.twoFactorAuth === true;

        // Check if user has 2FA enabled individually
        const isUser2FAEnabled = user.twoFactorEnabled;

        // Only enforce 2FA for ADMIN/SUPER_ADMIN/STAFF if enabled globally OR if user enabled it individually
        if (['ADMIN', 'SUPER_ADMIN', 'STAFF'].includes(user.role) && (isGlobal2FAEnabled || isUser2FAEnabled)) {
            // If global is enabled but user hasn't set up yet, we should probably force setup 
            // but for now let's assume they might need to use OTP as fallback if they haven't set up TOTP
            // However, the request is for Google Authenticator.

            if (isUser2FAEnabled && user.twoFactorSecret) {
                return successResponse(res, {
                    twoFactorRequired: true,
                    twoFactorType: 'TOTP',
                    userId: user.id
                }, '2FA TOTP code required');
            } else {
                // Fallback to Email OTP if TOTP not set up but 2FA is required
                // Generate 6-digit OTP
                const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
                const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

                await prisma.user.update({
                    where: { id: user.id },
                    data: { otpCode, otpExpires }
                });

                await sendOTP(user.email, otpCode);

                return successResponse(res, {
                    twoFactorRequired: true,
                    twoFactorType: 'EMAIL',
                    userId: user.id,
                    email: user.email.replace(/(.{2})(.*)(?=@)/, (gp1, gp2, gp3) => gp2 + '*'.repeat(gp3.length))
                }, '2FA Email OTP code required');
            }
        }

        // Generate token
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
        );

        // Remove password and 2FA secrets from response
        const { password: _, otpCode: __, otpExpires: ___, twoFactorSecret: ____, ...userWithoutPassword } = user;

        return successResponse(res, { user: userWithoutPassword, token }, 'Login successful');
    } catch (error) {
        next(error);
    }
};

/**
 * Verify OTP or TOTP
 * POST /api/auth/verify-otp
 */
export const verifyOTP = async (req, res, next) => {
    try {
        const { userId, code, type } = req.body;

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return errorResponse(res, 'User not found', 404);
        }

        if (type === 'TOTP') {
            if (!user.twoFactorSecret || !user.twoFactorEnabled) {
                return errorResponse(res, '2FA TOTP is not enabled for this user', 400);
            }

            const isValid = await authenticator.verify({
                token: code,
                secret: user.twoFactorSecret
            });

            if (!isValid) {
                return errorResponse(res, 'Invalid verification code', 400);
            }
        } else {
            // Email OTP check
            if (!user.otpCode || user.otpCode !== code) {
                return errorResponse(res, 'Invalid verification code', 400);
            }

            if (new Date() > user.otpExpires) {
                return errorResponse(res, 'Verification code has expired', 400);
            }

            // Clear OTP
            await prisma.user.update({
                where: { id: userId },
                data: { otpCode: null, otpExpires: null }
            });
        }

        // Generate final token
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
        );

        const { password: _, twoFactorSecret: __, ...userWithoutPassword } = user;

        return successResponse(res, { user: userWithoutPassword, token }, '2FA verified, login successful');
    } catch (error) {
        next(error);
    }
};

/**
 * Setup 2FA TOTP
 * POST /api/auth/2fa/setup
 */
export const setup2FA = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });

        if (!user) return errorResponse(res, 'User not found', 404);

        // Generate secret
        const secret = authenticator.generateSecret();
        const otpauth = authenticator.generateURI({
            secret,
            label: user.email,
            issuer: 'RS Soewandhie'
        });
        const qrCodeUrl = await QRCode.toDataURL(otpauth);

        // Store secret temporarily (not enabled yet)
        await prisma.user.update({
            where: { id: user.id },
            data: { twoFactorSecret: secret, twoFactorEnabled: false }
        });

        return successResponse(res, { qrCodeUrl, secret }, '2FA Setup initiated');
    } catch (error) {
        next(error);
    }
};

/**
 * Verify and Enable 2FA TOTP
 * POST /api/auth/2fa/verify
 */
export const verifyAndEnable2FA = async (req, res, next) => {
    try {
        const { code } = req.body;
        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });

        if (!user || !user.twoFactorSecret) {
            return errorResponse(res, '2FA setup not initiated', 400);
        }

        const isValid = await authenticator.verify({
            token: code,
            secret: user.twoFactorSecret
        });

        if (!isValid) {
            return errorResponse(res, 'Invalid verification code', 400);
        }

        await prisma.user.update({
            where: { id: user.id },
            data: { twoFactorEnabled: true }
        });

        return successResponse(res, null, '2FA enabled successfully');
    } catch (error) {
        next(error);
    }
};

/**
 * Disable 2FA TOTP
 * POST /api/auth/2fa/disable
 */
export const disable2FA = async (req, res, next) => {
    try {
        await prisma.user.update({
            where: { id: req.user.id },
            data: { twoFactorSecret: null, twoFactorEnabled: false }
        });

        return successResponse(res, null, '2FA disabled successfully');
    } catch (error) {
        next(error);
    }
};

/**
 * Resend Email OTP
 * POST /api/auth/resend-otp
 */
export const resendOTP = async (req, res, next) => {
    try {
        const { userId } = req.body;

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) return errorResponse(res, 'User not found', 404);

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        await prisma.user.update({
            where: { id: userId },
            data: { otpCode, otpExpires }
        });

        await sendOTP(user.email, otpCode);

        return successResponse(res, null, 'Verification code resent');
    } catch (error) {
        next(error);
    }
};

/**
 * Get current user
 * GET /api/auth/me
 */
export const getMe = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                username: true,
                email: true,
                name: true,
                role: true,
                phone: true,
                address: true,
                dateOfBirth: true,
                gender: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return successResponse(res, user);
    } catch (error) {
        next(error);
    }
};

/**
 * Update profile
 * PUT /api/auth/profile
 */
export const updateProfile = async (req, res, next) => {
    try {
        const { name, phone, address, dateOfBirth, gender, nik } = req.body;

        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                name,
                phone,
                address,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
                gender,
                nik,
            },
            select: {
                id: true,
                username: true,
                email: true,
                name: true,
                role: true,
                phone: true,
                address: true,
                dateOfBirth: true,
                gender: true,
                updatedAt: true,
            },
        });

        return successResponse(res, user, 'Profile updated successfully');
    } catch (error) {
        next(error);
    }
};

/**
 * Change password
 * PUT /api/auth/password
 */
export const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Get user with password
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
        });

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isPasswordValid) {
            return errorResponse(res, 'Current password is incorrect', 400);
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await prisma.user.update({
            where: { id: req.user.id },
            data: { password: hashedPassword },
        });

        return successResponse(res, null, 'Password changed successfully');
    } catch (error) {
        next(error);
    }
};

/**
 * Logout (client-side token removal)
 * POST /api/auth/logout
 */
export const logout = async (req, res) => {
    return successResponse(res, null, 'Logout successful');
};
