import prisma from '../config/database.js';
import { successResponse, paginatedResponse } from '../utils/response.js';

export const getAllCareers = async (req, res, next) => {
    try {
        const careers = await prisma.career.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
        });
        return successResponse(res, careers);
    } catch (error) {
        next(error);
    }
};

export const getCareerBySlug = async (req, res, next) => {
    try {
        const career = await prisma.career.findUnique({
            where: { slug: req.params.slug },
        });
        return successResponse(res, career);
    } catch (error) {
        next(error);
    }
};

export const applyForJob = async (req, res, next) => {
    try {
        const { careerId, name, email, phone, coverLetter } = req.body;

        const application = await prisma.jobApplication.create({
            data: { careerId, name, email, phone, coverLetter },
        });

        return successResponse(res, application, 'Application submitted successfully', 201);
    } catch (error) {
        next(error);
    }
};
