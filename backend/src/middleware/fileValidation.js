import { fileTypeFromFile } from 'file-type';
import fs from 'fs';
import { errorResponse } from '../utils/response.js';

/**
 * Middleware to validate file type using Magic Numbers (buffer analysis)
 */
export const validateFileType = async (req, res, next) => {
    // Skip if no file was uploaded
    if (!req.file) return next();

    try {
        const type = await fileTypeFromFile(req.file.path);

        // Define allowed MIME types based on the use case
        const allowedMimeTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        ];

        // If file-type cannot determine the type or it's not in the whitelist
        if (!type || !allowedMimeTypes.includes(type.mime)) {
            console.warn(`[SECURITY] Potential spoofed file detected: ${req.file.originalname} (Detected MIME: ${type?.mime || 'unknown'})`);

            // Delete the file from disk immediately
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            return errorResponse(res, 'Invalid file content! Spoofed or restricted file type detected.', 400);
        }

        // Tag the request with the verified MIME type
        req.file.verifiedMimetypes = type.mime;
        next();
    } catch (error) {
        console.error('File validation error:', error);

        // Cleanup on error
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        return errorResponse(res, 'Error validating file content.', 500);
    }
};
