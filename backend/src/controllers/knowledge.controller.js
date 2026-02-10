import prisma from '../config/database.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getAllKnowledge = async (req, res, next) => {
    try {
        const { search, category, activeOnly } = req.query;

        const where = {};
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } }
            ];
        }
        if (category) where.category = category;
        if (activeOnly === 'true') where.isActive = true;

        const knowledge = await prisma.knowledge.findMany({
            where,
            orderBy: { updatedAt: 'desc' }
        });

        return successResponse(res, knowledge);
    } catch (error) {
        next(error);
    }
};

export const getKnowledgeById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const knowledge = await prisma.knowledge.findUnique({ where: { id } });

        if (!knowledge) return errorResponse(res, 'Knowledge not found', 404);

        return successResponse(res, knowledge);
    } catch (error) {
        next(error);
    }
};

export const createKnowledge = async (req, res, next) => {
    try {
        const { title, content, category, isActive } = req.body;

        if (!title || !content) return errorResponse(res, 'Title and content are required', 400);

        const knowledge = await prisma.knowledge.create({
            data: { title, content, category, isActive: isActive ?? true }
        });

        return successResponse(res, knowledge, 'Knowledge created successfully', 201);
    } catch (error) {
        next(error);
    }
};

export const updateKnowledge = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, content, category, isActive } = req.body;

        const knowledge = await prisma.knowledge.update({
            where: { id },
            data: { title, content, category, isActive }
        });

        return successResponse(res, knowledge, 'Knowledge updated successfully');
    } catch (error) {
        next(error);
    }
};

export const deleteKnowledge = async (req, res, next) => {
    try {
        const { id } = req.params;
        await prisma.knowledge.delete({ where: { id } });
        return successResponse(res, null, 'Knowledge deleted successfully');
    } catch (error) {
        next(error);
    }
};

export const toggleKnowledgeStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const knowledge = await prisma.knowledge.findUnique({ where: { id } });

        if (!knowledge) return errorResponse(res, 'Knowledge not found', 404);

        const updated = await prisma.knowledge.update({
            where: { id },
            data: { isActive: !knowledge.isActive }
        });

        return successResponse(res, updated, `Knowledge status changed to ${updated.isActive ? 'Active' : 'Inactive'}`);
    } catch (error) {
        next(error);
    }
};
