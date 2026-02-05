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

        // Construct public URL using configured API_URL to ensure correct protocol/domain
        const fileUrl = `${config.apiUrl}/uploads/${req.file.filename}`;

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
