import prisma from '../config/database.js';
import { successResponse, paginatedResponse } from '../utils/response.js';

export const getAllServices = async (req, res, next) => {
    try {
        const { type, isFeatured, isBookable } = req.query;
        const where = { isActive: true };
        // const where = {};

        if (type) where.type = type.toUpperCase();
        if (isFeatured) where.isFeatured = isFeatured === 'true';
        if (isBookable) where.isBookable = isBookable === 'true';

        const services = await prisma.service.findMany({
            where,
            orderBy: { name: 'asc' },
        });

        return successResponse(res, services);
    } catch (error) {
        next(error);
    }
};

export const getServiceBySlug = async (req, res, next) => {
    try {
        const service = await prisma.service.findUnique({
            where: { slug: req.params.slug },
        });

        if (!service) {
            return errorResponse(res, 'Service not found', 404);
        }

        return successResponse(res, service);
    } catch (error) {
        next(error);
    }
};
