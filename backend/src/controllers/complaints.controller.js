import prisma from '../config/database.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const createComplaint = async (req, res, next) => {
    try {
        const { name, email, phone, subject, message, category } = req.body;
        const userId = req.user?.id;

        console.log('Received complaint data:', { name, email, phone, subject, message, category });

        // Validate required fields
        if (!name || !email || !subject || !message) {
            console.log('Validation failed:', { name: !!name, email: !!email, subject: !!subject, message: !!message });
            return errorResponse(res, 'Nama, email, subjek, dan pesan wajib diisi', 400);
        }

        const complaint = await prisma.complaint.create({
            data: {
                userId,
                name,
                email,
                phone: phone || null,
                subject,
                message,
                category: category || 'GENERAL'
            },
        });

        return successResponse(res, complaint, 'Complaint submitted successfully', 201);
    } catch (error) {
        next(error);
    }
};

export const getComplaints = async (req, res, next) => {
    try {
        const complaints = await prisma.complaint.findMany({
            orderBy: { createdAt: 'desc' },
        });

        // Add mock ticketNumber for frontend compatibility if needed
        const formattedComplaints = complaints.map(c => ({
            ...c,
            ticketNumber: `TKT-${new Date(c.createdAt).getFullYear()}-${c.id.slice(0, 4).toUpperCase()}`
        }));

        return successResponse(res, formattedComplaints);
    } catch (error) {
        next(error);
    }
};

export const updateComplaint = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { response, status, priority } = req.body;
        const respondedBy = req.user.id;

        const complaint = await prisma.complaint.update({
            where: { id },
            data: {
                response,
                status,
                priority,
                respondedBy,
                respondedAt: new Date(),
            },
        });

        return successResponse(res, complaint, 'Complaint updated successfully');
    } catch (error) {
        next(error);
    }
};

export const getComplaintById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const complaint = await prisma.complaint.findUnique({
            where: { id },
            select: {
                id: true,
                subject: true,
                message: true,
                status: true,
                category: true,
                response: true,
                createdAt: true,
                respondedAt: true,
            },
        });

        if (!complaint) {
            return errorResponse(res, 'Complaint not found', 404);
        }

        const formattedComplaint = {
            ...complaint,
            ticketNumber: `TKT-${new Date(complaint.createdAt).getFullYear()}-${id.slice(0, 4).toUpperCase()}`
        };

        return successResponse(res, formattedComplaint);
    } catch (error) {
        next(error);
    }
};
