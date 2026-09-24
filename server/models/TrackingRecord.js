import mongoose from 'mongoose';

const trackingRecordSchema = new mongoose.Schema(
  {
    wasteId: {
      type: String,
      required: [true, 'Please provide wasteId'],
      trim: true,
      index: true,
    },
    requestId: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    status: {
      type: String,
      required: true,
      trim: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const TrackingRecord = mongoose.model('TrackingRecord', trackingRecordSchema);
export default TrackingRecord;
