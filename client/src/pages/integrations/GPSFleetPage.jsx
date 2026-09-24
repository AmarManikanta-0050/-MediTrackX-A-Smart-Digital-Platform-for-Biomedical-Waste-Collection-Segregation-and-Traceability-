import React, { useState, useEffect } from 'react';
import { gpsService } from '../../services/gpsService';
import { useNotification } from '../../context/NotificationContext';
import GlassCard from '../../components/common/GlassCard';
import StatCard from '../../components/common/StatCard';
import ProgressBar from '../../components/common/ProgressBar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Truck,
  Navigation,
  Thermometer,
  Fuel,
  Gauge,
  MapPin,
  Clock,
  ShieldCheck,
  RefreshCw,
  Play,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

const GPSFleetPage = () => {
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    fetchFleet();
    const interval = setInterval(fetchFleet, 10000); // 10s auto-refresh
    return () => clearInterval(interval);
  }, []);

  const fetchFleet = async () => {
    try {
      const res = await gpsService.getFleet();
      if (res.success) {
        setSummary(res.summary);
        setVehicles(res.data);
        if (!selectedVehicle && res.data.length > 0) {
          setSelectedVehicle(res.data[0]);
        } else if (selectedVehicle) {
          const updated = res.data.find((v) => v.vehicleId === selectedVehicle.vehicleId);
          if (updated) setSelectedVehicle(updated);
        }
      }
    } catch (err) {
      console.error('Failed to load GPS fleet:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateStep = async () => {
    try {
      setSimulating(true);
      const res = await gpsService.simulateStep();
      if (res.success) {
        showSuccess('Fleet vehicles navigated forward along designated GPS corridors');
        setVehicles(res.data);
        if (selectedVehicle) {
          const updated = res.data.find((v) => v.vehicleId === selectedVehicle.vehicleId);
          if (updated) setSelectedVehicle(updated);
        }
      }
    } catch (err) {
      showError(err.message || 'GPS simulation step failed');
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Future Work Module 3
            </span>
            <span className="text-xs text-slate-400">GNSS / Cold-Chain Sensor Telemetry</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1 flex items-center space-x-2">
            <Navigation className="w-6 h-6 text-emerald-400" />
            <span>GPS Fleet Live Vehicle Tracking</span>
          </h1>
          <p className="text-sm text-slate-400">
            Real-time geospatial tracking, temperature-controlled biohazard cargo monitoring, and corridor geofencing.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleSimulateStep}
            disabled={simulating}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-navy-950 font-semibold text-xs shadow-glow-teal transition-all duration-200 disabled:opacity-50"
          >
            <Play className={`w-4 h-4 ${simulating ? 'animate-spin' : ''}`} />
            <span>Simulate Route Step</span>
          </button>
          <button
            onClick={fetchFleet}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Fleet Size"
          value={summary?.totalFleet || vehicles.length}
          subtitle={`${summary?.inTransit || 0} active in transit`}
          icon={Truck}
          color="emerald"
        />
        <StatCard
          title="Cold-Chain Temperature"
          value={summary?.avgCargoTemp?.split(' ')?.[0] || '4.1°C'}
          subtitle="Target: 2°C - 8°C Cold Chain"
          icon={Thermometer}
          color="teal"
        />
        <StatCard
          title="Geofence Integrity"
          value="100% Compliant"
          subtitle="Zero unauthorized deviations"
          icon={ShieldCheck}
          color="blue"
        />
        <StatCard
          title="Fleet Operations"
          value={`${summary?.atFacility || 1} Docked`}
          subtitle={`${summary?.idleCount || 1} on depot standby`}
          icon={MapPin}
          color="purple"
        />
      </div>

      {loading ? (
        <div className="py-24 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Interactive Map & Route Radar (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <GlassCard className="p-5 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <h2 className="text-sm font-bold text-white tracking-wide">
                    Live Geospatial Corridor Radar
                  </h2>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  WGS84 Coordinates System
                </span>
              </div>

              {/* Graphical Simulated Vector Map */}
              <div className="relative w-full h-80 rounded-2xl bg-[#061121] border border-slate-800 overflow-hidden flex items-center justify-center p-4">
                {/* Grid Overlay */}
                <div
                  className="absolute inset-0 opacity-15"
                  style={{
                    backgroundImage:
                      'radial-gradient(rgba(13,148,136,0.3) 1px, transparent 1px), radial-gradient(rgba(13,148,136,0.15) 1px, #061121 1px)',
                    backgroundSize: '30px 30px',
                  }}
                />

                {/* Transit Corridor Polyline Illustration */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <path
                    d="M 80 240 Q 220 120 380 180 T 640 80"
                    fill="none"
                    stroke="#0D9488"
                    strokeWidth="3"
                    strokeDasharray="6,6"
                    className="opacity-70 animate-pulse"
                  />
                  <path
                    d="M 120 80 Q 280 220 540 240"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="2"
                    strokeDasharray="4,4"
                    className="opacity-40"
                  />
                </svg>

                {/* Hospital Nodes */}
                <div className="absolute left-[10%] bottom-[20%] flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center shadow-glow-blue">
                    <MapPin className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="mt-1 text-[10px] font-bold text-slate-300 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800">
                    Apex Super Specialty
                  </span>
                </div>

                <div className="absolute right-[12%] top-[18%] flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 border-2 border-purple-500 flex items-center justify-center shadow-glow-purple">
                    <MapPin className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="mt-1 text-[10px] font-bold text-slate-300 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800">
                    Central Treatment Incinerator
                  </span>
                </div>

                {/* Vehicle Dynamic Pins */}
                {vehicles.map((v, idx) => {
                  const isSelected = selectedVehicle?.vehicleId === v.vehicleId;
                  // Calculate mock position based on route progress
                  const pct = v.routeProgress || 0;
                  const left = Math.min(85, Math.max(15, 15 + (pct * 0.65)));
                  const top = Math.min(75, Math.max(25, 70 - (pct * 0.45) + (idx * 8)));

                  return (
                    <button
                      key={v.vehicleId}
                      onClick={() => setSelectedVehicle(v)}
                      style={{ left: `${left}%`, top: `${top}%` }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-500 flex flex-col items-center group cursor-pointer ${
                        isSelected ? 'z-20 scale-110' : 'z-10 opacity-85 hover:opacity-100'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-2xl flex items-center justify-center border shadow-lg transition-transform ${
                          isSelected
                            ? 'bg-emerald-500 border-white text-navy-950 shadow-glow-teal scale-110'
                            : 'bg-slate-900 border-emerald-500/50 text-emerald-400'
                        }`}
                      >
                        <Truck className="w-4 h-4" />
                      </div>
                      <div className="mt-1 px-2 py-0.5 rounded-md bg-slate-900/95 border border-slate-700 text-[10px] font-bold text-white whitespace-nowrap shadow-md">
                        {v.vehicleId} ({v.speedKmH} km/h)
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Waypoint Route Progression (for selected vehicle) */}
              {selectedVehicle && (
                <div className="mt-5 pt-4 border-t border-slate-800">
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="font-semibold text-slate-300">
                      Route Progress: {selectedVehicle.vehicleId}
                    </span>
                    <span className="font-mono font-bold text-emerald-400">
                      {selectedVehicle.routeProgress}% Dispatched
                    </span>
                  </div>
                  <ProgressBar
                    value={selectedVehicle.routeProgress}
                    color="teal"
                    height="h-2.5"
                  />

                  {/* Waypoint Steps */}
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {selectedVehicle.routeWaypoints?.map((wp, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-xl border text-xs ${
                          wp.completed
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                            : 'bg-slate-900/50 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center space-x-1.5 font-bold mb-1">
                          {wp.completed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                          )}
                          <span>Waypoint {i + 1}</span>
                        </div>
                        <p className="font-medium text-slate-200">{wp.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{wp.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </GlassCard>
          </div>

          {/* Vehicle Telemetry Dossier (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <GlassCard className="p-5">
              <h2 className="text-sm font-bold text-white mb-3 flex items-center space-x-2">
                <Truck className="w-4 h-4 text-emerald-400" />
                <span>Vehicle Fleet Telemetry</span>
              </h2>

              <div className="space-y-3 mb-6">
                {vehicles.map((v) => {
                  const isSelected = selectedVehicle?.vehicleId === v.vehicleId;
                  return (
                    <button
                      key={v.vehicleId}
                      onClick={() => setSelectedVehicle(v)}
                      className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
                        isSelected
                          ? 'bg-emerald-500/15 border-emerald-500/50 shadow-glow-teal text-white'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">{v.vehicleId}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            v.status === 'In Transit'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : v.status === 'At Facility'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {v.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Plate: <span className="font-mono text-slate-300">{v.plateNumber}</span>
                      </p>
                    </button>
                  );
                })}
              </div>

              {selectedVehicle && (
                <div className="pt-4 border-t border-slate-800 space-y-3 text-xs">
                  <h3 className="font-bold text-slate-200">
                    Live Diagnostics: {selectedVehicle.vehicleId}
                  </h3>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
                        <Thermometer className="w-3.5 h-3.5 text-teal-400" />
                        <span>Cargo Temp</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-400 text-sm">
                        {selectedVehicle.cargoTemperature}°C
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
                        <Gauge className="w-3.5 h-3.5 text-blue-400" />
                        <span>Speed</span>
                      </div>
                      <span className="font-mono font-bold text-white text-sm">
                        {selectedVehicle.speedKmH} km/h
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
                        <Fuel className="w-3.5 h-3.5 text-amber-400" />
                        <span>Fuel Level</span>
                      </div>
                      <span className="font-mono font-bold text-slate-200 text-sm">
                        {selectedVehicle.fuelLevel}%
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Geofence</span>
                      </div>
                      <span className="font-semibold text-emerald-400 text-xs">Inside Corridor</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                    <p className="text-[11px] text-slate-400">Assigned Driver / Collector:</p>
                    <p className="font-bold text-slate-200">
                      {selectedVehicle.collector?.name || 'Unassigned'}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {selectedVehicle.collector?.phone || '+1 (555) 901-0003'}
                    </p>
                  </div>
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
};

export default GPSFleetPage;
