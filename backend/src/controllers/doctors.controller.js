import prisma from '../config/database.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response.js';

/**
 * Get all doctors
 * GET /api/doctors
 */
export const getAllDoctors = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, specialization, search, isAvailable, isActive, serviceId } = req.query;
        const skip = (page - 1) * limit;

        const where = {};

        if (serviceId) {
            const service = await prisma.service.findUnique({ where: { id: serviceId } });
            if (service) {
                where.specialization = { contains: service.name, mode: 'insensitive' };
            }
        }

        if (specialization) {
            where.specialization = { contains: specialization, mode: 'insensitive' };
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { specialization: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (isAvailable !== undefined) {
            where.isAvailable = isAvailable === 'true';
        }

        if (isActive !== undefined) {
            where.isActive = isActive === 'true';
        }

        const [doctors, total] = await Promise.all([
            prisma.doctor.findMany({
                where,
                skip: parseInt(skip),
                take: parseInt(limit),
                orderBy: { name: 'asc' },
                select: {
                    id: true,
                    name: true,
                    specialization: true,
                    photoUrl: true,
                    bio: true,
                    rating: true,
                    isAvailable: true,
                    isActive: true,
                    consultationFee: true,
                    experienceYears: true,
                    licenseNumber: true,
                    education: true,
                    schedule: true,
                },
            }),
            prisma.doctor.count({ where }),
        ]);

        return paginatedResponse(res, doctors, page, limit, total);
    } catch (error) {
        next(error);
    }
};

/**
 * Get doctor by ID
 * GET /api/doctors/:id
 */
export const getDoctorById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const doctor = await prisma.doctor.findUnique({
            where: { id },
            include: {
                schedules: {
                    where: { isActive: true },
                    include: {
                        poli: true,
                    },
                    orderBy: { dayOfWeek: 'asc' },
                },
            },
        });

        if (!doctor) {
            return errorResponse(res, 'Doctor not found', 404);
        }

        return successResponse(res, doctor);
    } catch (error) {
        next(error);
    }
};

/**
 * Get doctor schedules
 * GET /api/doctors/:id/schedules
 */
export const getDoctorSchedules = async (req, res, next) => {
    try {
        const { id } = req.params;

        const schedules = await prisma.doctorSchedule.findMany({
            where: {
                doctorId: id,
                isActive: true,
            },
            include: {
                poli: true,
                doctor: {
                    select: {
                        id: true,
                        name: true,
                        specialization: true,
                    },
                },
            },
            orderBy: { dayOfWeek: 'asc' },
        });

        return successResponse(res, schedules);
    } catch (error) {
        next(error);
    }
};
