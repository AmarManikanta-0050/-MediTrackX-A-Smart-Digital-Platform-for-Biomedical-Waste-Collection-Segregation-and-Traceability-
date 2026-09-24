import express from 'express';
import { getTrackingTimeline } from '../controllers/trackingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:identifier', protect, getTrackingTimeline);

export default router;
