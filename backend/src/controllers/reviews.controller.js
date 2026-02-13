import prisma from '../config/database.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const createReview = async (req, res, next) => {
    try {
        const { doctorId } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user.id;

        if (!rating || rating < 1 || rating > 5) {
            return errorResponse(res, 'Rating must be between 1 and 5', 400);
        }

        // Check if doctor exists
        const doctor = await prisma.doctor.findUnique({
            where: { id: doctorId }
        });

        if (!doctor) {
            return errorResponse(res, 'Doctor not found', 404);
        }

        // Check if patient has a COMPLETED appointment with this doctor
        const appointment = await prisma.appointment.findFirst({
            where: {
                patientId: userId,
                doctorId: doctorId,
                status: 'COMPLETED'
            }
        });

        if (!appointment) {
            return errorResponse(res, 'Anda hanya dapat memberikan ulasan setelah menyelesaikan janji temu dengan dokter ini.', 403);
        }

        // Check if already reviewed? (Optional, maybe allow one review per appointment or one per doctor)
        // For now, let's allow multiple or just proceed. Users might want to review again for next visit.
        // But maybe limit to one review?
        // Let's stick to the requirement: "patient who receives service".

        // Create review
        const review = await prisma.review.create({
            data: {
                userId,
                doctorId,
                rating: parseInt(rating),
                comment
            }
        });

        // Recalculate average rating
        const aggregations = await prisma.review.aggregate({
            _avg: {
                rating: true
            },
            where: {
                doctorId
            }
        });

        const newRating = aggregations._avg.rating || 0;

        // Update doctor rating
        await prisma.doctor.update({
            where: { id: doctorId },
            data: {
                rating: newRating
            }
        });

        return successResponse(res, review, 'Review submitted successfully', 201);
    } catch (error) {
        next(error);
    }
};

export const getDoctorReviews = async (req, res, next) => {
    try {
        const { doctorId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const [reviews, total] = await Promise.all([
            prisma.review.findMany({
                where: { doctorId },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            // don't expose sensitive info
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip: parseInt(skip),
                take: parseInt(limit)
            }),
            prisma.review.count({ where: { doctorId } })
        ]);

        return successResponse(res, {
            reviews,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};
