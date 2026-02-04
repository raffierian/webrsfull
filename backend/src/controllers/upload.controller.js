import { successResponse, errorResponse } from '../utils/response.js';

export const uploadFile = (req, res) => {
    try {
        if (!req.file) {
            return errorResponse(res, 'No file uploaded', 400);
        }

        // Construct public URL
        // Assuming server serves 'public' folder statically
        const protocol = req.protocol;
        const host = req.get('host');
        const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

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
