import express from 'express';
import {
  getHospitals,
  getHospitalById,
  createHospital,
  updateHospital,
  deleteHospital,
} from '../controllers/hospitalController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getHospitals)
  .post(protect, authorize('admin'), createHospital);

router.route('/:id')
  .get(protect, getHospitalById)
  .put(protect, authorize('admin'), updateHospital)
  .delete(protect, authorize('admin'), deleteHospital);

export default router;
