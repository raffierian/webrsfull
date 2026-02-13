import prisma from '../config/database.js';
import { successResponse } from '../utils/response.js';

export const trackVisitor = async (req, res, next) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const stats = await prisma.dailyStat.upsert({
            where: {
                date: today,
            },
            update: {
                visitorCount: { increment: 1 },
            },
            create: {
                date: today,
                visitorCount: 1,
            },
        });

        return successResponse(res, stats, 'Visitor tracked successfully');
    } catch (error) {
        next(error);
    }
};
