import mongoose from 'mongoose';

const gpsVehicleSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    plateNumber: {
      type: String,
      required: true,
      trim: true,
    },
    collector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['In Transit', 'At Facility', 'Idle', 'Maintenance'],
      default: 'Idle',
    },
    currentCoordinates: {
      lat: { type: Number, default: 40.7128 },
      lng: { type: Number, default: -74.0060 },
    },
    destination: {
      hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', default: null },
      address: { type: String, default: '' },
    },
    activeRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CollectionRequest',
      default: null,
    },
    speedKmH: {
      type: Number,
      default: 0,
    },
    cargoTemperature: {
      type: Number,
      default: 4.2, // Cold storage °C
    },
    routeProgress: {
      type: Number,
      default: 35, // percentage 0-100
    },
    routeWaypoints: [
      {
        name: { type: String, default: '' },
        lat: { type: Number, default: 0 },
        lng: { type: Number, default: 0 },
        completed: { type: Boolean, default: false },
        time: { type: String, default: '' },
      },
    ],
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const GpsVehicle = mongoose.model('GpsVehicle', gpsVehicleSchema);
export default GpsVehicle;
