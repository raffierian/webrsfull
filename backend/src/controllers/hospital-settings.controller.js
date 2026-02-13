import prisma from '../config/database.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getHospitalSettings = async (req, res) => {
    try {
        let settings = await prisma.hospitalSettings.findFirst();

        if (!settings) {
            // Create default settings
            settings = await prisma.hospitalSettings.create({
                data: {
                    bankName: 'BCA',
                    bankAccountNumber: '1234567890',
                    bankAccountName: 'RS Soewandhie',
                    defaultConsultationFee: 50000
                }
            });
        }

        return successResponse(res, settings, 'Hospital settings retrieved successfully');
    } catch (error) {
        console.error('Get hospital settings error:', error);
        return errorResponse(res, error.message, 500);
    }
};

export const updateHospitalSettings = async (req, res) => {
    try {
        const {
            defaultConsultationFee,
            bankName,
            bankAccountNumber,
            bankAccountName,
            midtransServerKey,
            midtransClientKey,
            midtransIsProduction
        } = req.body;

        let settings = await prisma.hospitalSettings.findFirst();

        const data = {};
        if (defaultConsultationFee !== undefined) data.defaultConsultationFee = defaultConsultationFee;
        if (bankName !== undefined) data.bankName = bankName;
        if (bankAccountNumber !== undefined) data.bankAccountNumber = bankAccountNumber;
        if (bankAccountName !== undefined) data.bankAccountName = bankAccountName;
        if (midtransServerKey !== undefined) data.midtransServerKey = midtransServerKey;
        if (midtransClientKey !== undefined) data.midtransClientKey = midtransClientKey;
        if (midtransIsProduction !== undefined) data.midtransIsProduction = midtransIsProduction;

        if (!settings) {
            settings = await prisma.hospitalSettings.create({
                data: {
                    bankName: bankName || 'BCA',
                    bankAccountNumber: bankAccountNumber || '1234567890',
                    bankAccountName: bankAccountName || 'RS Soewandhie',
                    defaultConsultationFee: defaultConsultationFee || 50000,
                    ...data
                }
            });
        } else {
            settings = await prisma.hospitalSettings.update({
                where: { id: settings.id },
                data
            });
        }

        return successResponse(res, settings, 'Hospital settings updated successfully');
    } catch (error) {
        console.error('Update hospital settings error:', error);
        return errorResponse(res, error.message, 500);
    }
};
