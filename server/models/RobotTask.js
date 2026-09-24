import mongoose from 'mongoose';

const robotTaskSchema = new mongoose.Schema(
  {
    taskId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    robotId: {
      type: String,
      required: true,
      default: 'AMR-MEDIBOT-01',
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
    },
    pickupLocation: {
      ward: { type: String, required: true },
      department: { type: String, required: true },
      floor: { type: String, default: 'Floor 2' },
      binId: { type: String, default: '' },
    },
    destinationBay: {
      type: String,
      default: 'Central Biohazard Staging Bay A',
    },
    priority: {
      type: String,
      enum: ['Routine', 'High', 'Urgent'],
      default: 'Routine',
    },
    status: {
      type: String,
      enum: ['Queued', 'En Route to Ward', 'Docking & Loading', 'In Transit to Bay', 'Completed', 'Error'],
      default: 'Queued',
    },
    payloadWeightKg: {
      type: Number,
      default: 0,
    },
    batteryLevel: {
      type: Number,
      default: 95,
    },
    dispatchedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const RobotTask = mongoose.model('RobotTask', robotTaskSchema);
export default RobotTask;
