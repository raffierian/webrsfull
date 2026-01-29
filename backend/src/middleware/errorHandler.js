import { errorResponse } from '../utils/response.js';

/**
 * Global Error Handler Middleware
 */
export const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Prisma errors
    if (err.code === 'P2002') {
        return errorResponse(res, 'Data already exists', 409, {
            field: err.meta?.target,
        });
    }

    if (err.code === 'P2025') {
        return errorResponse(res, 'Record not found', 404);
    }

    // Validation errors
    if (err.name === 'ValidationError') {
        return errorResponse(res, 'Validation failed', 400, err.errors);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return errorResponse(res, 'Invalid token', 401);
    }

    if (err.name === 'TokenExpiredError') {
        return errorResponse(res, 'Token expired', 401);
    }

    // Default error
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';

    return errorResponse(res, message, statusCode);
};

/**
 * 404 Not Found Handler
 */
export const notFoundHandler = (req, res) => {
    return errorResponse(res, `Route ${req.originalUrl} not found`, 404);
};
