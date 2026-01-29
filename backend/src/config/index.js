import dotenv from 'dotenv';
dotenv.config();

export const config = {
    // Server
    nodeEnv: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5000,
    apiUrl: process.env.API_URL || 'http://localhost:5000',

    // Database
    databaseUrl: process.env.DATABASE_URL,

    // JWT
    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    },

    // CORS
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:8080',

    // File Upload
    upload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB
        uploadPath: process.env.UPLOAD_PATH || './uploads',
    },

    // Pagination
    pagination: {
        defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE) || 10,
        maxPageSize: parseInt(process.env.MAX_PAGE_SIZE) || 100,
    },

    // Email (SMTP)
    mail: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
        from: process.env.SMTP_FROM || 'no-reply@rssoewandhie.com',
    },
};
