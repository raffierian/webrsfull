import prisma from '../config/database.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response.js';

/**
 * Create appointment
 * POST /api/appointments
 */
export const createAppointment = async (req, res, next) => {
    try {
        const { doctorId, poliId, appointmentDate, appointmentTime, complaint } = req.body;
        const patientId = req.user.id;

        // Check if doctor exists and is available
        const doctor = await prisma.doctor.findUnique({
            where: { id: doctorId },
        });

        if (!doctor || !doctor.isAvailable) {
            return errorResponse(res, 'Doctor not available', 400);
        }

        // Check for existing appointment at the same time
        const existingAppointment = await prisma.appointment.findFirst({
            where: {
                doctorId,
                appointmentDate: new Date(appointmentDate),
                appointmentTime,
                status: { in: ['PENDING', 'CONFIRMED', 'WAITING'] },
            },
        });

        if (existingAppointment) {
            return errorResponse(res, 'Time slot already booked', 409);
        }

        // Get queue number for the day
        const appointmentsCount = await prisma.appointment.count({
            where: {
                doctorId,
                appointmentDate: new Date(appointmentDate),
            },
        });

        const appointment = await prisma.appointment.create({
            data: {
                patientId,
                doctorId,
                poliId,
                appointmentDate: new Date(appointmentDate),
                appointmentTime,
                complaint,
                queueNumber: appointmentsCount + 1,
                status: 'PENDING',
            },
            include: {
                doctor: {
                    select: {
                        id: true,
                        name: true,
                        specialization: true,
                    },
                },
                poli: true,
            },
        });

        return successResponse(res, appointment, 'Appointment created successfully', 201);
    } catch (error) {
        next(error);
    }
};

/**
 * Get user appointments
 * GET /api/appointments
 */
export const getUserAppointments = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const skip = (page - 1) * limit;
        const userId = req.user.id;

        const where = { patientId: userId };

        if (status) {
            where.status = status;
        }

        const [appointments, total] = await Promise.all([
            prisma.appointment.findMany({
                where,
                skip: parseInt(skip),
                take: parseInt(limit),
                orderBy: { appointmentDate: 'desc' },
                include: {
                    doctor: {
                        select: {
                            id: true,
                            name: true,
                            specialization: true,
                            photoUrl: true,
                        },
                    },
                    poli: true,
                },
            }),
            prisma.appointment.count({ where }),
        ]);

        return paginatedResponse(res, appointments, page, limit, total);
    } catch (error) {
        next(error);
    }
};

/**
 * Get appointment by ID
 * GET /api/appointments/:id
 */
export const getAppointmentById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const appointment = await prisma.appointment.findUnique({
            where: { id },
            include: {
                patient: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                doctor: {
                    select: {
                        id: true,
                        name: true,
                        specialization: true,
                        photoUrl: true,
                    },
                },
                poli: true,
            },
        });

        if (!appointment) {
            return errorResponse(res, 'Appointment not found', 404);
        }

        // Check if user owns this appointment or is admin
        if (appointment.patientId !== req.user.id && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
            return errorResponse(res, 'Forbidden', 403);
        }

        return successResponse(res, appointment);
    } catch (error) {
        next(error);
    }
};

/**
 * Cancel appointment
 * DELETE /api/appointments/:id
 */
export const cancelAppointment = async (req, res, next) => {
    try {
        const { id } = req.params;

        const appointment = await prisma.appointment.findUnique({
            where: { id },
        });

        if (!appointment) {
            return errorResponse(res, 'Appointment not found', 404);
        }

        // Check if user owns this appointment
        if (appointment.patientId !== req.user.id) {
            return errorResponse(res, 'Forbidden', 403);
        }

        // Can only cancel pending or confirmed appointments
        if (!['PENDING', 'CONFIRMED'].includes(appointment.status)) {
            return errorResponse(res, 'Cannot cancel this appointment', 400);
        }

        const updatedAppointment = await prisma.appointment.update({
            where: { id },
            data: { status: 'CANCELLED' },
        });

        return successResponse(res, updatedAppointment, 'Appointment cancelled successfully');
    } catch (error) {
        next(error);
    }
};
