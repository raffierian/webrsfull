import prisma from '../config/database.js';
import { successResponse, errorResponse } from '../utils/response.js';

// GET /api/doctor/consultations - List my consultations
export const getMyConsultations = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get doctor record for this user
        const doctor = await prisma.doctor.findUnique({
            where: { userId }
        });

        if (!doctor) {
            return errorResponse(res, 'Doctor profile not found', 404);
        }

        const { status } = req.query;

        const where = { doctorId: doctor.id };
        if (status && status !== 'all') {
            where.status = status.toUpperCase();
        }

        const sessions = await prisma.chatSession.findMany({
            where,
            include: {
                patient: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        gender: true,
                        dateOfBirth: true
                    }
                },
                payment: {
                    select: {
                        status: true,
                        amount: true,
                        paymentMethod: true,
                        paidAt: true
                    }
                },
                _count: {
                    select: { messages: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return successResponse(res, sessions, 'Consultations retrieved successfully');
    } catch (error) {
        console.error('Get consultations error:', error);
        return errorResponse(res, error.message, 500);
    }
};

// GET /api/doctor/consultations/:id - Get consultation details
export const getConsultationDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const doctor = await prisma.doctor.findUnique({
            where: { userId }
        });

        if (!doctor) {
            return errorResponse(res, 'Doctor profile not found', 404);
        }

        const session = await prisma.chatSession.findFirst({
            where: {
                id,
                doctorId: doctor.id
            },
            include: {
                patient: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        email: true,
                        gender: true,
                        dateOfBirth: true,
                        address: true
                    }
                },
                payment: true,
                messages: {
                    orderBy: { createdAt: 'asc' },
                    include: {
                        sender: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            }
        });

        if (!session) {
            return errorResponse(res, 'Consultation not found', 404);
        }

        // If session is PENDING (paid but not yet answered), set to ACTIVE
        if (session.status === 'PENDING') {
            await prisma.chatSession.update({
                where: { id },
                data: { status: 'ACTIVE' }
            });
            session.status = 'ACTIVE';
        }

        return successResponse(res, session, 'Consultation details retrieved');
    } catch (error) {
        console.error('Get consultation details error:', error);
        return errorResponse(res, error.message, 500);
    }
};

// PUT /api/doctor/consultations/:id/close - Close consultation
export const closeConsultation = async (req, res) => {
    try {
        const { id } = req.params;
        const { notes } = req.body;
        const userId = req.user.id;

        const doctor = await prisma.doctor.findUnique({
            where: { userId }
        });

        if (!doctor) {
            return errorResponse(res, 'Doctor profile not found', 404);
        }

        // Verify this session belongs to this doctor
        const existingSession = await prisma.chatSession.findFirst({
            where: {
                id,
                doctorId: doctor.id
            }
        });

        if (!existingSession) {
            return errorResponse(res, 'Consultation not found or unauthorized', 404);
        }

        if (existingSession.status === 'CLOSED') {
            return errorResponse(res, 'Consultation already closed', 400);
        }

        const session = await prisma.chatSession.update({
            where: { id },
            data: {
                status: 'CLOSED',
                closedAt: new Date(),
                closingNotes: notes || null
            },
            include: {
                patient: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        return successResponse(res, session, 'Consultation closed successfully');
    } catch (error) {
        console.error('Close consultation error:', error);
        return errorResponse(res, error.message, 500);
    }
};

// GET /api/doctor/stats - Get doctor statistics
export const getDoctorStats = async (req, res) => {
    try {
        const userId = req.user.id;

        const doctor = await prisma.doctor.findUnique({
            where: { userId }
        });

        if (!doctor) {
            return errorResponse(res, 'Doctor profile not found', 404);
        }

        const [total, active, pending, closed] = await Promise.all([
            prisma.chatSession.count({ where: { doctorId: doctor.id } }),
            prisma.chatSession.count({ where: { doctorId: doctor.id, status: 'ACTIVE' } }),
            prisma.chatSession.count({ where: { doctorId: doctor.id, status: 'PENDING' } }),
            prisma.chatSession.count({ where: { doctorId: doctor.id, status: 'CLOSED' } })
        ]);

        const stats = {
            total,
            active,
            pending,
            closed
        };

        return successResponse(res, stats, 'Statistics retrieved');
    } catch (error) {
        console.error('Get stats error:', error);
        return errorResponse(res, error.message, 500);
    }
};
