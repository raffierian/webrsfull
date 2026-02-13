import prisma from '../config/database.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getPrescriptionBySession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const prescription = await prisma.prescription.findUnique({
            where: { sessionId },
            include: { items: true }
        });

        if (!prescription) {
            return successResponse(res, null, 'No prescription found for this session');
        }

        return successResponse(res, prescription, 'Prescription retrieved successfully');
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};

export const upsertPrescription = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { notes, items } = req.body; // items: [{ medicineName, dosage, instruction, quantity }]

        const session = await prisma.chatSession.findUnique({
            where: { id: sessionId },
            include: { doctor: true }
        });

        if (!session) return errorResponse(res, 'Session not found', 404);

        // Authorization: Only assigned doctor or admin
        const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);
        const isDoctor = session.doctorId === req.user.id;
        if (!isAdmin && !isDoctor) return errorResponse(res, 'Unauthorized', 403);

        const prescription = await prisma.prescription.upsert({
            where: { sessionId },
            update: {
                notes,
                items: {
                    deleteMany: {},
                    create: items.map(item => ({
                        medicineName: item.medicineName,
                        dosage: item.dosage,
                        instruction: item.instruction,
                        quantity: parseInt(item.quantity)
                    }))
                }
            },
            create: {
                sessionId,
                patientId: session.patientId,
                doctorId: session.doctorId,
                notes,
                status: 'DRAFT',
                items: {
                    create: items.map(item => ({
                        medicineName: item.medicineName,
                        dosage: item.dosage,
                        instruction: item.instruction,
                        quantity: parseInt(item.quantity)
                    }))
                }
            },
            include: { items: true }
        });

        return successResponse(res, prescription, 'Prescription saved successfully');
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};

export const issuePrescription = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await prisma.chatSession.findUnique({
            where: { id: sessionId }
        });

        if (!session) return errorResponse(res, 'Session not found', 404);
        if (session.doctorId !== req.user.id) return errorResponse(res, 'Only the assigned doctor can issue the prescription', 403);

        const prescription = await prisma.prescription.update({
            where: { sessionId },
            data: { status: 'ISSUED' },
            include: { items: true }
        });

        // Optional: Trigger socket notification or email here

        return successResponse(res, prescription, 'Prescription issued successfully');
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};
