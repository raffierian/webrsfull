import express from 'express';
import { getMenusByRole, updateRoleMenus, getMyMenus } from '../controllers/roleMenu.controller.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/my-menus', verifyToken, getMyMenus);
router.get('/:role', verifyToken, requireRole('SUPER_ADMIN'), getMenusByRole);
router.put('/:role', verifyToken, requireRole('SUPER_ADMIN'), updateRoleMenus);

export default router;
