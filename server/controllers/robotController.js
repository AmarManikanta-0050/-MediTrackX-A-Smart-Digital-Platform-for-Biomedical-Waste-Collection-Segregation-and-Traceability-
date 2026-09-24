import RobotTask from '../models/RobotTask.js';
import Hospital from '../models/Hospital.js';
import Notification from '../models/Notification.js';

// Fleet robots operational hardware status
const ROBOT_FLEET = [
  {
    robotId: 'AMR-MEDIBOT-01',
    name: 'MediBot Alpha',
    model: 'Autonomous Bio-Transport AMR 150',
    status: 'In Mission',
    floor: 'Floor 2 (ICU & Trauma)',
    batteryLevel: 86,
    lidarStatus: 'Active (360° Slam Laser Online)',
    currentPayloadKg: 28.5,
    maxPayloadKg: 80.0,
    speedMps: 1.2,
    safetyBumper: 'Normal',
  },
  {
    robotId: 'AMR-MEDIBOT-02',
    name: 'MediBot Beta',
    model: 'Autonomous Bio-Transport AMR 150',
    status: 'Charging',
    floor: 'Ground Floor (Central Depot Dock 1)',
    batteryLevel: 98,
    lidarStatus: 'Standby',
    currentPayloadKg: 0.0,
    maxPayloadKg: 80.0,
    speedMps: 0.0,
    safetyBumper: 'Normal',
  },
  {
    robotId: 'AMR-MEDIBOT-03',
    name: 'MediBot Gamma',
    model: 'Heavy-Duty Autonomous Carrier 250',
    status: 'En Route',
    floor: 'Floor 3 (Surgery & Pathology)',
    batteryLevel: 72,
    lidarStatus: 'Active (Dynamic Obstacle Reroute)',
    currentPayloadKg: 44.0,
    maxPayloadKg: 120.0,
    speedMps: 0.9,
    safetyBumper: 'Normal',
  },
];

// Helper to seed initial sample tasks if empty
const ensureTasksExist = async (userId) => {
  const count = await RobotTask.countDocuments();
  if (count > 0) return;

  const hospital = await Hospital.findOne();
  if (!hospital) return;

  const now = new Date();
  const initialTasks = [
    {
      taskId: `AMR-${now.getFullYear()}-00101`,
      robotId: 'AMR-MEDIBOT-01',
      hospital: hospital._id,
      pickupLocation: {
        ward: 'Ward 3B Isolation',
        department: 'Intensive Care Unit (ICU)',
        floor: 'Floor 2',
        binId: 'BIN-101',
      },
      destinationBay: 'Central Biohazard Staging Bay A',
      priority: 'High',
      status: 'In Transit to Bay',
      payloadWeightKg: 28.5,
      batteryLevel: 86,
      dispatchedBy: userId,
    },
    {
      taskId: `AMR-${now.getFullYear()}-00102`,
      robotId: 'AMR-MEDIBOT-03',
      hospital: hospital._id,
      pickupLocation: {
        ward: 'OT-4 Disposal Suite',
        department: 'Surgery & Operation Theatre',
        floor: 'Floor 3',
        binId: 'BIN-103',
      },
      destinationBay: 'Central Cold Storage Vault B',
      priority: 'Urgent',
      status: 'Docking & Loading',
      payloadWeightKg: 39.0,
      batteryLevel: 72,
      dispatchedBy: userId,
    },
    {
      taskId: `AMR-${now.getFullYear()}-00098`,
      robotId: 'AMR-MEDIBOT-02',
      hospital: hospital._id,
      pickupLocation: {
        ward: 'Trauma Bay 1',
        department: 'Emergency & Trauma',
        floor: 'Ground Floor',
        binId: 'BIN-102',
      },
      destinationBay: 'Central Biohazard Staging Bay A',
      priority: 'Routine',
      status: 'Completed',
      payloadWeightKg: 18.2,
      batteryLevel: 94,
      dispatchedBy: userId,
      completedAt: new Date(now.getTime() - 90 * 60 * 1000),
    },
  ];

  await RobotTask.insertMany(initialTasks);
};

// @desc    Get all robot tasks
// @route   GET /api/robot/tasks
// @access  Private
export const getRobotTasks = async (req, res, next) => {
  try {
    await ensureTasksExist(req.user._id);

    const query = {};
    if (req.user.role === 'hospital_staff' && req.user.hospital) {
      query.hospital = req.user.hospital;
    }
    if (req.query.status) {
      query.status = req.query.status;
    }

    const tasks = await RobotTask.find(query)
      .populate('hospital', 'name hospitalId city')
      .populate('dispatchedBy', 'name email role')
      .sort({ createdAt: -1 });

    const totalTasks = tasks.length;
    const activeTasks = tasks.filter((t) => t.status !== 'Completed' && t.status !== 'Error').length;
    const completedTasks = tasks.filter((t) => t.status === 'Completed').length;

    res.status(200).json({
      success: true,
      summary: {
        totalTasks,
        activeTasks,
        completedTasks,
        availableRobots: ROBOT_FLEET.filter((r) => r.status === 'Charging' || r.status === 'Standby').length,
      },
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Dispatch a new AMR robot task
// @route   POST /api/robot/dispatch
// @access  Private (admin or hospital_staff)
export const dispatchRobotTask = async (req, res, next) => {
  try {
    const { hospitalId, ward, department, floor, binId, destinationBay, priority, payloadWeightKg, robotId } = req.body;

    const effectiveHospital = req.user.role === 'hospital_staff' ? req.user.hospital : hospitalId;
    if (!effectiveHospital) {
      return res.status(400).json({ success: false, message: 'Hospital facility is required' });
    }

    if (!ward || !department) {
      return res.status(400).json({ success: false, message: 'Ward and department pickup locations are required' });
    }

    const count = await RobotTask.countDocuments();
    const taskId = `AMR-${new Date().getFullYear()}-${String(1000 + count + 1).padStart(5, '0')}`;

    const chosenRobot = robotId || 'AMR-MEDIBOT-01';

    const newTask = await RobotTask.create({
      taskId,
      robotId: chosenRobot,
      hospital: effectiveHospital,
      pickupLocation: {
        ward,
        department,
        floor: floor || 'Floor 2',
        binId: binId || '',
      },
      destinationBay: destinationBay || 'Central Biohazard Staging Bay A',
      priority: priority || 'Routine',
      status: 'Queued',
      payloadWeightKg: Number(payloadWeightKg) || 15.0,
      batteryLevel: 92,
      dispatchedBy: req.user._id,
    });

    const populated = await RobotTask.findById(newTask._id)
      .populate('hospital', 'name hospitalId')
      .populate('dispatchedBy', 'name email role');

    // Create system notification
    await Notification.create({
      user: req.user._id,
      title: `AMR Mission Dispatched: ${taskId}`,
      message: `Robot ${chosenRobot} assigned to retrieve biohazard waste from ${ward} (${department}).`,
      type: 'info',
      link: '/robot/dispatch',
    });

    res.status(201).json({
      success: true,
      message: `Autonomous Robot ${chosenRobot} successfully tasked to mission ${taskId}`,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update robot task navigation state
// @route   PATCH /api/robot/tasks/:id/status
// @access  Private
export const updateTaskStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Queued', 'En Route to Ward', 'Docking & Loading', 'In Transit to Bay', 'Completed', 'Error'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const task = await RobotTask.findById(id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Robot Task not found' });
    }

    task.status = status;
    if (status === 'Completed') {
      task.completedAt = new Date();
    }
    await task.save();

    const populated = await RobotTask.findById(task._id)
      .populate('hospital', 'name hospitalId')
      .populate('dispatchedBy', 'name email');

    res.status(200).json({
      success: true,
      message: `Task ${task.taskId} updated to ${status}`,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get AMR robot fleet hardware status
// @route   GET /api/robot/fleet
// @access  Private
export const getRobotFleet = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      summary: {
        fleetSize: ROBOT_FLEET.length,
        operationalCount: ROBOT_FLEET.length,
        dockingStationsOnline: 4,
        fleetUtilization: '66.7%',
        navigationSystem: 'ROS2 / SLAM Real-Time Path Planning',
      },
      data: ROBOT_FLEET,
    });
  } catch (error) {
    next(error);
  }
};
