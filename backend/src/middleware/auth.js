import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { errorResponse } from '../utils/response.js';
import prisma from '../config/database.js';

/**
 * Verify JWT Token Middleware
 */
export const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization;
        console.log('--- Auth Debug ---');
        console.log('Method:', req.method);
        console.log('Path:', req.path);
        console.log('Auth Header:', authHeader);

        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
            console.log('Result: No token provided');
            return errorResponse(res, 'No token provided', 401);
        }
        console.log('Token found, length:', token.length);

        const decoded = jwt.verify(token, config.jwt.secret);

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                username: true,
                email: true,
                name: true,
                role: true, // Keep for backward compatibility if needed, or remove
                roleId: true,
                userRole: {
                    select: {
                        name: true,
                        roleMenu: {
                            select: {
                                menus: true
                            }
                        }
                    }
                },
                isActive: true,
            },
        });

        if (!user || !user.isActive) {
            return errorResponse(res, 'User not found or inactive', 401);
        }

        // Map dynamic role name to req.user.role for compatibility
        if (user.userRole) {
            user.role = user.userRole.name;
            // Attach allowed menus to user object
            user.allowedMenus = user.userRole.roleMenu ? user.userRole.roleMenu.menus : [];
        } else {
            user.allowedMenus = [];
        }

        req.user = user;
        next();
    } catch (error) {
        return errorResponse(res, 'Invalid or expired token', 401);
    }
};

/**
 * Check if user has required role
 */
export const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            console.log('Access Denied: No user found in request');
            return errorResponse(res, 'Unauthorized', 401);
        }

        console.log(`Checking Role: User=${req.user.username}, Role=${req.user.role}, Required=[${roles.join(', ')}]`);

        if (!roles.includes(req.user.role)) {
            console.log(`Access Forbidden: User role '${req.user.role}' is not in allowed roles: [${roles.join(', ')}]`);
            return errorResponse(res, 'Forbidden - Insufficient permissions', 403);
        }

        next();
    };
};

/**
 * Check if user has access to a specific menu
 */
export const requireMenuAccess = (menuKey) => {
    return (req, res, next) => {
        if (!req.user) {
            return errorResponse(res, 'Unauthorized', 401);
        }

        // SUPER_ADMIN has access to everything
        if (req.user.role === 'SUPER_ADMIN') {
            return next();
        }

        // Specific Roles Bypass (Optional, if you trust ADMIN to have all access)
        if (req.user.role === 'ADMIN') {
            return next();
        }

        const allowedMenus = req.user.allowedMenus || [];

        // Debugging
        // console.log(`Checking Menu Access: User=${req.user.username}, Required=${menuKey}, Allowed=${JSON.stringify(allowedMenus)}`);

        if (allowedMenus.includes(menuKey)) {
            return next();
        }

        return errorResponse(res, 'Forbidden - Insufficient permissions', 403);
    };
};

/**
 * Check if user is admin
 */
export const requireAdmin = requireRole('ADMIN', 'SUPER_ADMIN');

/**
 * Check if user has PPID access (Admin, Super Admin, PKRS, Staff, Mutu)
 */
export const requirePpidAccess = requireRole('ADMIN', 'SUPER_ADMIN', 'PKRS', 'STAFF', 'MUTU');

/**
 * Optional authentication (doesn't fail if no token)
 */
export const optionalAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (token) {
            const decoded = jwt.verify(token, config.jwt.secret);
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    name: true,
                    role: true,
                },
            });

            if (user) {
                req.user = user;
            }
        }

        next();
    } catch (error) {
        // Continue without user
        next();
    }
};
