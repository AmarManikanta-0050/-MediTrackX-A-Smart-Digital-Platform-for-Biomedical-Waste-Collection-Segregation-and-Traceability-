import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide hospital name'],
      trim: true,
    },
    hospitalId: {
      type: String,
      required: [true, 'Please provide hospital ID'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Please provide hospital address'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'Please provide city'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'Please provide state'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please provide contact phone number'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide official email'],
      lowercase: true,
      trim: true,
    },
    contactPerson: {
      type: String,
      required: [true, 'Please provide primary contact person'],
      trim: true,
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

const Hospital = mongoose.model('Hospital', hospitalSchema);
export default Hospital;
