import prisma from '../config/database.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response.js';

export const getAllPromos = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, type, search } = req.query;
        const skip = (page - 1) * limit;

        const where = {};
        if (type && type !== 'all') where.type = type;
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [promos, total] = await Promise.all([
            prisma.healthPromo.findMany({
                where,
                skip: parseInt(skip),
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' },
            }),
            prisma.healthPromo.count({ where }),
        ]);

        return paginatedResponse(res, promos, page, limit, total);
    } catch (error) {
        next(error);
    }
};

export const createPromo = async (req, res, next) => {
    try {
        const { title, type, description, fileUrl, thumbnailUrl } = req.body;

        const promo = await prisma.healthPromo.create({
            data: {
                title,
                type,
                description,
                fileUrl,
                thumbnailUrl,
            },
        });

        return successResponse(res, promo, 'Media created successfully', 201);
    } catch (error) {
        next(error);
    }
};

export const updatePromo = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const promo = await prisma.healthPromo.update({
            where: { id },
            data,
        });

        return successResponse(res, promo, 'Media updated successfully');
    } catch (error) {
        next(error);
    }
};

export const deletePromo = async (req, res, next) => {
    try {
        const { id } = req.params;

        await prisma.healthPromo.delete({
            where: { id },
        });

        return successResponse(res, null, 'Media deleted successfully');
    } catch (error) {
        next(error);
    }
};
