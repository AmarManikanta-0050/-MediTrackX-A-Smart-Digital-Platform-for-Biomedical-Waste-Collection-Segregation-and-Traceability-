import Bin from '../models/Bin.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

// In-memory telemetry cache for high-frequency sensor readings
const sensorCache = new Map();

const getOrInitSensorData = (bin) => {
  const key = bin._id.toString();
  if (!sensorCache.has(key)) {
    const fillPct = bin.capacity > 0 ? (bin.currentLevel / bin.capacity) * 100 : 0;
    sensorCache.set(key, {
      temperatureCelsius: Math.round((21.2 + Math.random() * 2.8) * 10) / 10,
      lidStatus: Math.random() > 0.85 ? 'Open' : 'Closed',
      batteryLevel: Math.floor(88 + Math.random() * 12),
      signalDbm: Math.floor(-60 - Math.random() * 18),
      odorIndexVoc: Math.round((8.5 + Math.random() * 8.0) * 10) / 10,
      tamperAlert: false,
      lastTransmission: new Date(),
    });
  }
  return sensorCache.get(key);
};

// @desc    Get live telemetry for all smart bins across facility
// @route   GET /api/iot/live
// @access  Private
export const getLiveTelemetry = async (req, res, next) => {
  try {
    const query = {};
    if (req.user.role === 'hospital_staff' && req.user.hospital) {
      query.hospital = req.user.hospital;
    }

    const bins = await Bin.find(query)
      .populate('hospital', 'name hospitalId city')
      .populate('category', 'name code colorCode hazardLevel')
      .sort({ updatedAt: -1 });

    const telemetryData = bins.map((bin) => {
      const sensor = getOrInitSensorData(bin);
      const fillPercentage = bin.capacity > 0 ? Math.min(100, Math.round(((bin.currentLevel / bin.capacity) * 100) * 10) / 10) : 0;

      let alertStatus = 'Normal';
      if (fillPercentage >= 85 || sensor.temperatureCelsius >= 32) {
        alertStatus = 'Critical';
      } else if (fillPercentage >= 70 || sensor.temperatureCelsius >= 28) {
        alertStatus = 'Warning';
      }

      return {
        _id: bin._id,
        binId: bin.binId,
        hospital: bin.hospital,
        department: bin.department,
        locationDescription: bin.locationDescription,
        category: bin.category,
        capacity: bin.capacity,
        currentLevel: bin.currentLevel,
        fillPercentage,
        temperatureCelsius: sensor.temperatureCelsius,
        lidStatus: sensor.lidStatus,
        batteryLevel: sensor.batteryLevel,
        signalDbm: sensor.signalDbm,
        odorIndexVoc: sensor.odorIndexVoc,
        tamperAlert: sensor.tamperAlert,
        lastTransmission: sensor.lastTransmission,
        alertStatus,
        status: bin.status,
      };
    });

    const totalBins = telemetryData.length;
    const criticalBins = telemetryData.filter((b) => b.alertStatus === 'Critical').length;
    const warningBins = telemetryData.filter((b) => b.alertStatus === 'Warning').length;
    const avgFillPercentage = totalBins > 0
      ? Math.round((telemetryData.reduce((acc, curr) => acc + curr.fillPercentage, 0) / totalBins) * 10) / 10
      : 0;

    res.status(200).json({
      success: true,
      summary: {
        totalBins,
        onlineCount: totalBins,
        criticalBins,
        warningBins,
        avgFillPercentage,
        gatewayProtocol: 'LoRaWAN Class C / MQTT over TLS',
        gatewayStatus: 'Operational',
      },
      data: telemetryData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update single bin telemetry / simulate sensor payload
// @route   POST /api/iot/bins/:binId/telemetry
// @access  Private
export const updateBinTelemetry = async (req, res, next) => {
  try {
    const { binId } = req.params;
    const { currentLevel, temperatureCelsius, lidStatus, batteryLevel } = req.body;

    const bin = await Bin.findOne({
      $or: [{ binId: binId.toUpperCase() }, { _id: binId.match(/^[0-9a-fA-F]{24}$/) ? binId : null }],
    });

    if (!bin) {
      return res.status(404).json({ success: false, message: 'Smart Bin not found' });
    }

    if (currentLevel !== undefined) {
      bin.currentLevel = Math.max(0, Math.min(bin.capacity, Number(currentLevel)));
      const fillPct = (bin.currentLevel / bin.capacity) * 100;
      if (fillPct >= 85) {
        bin.status = 'Full';

        // Trigger notification if critical threshold crossed
        const admins = await User.find({ role: 'admin' }).select('_id');
        const notifPromises = admins.map((adm) =>
          Notification.create({
            user: adm._id,
            title: `IoT Alert: Bin ${bin.binId} Critical Fill (${Math.round(fillPct)}%)`,
            message: `Ultrasonic sensor reports smart bin ${bin.binId} at ${bin.department} has crossed safe threshold. Immediate pickup requested.`,
            type: 'urgent',
            link: '/admin/bins',
          })
        );
        await Promise.all(notifPromises);
      } else if (bin.status === 'Full' && fillPct < 80) {
        bin.status = 'Active';
      }
      await bin.save();
    }

    // Update sensor cache
    const key = bin._id.toString();
    const currentSensor = getOrInitSensorData(bin);
    sensorCache.set(key, {
      ...currentSensor,
      temperatureCelsius: temperatureCelsius !== undefined ? Number(temperatureCelsius) : currentSensor.temperatureCelsius,
      lidStatus: lidStatus || currentSensor.lidStatus,
      batteryLevel: batteryLevel !== undefined ? Number(batteryLevel) : currentSensor.batteryLevel,
      lastTransmission: new Date(),
    });

    res.status(200).json({
      success: true,
      message: `Telemetry updated successfully for ${bin.binId}`,
      data: {
        binId: bin.binId,
        currentLevel: bin.currentLevel,
        capacity: bin.capacity,
        fillPercentage: Math.round(((bin.currentLevel / bin.capacity) * 100) * 10) / 10,
        status: bin.status,
        ...sensorCache.get(key),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Simulate IoT pulse tick (fluctuate fill levels and temperatures)
// @route   POST /api/iot/simulator/tick
// @access  Private
export const simulateTelemetryPulse = async (req, res, next) => {
  try {
    const bins = await Bin.find();
    let updatedCount = 0;

    for (const bin of bins) {
      const key = bin._id.toString();
      const current = getOrInitSensorData(bin);

      // Minor random walk in temperature (+/- 0.4°C)
      const tempDelta = (Math.random() * 0.8 - 0.4);
      const newTemp = Math.round(Math.max(18.0, Math.min(36.0, current.temperatureCelsius + tempDelta)) * 10) / 10;

      // Occasional lid state toggle
      const newLid = Math.random() > 0.8 ? (current.lidStatus === 'Closed' ? 'Open' : 'Closed') : current.lidStatus;

      // Minor sensor drift
      sensorCache.set(key, {
        ...current,
        temperatureCelsius: newTemp,
        lidStatus: newLid,
        lastTransmission: new Date(),
      });
      updatedCount++;
    }

    res.status(200).json({
      success: true,
      message: `IoT simulated pulse broadcasted across ${updatedCount} connected smart bins`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Calibrate smart bin sensor baseline (Tare / Zero)
// @route   POST /api/iot/bins/:binId/calibrate
// @access  Private
export const calibrateSensor = async (req, res, next) => {
  try {
    const { binId } = req.params;
    const bin = await Bin.findOne({
      $or: [{ binId: binId.toUpperCase() }, { _id: binId.match(/^[0-9a-fA-F]{24}$/) ? binId : null }],
    });

    if (!bin) {
      return res.status(404).json({ success: false, message: 'Smart Bin not found' });
    }

    // Reset level to 0.0 KG (emptied / tared)
    bin.currentLevel = 0.0;
    bin.status = 'Active';
    await bin.save();

    const key = bin._id.toString();
    sensorCache.set(key, {
      temperatureCelsius: 21.0,
      lidStatus: 'Closed',
      batteryLevel: 98,
      signalDbm: -62,
      odorIndexVoc: 4.2,
      tamperAlert: false,
      lastTransmission: new Date(),
    });

    res.status(200).json({
      success: true,
      message: `Smart Bin ${bin.binId} ultrasonic sensor & load cell re-tared successfully to zero baseline`,
      data: bin,
    });
  } catch (error) {
    next(error);
  }
};
