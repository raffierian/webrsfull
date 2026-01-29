import express from 'express';
import multer from 'multer';
import {
    getAllRooms,
    getRoomSummary,
    getRoomById,
    createRoom,
    updateRoom,
    updateRoomStatus,
    deleteRoom,
    importRooms
} from '../controllers/inpatientRooms.controller.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Public routes
router.get('/', getAllRooms);
router.get('/summary', getRoomSummary);
router.get('/:id', getRoomById);

// Admin routes
router.post('/', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), createRoom);
router.post('/import', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), upload.single('file'), importRooms);
router.put('/:id', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), updateRoom);
router.put('/:id/status', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN', 'STAFF'), updateRoomStatus);
router.delete('/:id', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), deleteRoom);

export default router;
