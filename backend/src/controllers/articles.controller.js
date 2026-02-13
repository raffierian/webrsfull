import prisma from '../config/database.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response.js';

export const getAllArticles = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, category } = req.query; // Added category filter
        const skip = (page - 1) * limit;

        const where = { isPublished: true };
        if (category && category !== 'all') where.tags = { has: category }; // Filter by tags if category is provided

        const [articles, total] = await Promise.all([
            prisma.article.findMany({
                where,
                skip: parseInt(skip),
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' }, // Fixed: publishedAt -> createdAt
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    content: true, // Client can truncate for excerpt
                    thumbnailUrl: true, // Fixed: imageUrl -> thumbnailUrl
                    tags: true, // Fixed: category -> tags
                    createdAt: true, // Fixed: publishedAt -> createdAt
                    author: {
                        select: { name: true },
                    },
                },
            }),
            prisma.article.count({ where }),
        ]);

        return paginatedResponse(res, articles, page, limit, total);
    } catch (error) {
        next(error);
    }
};

export const getArticleBySlug = async (req, res, next) => {
    try {
        const article = await prisma.article.findUnique({
            where: { slug: req.params.slug },
            include: {
                author: {
                    select: { name: true },
                },
            },
        });

        if (!article || !article.isPublished) {
            return errorResponse(res, 'Article not found', 404);
        }

        // Increment views
        await prisma.article.update({
            where: { id: article.id },
            data: { views: { increment: 1 } },
        });

        return successResponse(res, article);
    } catch (error) {
        next(error);
    }
};
