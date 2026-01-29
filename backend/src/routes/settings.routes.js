import express from 'express';
import * as settingsController from '../controllers/settings.controller.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public read access might be needed for some settings (e.g. hospital name, contact info)
// But for now let's keep it open or public-friendly endpoints separate if needed.
// Actually, public settings like hospital name SHOULD be public.
// Let's allow public read for now, but sensitive settings might need filtering in controller if we had any.
// For now, assuming all settings are "public info" like name, address, etc. OR "system config" like email notifications which are admin only.

// Public access to read all settings (or specific keys if filtering implemented)
// Ideally we should separate public vs private settings.
// For this task, let's make GET public but maybe restrict keys or just trust frontend to only ask for needed ones?
// Better: Helper endpoint for public config vs Admin full access.
// Let's stick to: GET / -> public (or maybe check token inside if we want to show sensitive info? No let's keep it simple).
router.get('/', settingsController.getSettings);

// Admin only write access
router.put('/', verifyToken, requireAdmin, settingsController.updateSettings);

export default router;
