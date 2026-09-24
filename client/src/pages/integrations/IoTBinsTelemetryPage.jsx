import React, { useState, useEffect } from 'react';
import { iotService } from '../../services/iotService';
import { useNotification } from '../../context/NotificationContext';
import GlassCard from '../../components/common/GlassCard';
import StatCard from '../../components/common/StatCard';
import ProgressBar from '../../components/common/ProgressBar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import {
  Radio,
  Sliders,
  Thermometer,
  BatteryCharging,
  Wifi,
  AlertTriangle,
  RotateCcw,
  Zap,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Gauge,
  Activity,
} from 'lucide-react';

const IoTBinsTelemetryPage = () => {
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [telemetrySummary, setTelemetrySummary] = useState(null);
  const [bins, setBins] = useState([]);
  const [pulsing, setPulsing] = useState(false);

  // Manual Adjustment Modal
  const [selectedBin, setSelectedBin] = useState(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustForm, setAdjustForm] = useState({
    currentLevel: 0,
    temperatureCelsius: 22.0,
    lidStatus: 'Closed',
    batteryLevel: 95,
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchLiveTelemetry();
    const interval = setInterval(fetchLiveTelemetry, 12000); // 12-second live polling
    return () => clearInterval(interval);
  }, []);

  const fetchLiveTelemetry = async () => {
    try {
      const res = await iotService.getLiveTelemetry();
      if (res.success) {
        setTelemetrySummary(res.summary);
        setBins(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch IoT telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePulse = async () => {
    try {
      setPulsing(true);
      const res = await iotService.simulatePulse();
      if (res.success) {
        showSuccess('IoT simulated packet broadcasted to smart bin edge nodes');
        await fetchLiveTelemetry();
      }
    } catch (err) {
      showError(err.message || 'Simulation pulse failed');
    } finally {
      setPulsing(false);
    }
  };

  const handleCalibrate = async (binId) => {
    try {
      const res = await iotService.calibrateBin(binId);
      if (res.success) {
        showSuccess(`Bin ${binId} load-cell re-tared to zero baseline`);
        await fetchLiveTelemetry();
      }
    } catch (err) {
      showError(err.message || 'Sensor calibration failed');
    }
  };

  const openAdjustModal = (bin) => {
    setSelectedBin(bin);
    setAdjustForm({
      currentLevel: bin.currentLevel,
      temperatureCelsius: bin.temperatureCelsius,
      lidStatus: bin.lidStatus,
      batteryLevel: bin.batteryLevel,
    });
    setIsAdjustModalOpen(true);
  };

  const handleSaveAdjust = async (e) => {
    e.preventDefault();
    if (!selectedBin) return;

    try {
      setUpdating(true);
      const res = await iotService.updateBinTelemetry(selectedBin.binId, adjustForm);
      if (res.success) {
        showSuccess(`Smart bin ${selectedBin.binId} telemetry updated!`);
        setIsAdjustModalOpen(false);
        await fetchLiveTelemetry();
      }
    } catch (err) {
      showError(err.message || 'Failed to update telemetry');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Future Work Module 2
            </span>
            <span className="text-xs text-slate-400">LoRaWAN & MQTT Telemetry Stream</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1 flex items-center space-x-2">
            <Radio className="w-6 h-6 text-blue-400 animate-pulse" />
            <span>IoT Smart Bins Telemetry Stream</span>
          </h1>
          <p className="text-sm text-slate-400">
            Real-time ultrasonic fill tracking, load-cell mass sensors, thermal anomaly detection, and tamper telemetry.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleSimulatePulse}
            disabled={pulsing}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-navy-950 font-semibold text-xs shadow-glow-teal transition-all duration-200 disabled:opacity-50"
          >
            <Zap className={`w-4 h-4 ${pulsing ? 'animate-bounce' : ''}`} />
            <span>Simulate Sensor Pulse</span>
          </button>
          <button
            onClick={fetchLiveTelemetry}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Gateway & Facility Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Smart Bins"
          value={telemetrySummary?.totalBins || bins.length}
          subtitle="100% telemetry online"
          icon={Trash2}
          color="blue"
        />
        <StatCard
          title="Average Utilization"
          value={`${telemetrySummary?.avgFillPercentage || 0}%`}
          subtitle="Fleet-wide fill capacity"
          icon={Gauge}
          color="teal"
        />
        <StatCard
          title="Critical Fill Alerts"
          value={telemetrySummary?.criticalBins || 0}
          subtitle="Fill > 85% or temp > 30°C"
          icon={AlertTriangle}
          color={telemetrySummary?.criticalBins > 0 ? 'red' : 'emerald'}
        />
        <StatCard
          title="IoT Gateway Protocol"
          value="LoRaWAN Class C"
          subtitle="MQTT Broker TLS Encrypted"
          icon={Activity}
          color="purple"
        />
      </div>

      {/* Live Smart Bins Telemetry Grid */}
      {loading ? (
        <div className="py-24 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {bins.map((bin) => {
            const isCritical = bin.alertStatus === 'Critical';
            const isWarning = bin.alertStatus === 'Warning';

            return (
              <GlassCard
                key={bin.binId}
                className={`p-5 transition-all duration-200 border ${
                  isCritical
                    ? 'border-red-500/50 bg-red-950/20 shadow-[0_0_20px_rgba(239,68,68,0.15)]'
                    : isWarning
                    ? 'border-amber-500/40 bg-amber-950/15'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-white tracking-wide">{bin.binId}</span>
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase"
                        style={{ backgroundColor: bin.category?.colorCode || '#0D9488' }}
                      >
                        {bin.category?.code || 'BIO'}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-300">{bin.department}</p>
                    <p className="text-[11px] text-slate-400 truncate max-w-[220px]">
                      {bin.locationDescription || bin.hospital?.name}
                    </p>
                  </div>

                  {/* Status Indicator Pill */}
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center space-x-1 ${
                      isCritical
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                        : isWarning
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    <span>{bin.alertStatus}</span>
                  </span>
                </div>

                {/* Ultrasonic Fill Level Bar */}
                <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-semibold flex items-center space-x-1">
                      <Gauge className="w-3.5 h-3.5 text-blue-400" />
                      <span>Ultrasonic Level</span>
                    </span>
                    <span className="font-mono font-bold text-white">
                      {bin.currentLevel} / {bin.capacity} KG ({bin.fillPercentage}%)
                    </span>
                  </div>
                  <ProgressBar
                    value={bin.fillPercentage}
                    color={isCritical ? 'red' : isWarning ? 'yellow' : 'teal'}
                    height="h-2.5"
                  />
                </div>

                {/* Telemetry Sensor Metrics Quadrant */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  {/* Temperature */}
                  <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 text-slate-400">
                      <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                      <span>Core Temp</span>
                    </div>
                    <span
                      className={`font-mono font-bold ${
                        bin.temperatureCelsius > 30 ? 'text-red-400' : 'text-slate-200'
                      }`}
                    >
                      {bin.temperatureCelsius}°C
                    </span>
                  </div>

                  {/* Lid State */}
                  <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 text-slate-400">
                      <Radio className="w-3.5 h-3.5 text-blue-400" />
                      <span>Lid State</span>
                    </div>
                    <span
                      className={`font-semibold text-[11px] ${
                        bin.lidStatus === 'Open' ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {bin.lidStatus}
                    </span>
                  </div>

                  {/* Battery */}
                  <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 text-slate-400">
                      <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Battery</span>
                    </div>
                    <span className="font-mono font-semibold text-slate-200">{bin.batteryLevel}%</span>
                  </div>

                  {/* LoRaWAN Signal */}
                  <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 text-slate-400">
                      <Wifi className="w-3.5 h-3.5 text-teal-400" />
                      <span>Signal</span>
                    </div>
                    <span className="font-mono font-semibold text-slate-200">{bin.signalDbm} dBm</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleCalibrate(bin.binId)}
                    className="flex items-center space-x-1 text-slate-400 hover:text-teal-400 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Tare / Zero</span>
                  </button>

                  <button
                    onClick={() => openAdjustModal(bin)}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                  >
                    <Sliders className="w-3 h-3 text-blue-400" />
                    <span>Simulate Sensor</span>
                  </button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Adjust Sensor Modal */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title={`Simulate Sensor Feedback: ${selectedBin?.binId}`}
      >
        <form onSubmit={handleSaveAdjust} className="space-y-4">
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Simulated Fill Mass (KG):</span>
              <span className="font-bold text-teal-400">
                {adjustForm.currentLevel} / {selectedBin?.capacity} KG
              </span>
            </div>
            <input
              type="range"
              min="0"
              max={selectedBin?.capacity || 50}
              step="0.5"
              value={adjustForm.currentLevel}
              onChange={(e) =>
                setAdjustForm({ ...adjustForm, currentLevel: parseFloat(e.target.value) })
              }
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Simulated Core Temp (°C):</span>
              <span className="font-bold text-amber-400">{adjustForm.temperatureCelsius}°C</span>
            </div>
            <input
              type="range"
              min="15"
              max="42"
              step="0.5"
              value={adjustForm.temperatureCelsius}
              onChange={(e) =>
                setAdjustForm({ ...adjustForm, temperatureCelsius: parseFloat(e.target.value) })
              }
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Lid Status</label>
              <select
                value={adjustForm.lidStatus}
                onChange={(e) => setAdjustForm({ ...adjustForm, lidStatus: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white"
              >
                <option value="Closed">Hermetically Closed</option>
                <option value="Open">Lid Open</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Battery Level (%)</label>
              <input
                type="number"
                min="5"
                max="100"
                value={adjustForm.batteryLevel}
                onChange={(e) => setAdjustForm({ ...adjustForm, batteryLevel: parseInt(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={() => setIsAdjustModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-500 hover:bg-blue-400 text-navy-950 disabled:opacity-50"
            >
              {updating ? 'Transmitting...' : 'Apply Telemetry'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default IoTBinsTelemetryPage;
