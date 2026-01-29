import express from 'express';
import { getRoles, createRole, updateRole, deleteRole } from '../controllers/role.controller.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', verifyToken, getRoles);
router.post('/', verifyToken, requireRole('SUPER_ADMIN'), createRole);
router.put('/:id', verifyToken, requireRole('SUPER_ADMIN'), updateRole);
router.delete('/:id', verifyToken, requireRole('SUPER_ADMIN'), deleteRole);

export default router;
