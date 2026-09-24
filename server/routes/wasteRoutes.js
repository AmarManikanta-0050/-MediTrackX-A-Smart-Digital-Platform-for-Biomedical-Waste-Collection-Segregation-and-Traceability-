import express from 'express';
import {
  getWasteRecords,
  getWasteById,
  createWasteRecord,
  updateWasteRecord,
  deleteWasteRecord,
} from '../controllers/wasteController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getWasteRecords)
  .post(protect, authorize('admin', 'hospital_staff'), createWasteRecord);

router.route('/:id')
  .get(protect, getWasteById)
  .put(protect, authorize('admin', 'hospital_staff'), updateWasteRecord)
  .delete(protect, authorize('admin'), deleteWasteRecord);

export default router;
