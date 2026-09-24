import express from 'express';
import { classifyWaste, getAITelemetry, autoLogFromAI } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/classify', classifyWaste);
router.get('/telemetry', getAITelemetry);
router.post('/auto-log', authorize('admin', 'hospital_staff'), autoLogFromAI);

export default router;
