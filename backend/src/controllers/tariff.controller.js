import prisma from '../config/database.js';
import { successResponse } from '../utils/response.js';

export const getAllTariffsPublic = async (req, res, next) => {
    try {
        const tariffs = await prisma.tariff.findMany({
            where: { isActive: true },
            orderBy: { category: 'asc' },
        });
        return successResponse(res, tariffs);
    } catch (error) {
        next(error);
    }
};
