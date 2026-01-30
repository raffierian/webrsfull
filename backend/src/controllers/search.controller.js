import prisma from '../config/database.js';
import { successResponse } from '../utils/response.js';

export const globalSearch = async (req, res, next) => {
    try {
        const { q } = req.query;

        if (!q || q.trim().length < 2) {
            return successResponse(res, {
                articles: [],
                doctors: [],
                services: [],
                careers: []
            });
        }

        const searchTerm = q.trim();

        // Search in parallel
        const [articles, doctors, services, careers] = await Promise.all([
            // Articles
            prisma.article.findMany({
                where: {
                    isPublished: true,
                    OR: [
                        { title: { contains: searchTerm, mode: 'insensitive' } },
                        { content: { contains: searchTerm, mode: 'insensitive' } },
                        { excerpt: { contains: searchTerm, mode: 'insensitive' } }
                    ]
                },
                select: {
                    id: true,
                    title: true,
                    excerpt: true,
                    slug: true,
                    imageUrl: true
                },
                take: 5,
                orderBy: { createdAt: 'desc' }
            }),

            // Doctors
            prisma.doctor.findMany({
                where: {
                    OR: [
                        { name: { contains: searchTerm, mode: 'insensitive' } },
                        { specialization: { contains: searchTerm, mode: 'insensitive' } }
                    ]
                },
                select: {
                    id: true,
                    name: true,
                    specialization: true,
                    photoUrl: true
                },
                take: 5
            }),

            // Services
            prisma.service.findMany({
                where: {
                    OR: [
                        { name: { contains: searchTerm, mode: 'insensitive' } },
                        { description: { contains: searchTerm, mode: 'insensitive' } }
                    ]
                },
                select: {
                    id: true,
                    name: true,
                    type: true,
                    slug: true,
                    icon: true
                },
                take: 5
            }),

            // Careers
            prisma.career.findMany({
                where: {
                    isActive: true,
                    OR: [
                        { title: { contains: searchTerm, mode: 'insensitive' } },
                        { department: { contains: searchTerm, mode: 'insensitive' } },
                        { description: { contains: searchTerm, mode: 'insensitive' } }
                    ]
                },
                select: {
                    id: true,
                    title: true,
                    department: true,
                    slug: true,
                    positionType: true
                },
                take: 5
            })
        ]);

        return successResponse(res, {
            articles,
            doctors,
            services,
            careers,
            total: articles.length + doctors.length + services.length + careers.length
        });
    } catch (error) {
        next(error);
    }
};
