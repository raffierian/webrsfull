/**
 * COPYRIGHT (c) 2025 Roni Hidayat (RH Production). All Rights Reserved.
 * This software is the proprietary property of Roni Hidayat (RH Production).
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 */

import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';
import { validateLicense } from './utils/licenseValidator.js';
import { initSocket } from './socket/index.js';

// --- LICENSE CHECK START ---
const licenseKey = process.env.LICENSE_KEY;
validateLicense(licenseKey).then(licenseStatus => {
    if (!licenseStatus.valid) {
        console.error('\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        console.error('CRITICAL ERROR: APPLICATION LICENSE CHECK FAILED');
        console.error('Reason:', licenseStatus.message);
        console.error('Please contact Roni Hidayat (RH Production) to obtain a valid license.');
        console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n');
        process.exit(1); // Stop server immediately
    }

    console.log(`\n[LICENSE] Verified. Licensed to: ${licenseStatus.data.client}`);
    if (licenseStatus.data.expiry !== 'PERMANENT') {
        console.log(`[LICENSE] Expires on: ${licenseStatus.data.expiry}`);
    }
}).catch(err => {
    console.error('CRITICAL ERROR: APPLICATION LICENSE CHECK FAILED', err);
    process.exit(1);
});
// --- LICENSE CHECK END ---

const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
initSocket(httpServer);

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || config.nodeEnv === 'development') {
            return callback(null, true);
        }
        const allowedOrigins = [config.corsOrigin];
        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(new Error('CORS policy deviation'), false);
        }
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
}));

// Rate limiting
const whitelistedIps = ['195.88.211.70', '127.0.0.1', '::1'];

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    skip: (req, res) => {
        const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        if (!ip) return false;
        // Clean IPv6 to IPv4 mapping (e.g. ::ffff:10.255.240.123)
        const cleanIp = ip.toString().replace(/^.*:/, '');
        return whitelistedIps.includes(ip) || whitelistedIps.includes(cleanIp);
    }
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Compression
app.use(compression());

// Logging
if (config.nodeEnv === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Static files
app.use('/uploads', express.static('public/uploads'));

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
    });
});

// API Routes
app.use('/api', routes);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

import { startCronJobs } from './services/cron.service.js';

// ... other imports

// Start server
const PORT = config.port;
httpServer.listen(PORT, '0.0.0.0', () => {
    // Start Cron Jobs
    startCronJobs();

    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🏥 RS Soewandhie Backend API                           ║
║                                                           ║
║   Environment: ${config.nodeEnv.padEnd(43)}║
║   Port: ${PORT.toString().padEnd(50)}║
║   URL: ${config.apiUrl.padEnd(51)}║
║                                                           ║
║   📚 API Documentation: ${(config.apiUrl + '/api').padEnd(36)}║
║   ❤️  Health Check: ${(config.apiUrl + '/health').padEnd(40)}║
║                                                           ║
╚════════════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    process.exit(1);
});

export default app;