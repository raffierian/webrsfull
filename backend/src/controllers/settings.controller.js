import prisma from '../config/database.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getSettings = async (req, res, next) => {
    try {
        const { keys } = req.query; // Optional: filter by comma-separated keys

        const where = {};
        if (keys) {
            where.key = { in: keys.split(',') };
        }

        const settings = await prisma.setting.findMany({
            where,
        });

        // Convert array to object for easier frontend consumption { key: value }
        const settingsMap = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});

        return successResponse(res, settingsMap);
    } catch (error) {
        next(error);
    }
};

export const updateSettings = async (req, res, next) => {
    try {
        const updates = req.body; // Expecting object { key: value, key2: value2 }

        const results = await Promise.all(
            Object.keys(updates).map(async (key) => {
                return prisma.setting.upsert({
                    where: { key },
                    update: { value: updates[key] },
                    create: { key, value: updates[key] },
                });
            })
        );

        return successResponse(res, results, 'Settings updated successfully');
    } catch (error) {
        next(error);
    }
};
