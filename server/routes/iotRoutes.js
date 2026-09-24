import express from 'express';
import {
  getLiveTelemetry,
  updateBinTelemetry,
  simulateTelemetryPulse,
  calibrateSensor,
} from '../controllers/iotController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/live', getLiveTelemetry);
router.post('/bins/:binId/telemetry', updateBinTelemetry);
router.post('/simulator/tick', simulateTelemetryPulse);
router.post('/bins/:binId/calibrate', authorize('admin', 'hospital_staff'), calibrateSensor);

export default router;
