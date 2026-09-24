import mongoose from 'mongoose';

const binSchema = new mongoose.Schema(
  {
    binId: {
      type: String,
      required: [true, 'Please provide bin ID'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: [true, 'Please specify hospital'],
    },
    department: {
      type: String,
      required: [true, 'Please specify department (e.g. ICU, Surgery, OPD, Lab)'],
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WasteCategory',
      required: [true, 'Please specify waste category'],
    },
    capacity: {
      type: Number,
      required: [true, 'Please specify capacity in KG'],
      min: [1, 'Capacity must be at least 1 KG'],
    },
    currentLevel: {
      type: Number,
      default: 0,
      min: [0, 'Current level cannot be negative'],
    },
    status: {
      type: String,
      enum: ['Active', 'Full', 'Maintenance', 'Inactive'],
      default: 'Active',
    },
    locationDescription: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for utilization percentage
binSchema.virtual('utilizationPercentage').get(function () {
  if (!this.capacity || this.capacity === 0) return 0;
  const pct = (this.currentLevel / this.capacity) * 100;
  return Math.min(Math.round(pct * 10) / 10, 100);
});

const Bin = mongoose.model('Bin', binSchema);
export default Bin;
