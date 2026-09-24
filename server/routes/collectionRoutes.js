import express from 'express';
import {
  getCollectionRequests,
  getCollectionRequestById,
  createCollectionRequest,
  assignCollector,
  updateCollectionStatus,
} from '../controllers/collectionController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getCollectionRequests)
  .post(protect, authorize('admin', 'hospital_staff'), createCollectionRequest);

router.route('/:id')
  .get(protect, getCollectionRequestById);

router.route('/:id/assign')
  .put(protect, authorize('admin'), assignCollector);

router.route('/:id/status')
  .patch(protect, authorize('admin', 'collector'), updateCollectionStatus);

export default router;
