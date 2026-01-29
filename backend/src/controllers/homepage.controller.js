import prisma from '../config/database.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Get homepage content by section
 * GET /api/homepage/:section
 */
export const getSection = async (req, res, next) => {
    try {
        const { section } = req.params;

        // Try to find existing content
        let content = await prisma.homepageContent.findUnique({
            where: { section },
        });

        // If not found, check if we have hardcoded defaults (optional)
        // Or just return null/404. 
        // For 'hero', we might want to return default if db is empty so frontend doesn't break?
        // But better to handle empty in frontend.

        if (!content) {
            // Return empty or defaults depending on section logic, or 404.
            // Let's return null data to indicate "use defaults"
            return successResponse(res, null, 'Section not found (using defaults)');
        }

        return successResponse(res, content);
    } catch (error) {
        next(error);
    }
};

/**
 * Update homepage content section
 * PUT /api/homepage/:section
 */
export const updateSection = async (req, res, next) => {
    try {
        const { section } = req.params;
        const { content, isActive } = req.body;

        const updated = await prisma.homepageContent.upsert({
            where: { section },
            update: {
                content,
                isActive: isActive !== undefined ? isActive : true,
            },
            create: {
                section,
                content,
                isActive: true,
            },
        });

        return successResponse(res, updated, 'Content updated successfully');
    } catch (error) {
        next(error);
    }
};
