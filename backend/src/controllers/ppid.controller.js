import prisma from '../config/database.js';
import { successResponse } from '../utils/response.js';

export const getDocuments = async (req, res, next) => {
    try {
        const documents = await prisma.pPIDDocument.findMany({
            where: { isPublic: true },
            orderBy: { createdAt: 'desc' },
        });
        return successResponse(res, documents);
    } catch (error) {
        next(error);
    }
};
