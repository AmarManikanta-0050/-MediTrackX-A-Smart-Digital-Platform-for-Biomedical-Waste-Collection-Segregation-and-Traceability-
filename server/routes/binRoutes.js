import express from 'express';
import {
  getBins,
  getBinById,
  createBin,
  updateBin,
  deleteBin,
} from '../controllers/binController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getBins)
  .post(protect, authorize('admin', 'hospital_staff'), createBin);

router.route('/:id')
  .get(protect, getBinById)
  .put(protect, authorize('admin', 'hospital_staff'), updateBin)
  .delete(protect, authorize('admin'), deleteBin);

export default router;
