import prisma from '../config/database.js';
import { successResponse } from '../utils/response.js';

export const createConsultation = async (req, res, next) => {
    try {
        const { doctorId, consultationDate, complaint } = req.body;
        const patientId = req.user.id;

        // Check if consultation service is enabled
        const consultationSetting = await prisma.setting.findUnique({
            where: { key: 'consultationEnabled' }
        });

        if (consultationSetting && consultationSetting.value === false) {
            return errorResponse(res, 'Layanan konsultasi online sedang tidak tersedia', 403);
        }

        const consultation = await prisma.consultation.create({
            data: {
                patientId,
                doctorId,
                consultationDate: new Date(consultationDate),
                complaint,
                status: 'SCHEDULED',
            },
        });

        return successResponse(res, consultation, 'Consultation created successfully', 201);
    } catch (error) {
        next(error);
    }
};
