import mongoose from 'mongoose';

const wasteCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide category name'],
      trim: true,
      unique: true,
    },
    code: {
      type: String,
      required: [true, 'Please provide category code'],
      uppercase: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide category description'],
      trim: true,
    },
    recommendedContainer: {
      type: String,
      required: [true, 'Please provide recommended container or color-coded bag'],
      trim: true,
    },
    colorCode: {
      type: String,
      default: '#0D9488', // Teal default
      trim: true,
    },
    hazardLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Biohazardous'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

const WasteCategory = mongoose.model('WasteCategory', wasteCategorySchema);
export default WasteCategory;
