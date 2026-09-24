import mongoose from 'mongoose';

const wasteRecordSchema = new mongoose.Schema(
  {
    wasteId: {
      type: String,
      required: [true, 'Please provide waste ID'],
      unique: true,
      trim: true,
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: [true, 'Please specify hospital'],
    },
    bin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bin',
      default: null,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WasteCategory',
      required: [true, 'Please specify waste category'],
    },
    quantity: {
      type: Number,
      required: [true, 'Please specify waste quantity'],
      min: [0.01, 'Quantity must be greater than 0'],
    },
    unit: {
      type: String,
      enum: ['KG', 'Liters', 'Bags'],
      default: 'KG',
    },
    department: {
      type: String,
      required: [true, 'Please specify department'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Logged', 'Pending Collection', 'In Transit', 'Disposed'],
      default: 'Logged',
    },
    collectionRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CollectionRequest',
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please specify creator user'],
    },
  },
  {
    timestamps: true,
  }
);

const WasteRecord = mongoose.model('WasteRecord', wasteRecordSchema);
export default WasteRecord;
