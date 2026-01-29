import prisma from '../config/database.js';
import { successResponse } from '../utils/response.js';

export const getAllPrograms = async (req, res, next) => {
    try {
        const programs = await prisma.trainingProgram.findMany({
            where: { isActive: true },
            orderBy: { startDate: 'desc' },
        });
        return successResponse(res, programs);
    } catch (error) {
        next(error);
    }
};

export const getProgramBySlug = async (req, res, next) => {
    try {
        const program = await prisma.trainingProgram.findUnique({
            where: { slug: req.params.slug },
        });
        return successResponse(res, program);
    } catch (error) {
        next(error);
    }
};
