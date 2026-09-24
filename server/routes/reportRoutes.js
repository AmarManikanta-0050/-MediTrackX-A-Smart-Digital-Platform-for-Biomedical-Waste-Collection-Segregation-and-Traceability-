import express from 'express';
import {
  getDashboardStats,
  getAnalyticsData,
  exportWasteCSV,
} from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, getDashboardStats);
router.get('/analytics', protect, getAnalyticsData);
router.get('/export/csv', protect, exportWasteCSV);

export default router;
