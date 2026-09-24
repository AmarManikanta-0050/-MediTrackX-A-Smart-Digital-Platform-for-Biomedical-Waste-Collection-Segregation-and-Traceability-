import express from 'express';
import {
  getFleetVehicles,
  updateVehicleLocation,
  simulateFleetMovement,
  getVehicleRoute,
} from '../controllers/gpsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/vehicles', getFleetVehicles);
router.post('/vehicles/:vehicleId/location', authorize('admin', 'collector'), updateVehicleLocation);
router.post('/simulate-step', simulateFleetMovement);
router.get('/vehicles/:vehicleId/route', getVehicleRoute);

export default router;
