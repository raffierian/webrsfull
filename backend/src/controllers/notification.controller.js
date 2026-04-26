import prisma from '../config/database.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Get current user's notifications
 */
export const getMyNotifications = async (req, res) => {
    try {
        const userId = req.user.id;

        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50 // Limit to last 50
        });

        return successResponse(res, notifications, 'Notifications retrieved');
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};

/**
 * Mark a notification as read
 */
export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        await prisma.notification.update({
            where: {
                id,
                userId // Ensure user only marks their own
            },
            data: { isRead: true }
        });

        return successResponse(res, null, 'Notification marked as read');
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;

        await prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true }
        });

        return successResponse(res, null, 'All notifications marked as read');
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        await prisma.notification.delete({
            where: {
                id,
                userId
            }
        });

        return successResponse(res, null, 'Notification deleted');
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};

/**
 * Helper function to create notification (not an endpoint)
 */
export const createInternalNotification = async (userId, title, body, type = 'GENERAL', data = null) => {
    try {
        return await prisma.notification.create({
            data: {
                userId,
                title,
                body,
                type,
                data: data || {}
            }
        });
    } catch (error) {
        console.error('Error creating internal notification:', error);
    }
};
