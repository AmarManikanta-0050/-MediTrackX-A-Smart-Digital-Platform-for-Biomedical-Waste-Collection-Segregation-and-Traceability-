import express from 'express';
import {
  getRobotTasks,
  dispatchRobotTask,
  updateTaskStatus,
  getRobotFleet,
} from '../controllers/robotController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/tasks', getRobotTasks);
router.post('/dispatch', authorize('admin', 'hospital_staff'), dispatchRobotTask);
router.patch('/tasks/:id/status', updateTaskStatus);
router.get('/fleet', getRobotFleet);

export default router;
