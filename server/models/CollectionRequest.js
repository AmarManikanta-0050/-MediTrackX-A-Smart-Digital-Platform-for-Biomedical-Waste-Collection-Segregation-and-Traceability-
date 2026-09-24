import mongoose from 'mongoose';

const collectionRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: [true, 'Please provide request ID'],
      unique: true,
      trim: true,
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: [true, 'Please specify hospital'],
    },
    wasteRecords: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WasteRecord',
      },
    ],
    collector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Pending', 'Assigned', 'Accepted', 'Collecting', 'Collected', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please specify requesting user'],
    },
    assignedAt: {
      type: Date,
      default: null,
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
    collectedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    collectorNotes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const CollectionRequest = mongoose.model('CollectionRequest', collectionRequestSchema);
export default CollectionRequest;
