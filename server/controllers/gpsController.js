import GpsVehicle from '../models/GpsVehicle.js';
import Hospital from '../models/Hospital.js';
import User from '../models/User.js';
import CollectionRequest from '../models/CollectionRequest.js';

// Pre-defined GPS route trajectories between hospitals & central treatment facility
const DEFAULT_COORDINATES = [
  { lat: 40.7128, lng: -74.006 }, // Downtown / Apex Hospital
  { lat: 40.7306, lng: -73.9866 }, // Midtown / St. Jude
  { lat: 40.7589, lng: -73.9851 }, // Northview / Central Treatment Hub
  { lat: 40.7484, lng: -73.9857 }, // South Bay
];

// Helper to seed initial fleet if empty
const ensureFleetExists = async () => {
  const count = await GpsVehicle.countDocuments();
  if (count > 0) return;

  const hospitals = await Hospital.find().limit(3);
  const collectors = await User.find({ role: 'collector' }).limit(2);
  const activeRequest = await CollectionRequest.findOne({ status: 'Assigned' });

  const seedVehicles = [
    {
      vehicleId: 'TRUCK-BIO-01',
      plateNumber: 'MED-789-NY',
      collector: collectors[0] ? collectors[0]._id : null,
      status: 'In Transit',
      currentCoordinates: { lat: 40.7185, lng: -74.0012 },
      destination: {
        hospital: hospitals[0] ? hospitals[0]._id : null,
        address: hospitals[0] ? hospitals[0].address : '450 Healthcare Boulevard',
      },
      activeRequest: activeRequest ? activeRequest._id : null,
      speedKmH: 48,
      fuelLevel: 82,
      cargoTemperature: 4.1,
      routeProgress: 42,
      routeWaypoints: [
        { name: 'Apex Super Specialty Hospital (Pickup)', lat: 40.7128, lng: -74.006, completed: true, time: '09:15 AM' },
        { name: 'Transit Corridor Expressway I-80', lat: 40.7255, lng: -73.995, completed: true, time: '09:35 AM' },
        { name: 'Biohazard Treatment Facility Bay 4', lat: 40.7589, lng: -73.9851, completed: false, time: 'ETA 10:10 AM' },
      ],
    },
    {
      vehicleId: 'VAN-MED-02',
      plateNumber: 'HAZ-441-NY',
      collector: collectors[1] ? collectors[1]._id : null,
      status: 'At Facility',
      currentCoordinates: { lat: 40.7306, lng: -73.9866 },
      destination: {
        hospital: hospitals[1] ? hospitals[1]._id : null,
        address: hospitals[1] ? hospitals[1].address : '88 Wellness Avenue',
      },
      activeRequest: null,
      speedKmH: 0,
      fuelLevel: 94,
      cargoTemperature: 3.8,
      routeProgress: 100,
      routeWaypoints: [
        { name: 'Depot Departure Station', lat: 40.721, lng: -73.992, completed: true, time: '08:00 AM' },
        { name: 'St. Jude Children Research Center (Docked)', lat: 40.7306, lng: -73.9866, completed: true, time: '08:45 AM' },
      ],
    },
    {
      vehicleId: 'TRUCK-HAZ-03',
      plateNumber: 'BIO-902-NY',
      collector: collectors[0] ? collectors[0]._id : null,
      status: 'Idle',
      currentCoordinates: { lat: 40.7484, lng: -73.9857 },
      destination: {
        hospital: null,
        address: 'Central Hazardous Waste Transfer Depot',
      },
      activeRequest: null,
      speedKmH: 0,
      fuelLevel: 65,
      cargoTemperature: 5.0,
      routeProgress: 0,
      routeWaypoints: [
        { name: 'Central Transfer Depot', lat: 40.7484, lng: -73.9857, completed: true, time: 'Standby' },
      ],
    },
  ];

  await GpsVehicle.insertMany(seedVehicles);
};

// @desc    Get all GPS fleet vehicles with telemetry
// @route   GET /api/gps/vehicles
// @access  Private
export const getFleetVehicles = async (req, res, next) => {
  try {
    await ensureFleetExists();

    const vehicles = await GpsVehicle.find()
      .populate('collector', 'name email phone')
      .populate('destination.hospital', 'name address hospitalId city')
      .populate('activeRequest', 'requestId priority status')
      .sort({ vehicleId: 1 });

    const totalFleet = vehicles.length;
    const inTransit = vehicles.filter((v) => v.status === 'In Transit').length;
    const atFacility = vehicles.filter((v) => v.status === 'At Facility').length;
    const idleCount = vehicles.filter((v) => v.status === 'Idle').length;

    res.status(200).json({
      success: true,
      summary: {
        totalFleet,
        inTransit,
        atFacility,
        idleCount,
        avgCargoTemp: '4.3°C (Target: 2-8°C)',
        activeGeofenceAlerts: 0,
      },
      data: vehicles,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update vehicle coordinates and sensor state
// @route   POST /api/gps/vehicles/:vehicleId/location
// @access  Private
export const updateVehicleLocation = async (req, res, next) => {
  try {
    const { vehicleId } = req.params;
    const { lat, lng, speedKmH, cargoTemperature, fuelLevel, status, routeProgress } = req.body;

    const vehicle = await GpsVehicle.findOne({ vehicleId: vehicleId.toUpperCase() });
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'GPS Vehicle not found' });
    }

    if (lat !== undefined && lng !== undefined) {
      vehicle.currentCoordinates = { lat: Number(lat), lng: Number(lng) };
    }
    if (speedKmH !== undefined) vehicle.speedKmH = Number(speedKmH);
    if (cargoTemperature !== undefined) vehicle.cargoTemperature = Number(cargoTemperature);
    if (fuelLevel !== undefined) vehicle.fuelLevel = Number(fuelLevel);
    if (status !== undefined) vehicle.status = status;
    if (routeProgress !== undefined) vehicle.routeProgress = Number(routeProgress);
    vehicle.lastUpdated = new Date();

    await vehicle.save();

    res.status(200).json({
      success: true,
      message: `GPS telemetry updated for ${vehicle.vehicleId}`,
      data: vehicle,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Simulate movement step along route for live GPS simulation demo
// @route   POST /api/gps/simulate-step
// @access  Private
export const simulateFleetMovement = async (req, res, next) => {
  try {
    await ensureFleetExists();
    const vehicles = await GpsVehicle.find({ status: { $in: ['In Transit', 'At Facility'] } });

    for (const vehicle of vehicles) {
      if (vehicle.status === 'In Transit') {
        // Increment route progress
        let newProgress = (vehicle.routeProgress || 0) + 12;
        if (newProgress >= 100) {
          vehicle.routeProgress = 100;
          vehicle.status = 'At Facility';
          vehicle.speedKmH = 0;
        } else {
          vehicle.routeProgress = newProgress;
          vehicle.speedKmH = Math.floor(40 + Math.random() * 25);
          // Nudge coordinates slightly along vector
          vehicle.currentCoordinates.lat += 0.0015;
          vehicle.currentCoordinates.lng += 0.0012;
        }
      } else if (vehicle.status === 'At Facility') {
        // Toggle back to In Transit for continuous dynamic simulation demo
        vehicle.status = 'In Transit';
        vehicle.routeProgress = 5;
        vehicle.speedKmH = 45;
        vehicle.currentCoordinates = { lat: 40.715, lng: -74.004 };
      }

      // Small cold-chain sensor fluctuation
      vehicle.cargoTemperature = Math.round((4.0 + (Math.random() * 0.8 - 0.4)) * 10) / 10;
      vehicle.lastUpdated = new Date();
      await vehicle.save();
    }

    const updated = await GpsVehicle.find()
      .populate('collector', 'name email phone')
      .populate('destination.hospital', 'name address hospitalId city')
      .populate('activeRequest', 'requestId priority status');

    res.status(200).json({
      success: true,
      message: 'Fleet coordinates and route progress successfully simulated',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed route waypoints and breadcrumbs for vehicle
// @route   GET /api/gps/vehicles/:vehicleId/route
// @access  Private
export const getVehicleRoute = async (req, res, next) => {
  try {
    const { vehicleId } = req.params;
    const vehicle = await GpsVehicle.findOne({ vehicleId: vehicleId.toUpperCase() })
      .populate('collector', 'name phone email')
      .populate('destination.hospital');

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        vehicleId: vehicle.vehicleId,
        plateNumber: vehicle.plateNumber,
        status: vehicle.status,
        currentCoordinates: vehicle.currentCoordinates,
        cargoTemperature: vehicle.cargoTemperature,
        speedKmH: vehicle.speedKmH,
        routeProgress: vehicle.routeProgress,
        waypoints: vehicle.routeWaypoints,
        collector: vehicle.collector,
        destination: vehicle.destination,
      },
    });
  } catch (error) {
    next(error);
  }
};
