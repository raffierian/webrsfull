import prisma from '../config/database.js';
import { successResponse, paginatedResponse } from '../utils/response.js';

export const getAllServices = async (req, res, next) => {
    try {
        const { type } = req.query;
        const where = { isActive: true };

        if (type) where.type = type.toUpperCase();

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
