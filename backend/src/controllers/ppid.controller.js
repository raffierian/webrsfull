import prisma from '../config/database.js';
import { successResponse } from '../utils/response.js';

export const getDocuments = async (req, res, next) => {
    try {
        const { isPublic, category, search } = req.query;
        const where = {};

        if (isPublic === 'true') where.isPublic = true;
        if (category && category !== 'all') where.category = category;
        if (search) where.title = { contains: search, mode: 'insensitive' };

        const documents = await prisma.pPIDDocument.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });

        return successResponse(res, documents);
    } catch (error) {
        next(error);
    }
};

export const createDocument = async (req, res, next) => {
    try {
        const { title, category, description, fileUrl, fileSize, fileType, isPublic } = req.body;

        const document = await prisma.pPIDDocument.create({
            data: {
                title,
                category,
                description,
                fileUrl,
                fileSize: fileSize ? parseInt(fileSize) : 0,
                fileType,
                // Default to true if not specified, otherwise respect the value
                isPublic: isPublic === undefined ? true : (isPublic === true || isPublic === 'true')
            }
        });

        return successResponse(res, document, 'Document created successfully', 201);
    } catch (error) {
        next(error);
    }
};

export const updateDocument = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = req.body;

        if (data.fileSize) data.fileSize = parseInt(data.fileSize);
        if (data.isPublic !== undefined) data.isPublic = data.isPublic === true || data.isPublic === 'true';

        const document = await prisma.pPIDDocument.update({
            where: { id },
            data
        });

        return successResponse(res, document, 'Document updated successfully');
    } catch (error) {
        next(error);
    }
};

export const deleteDocument = async (req, res, next) => {
    try {
        const { id } = req.params;
        await prisma.pPIDDocument.delete({ where: { id } });
        return successResponse(res, null, 'Document deleted successfully');
    } catch (error) {
        next(error);
    }
};
