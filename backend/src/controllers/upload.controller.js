import { config } from '../config/index.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const uploadFile = (req, res) => {
    try {
        if (!req.file) {
            console.log('Upload Failed - Debug Info:');
            console.log('Headers:', req.headers);
            console.log('Body:', req.body);
            console.log('File:', req.file);
            return errorResponse(res, 'No file uploaded', 400);
        }

        // Strip /api from the end of apiUrl so uploads don't become /api/uploads
        const baseUrl = config.apiUrl.replace(/\/api$/, '');
        const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

        return successResponse(res, {
            url: fileUrl,
            filename: req.file.filename,
            size: req.file.size,
            mimetype: req.file.mimetype,
            originalname: req.file.originalname
        }, 'File uploaded successfully');
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};
