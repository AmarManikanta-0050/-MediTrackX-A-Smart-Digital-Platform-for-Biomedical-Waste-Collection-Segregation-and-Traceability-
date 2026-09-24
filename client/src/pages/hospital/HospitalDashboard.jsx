import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import GlassCard from '../../components/common/GlassCard';
import StatCard from '../../components/common/StatCard';
import ProgressBar from '../../components/common/ProgressBar';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import EmptyState from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  FileText,
  Plus,
  Truck,
  Trash2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2,
  AlertTriangle,
} from 'lucide-react';

const HospitalDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [bins, setBins] = useState([]);
  const [recentWaste, setRecentWaste] = useState([]);
  const [activeRequests, setActiveRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHospitalData = async () => {
      try {
        setLoading(true);
        const [statsRes, binsRes, wasteRes, reqRes] = await Promise.all([
          api.get('/reports/dashboard'),
          api.get('/bins'),
          api.get('/waste?limit=5'),
          api.get('/collections?limit=5'),
        ]);

        if (statsRes?.data) setStats(statsRes.data);
        if (binsRes?.data) setBins(binsRes.data);
        if (wasteRes?.data) setRecentWaste(wasteRes.data);
        if (reqRes?.data) setActiveRequests(reqRes.data);
      } catch (err) {
        console.error('Failed to load hospital dashboard:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHospitalData();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading hospital facility operations..." />;
  }

  return (
    <div className="space-y-6">
      {/* Top Facility Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center space-x-2 text-teal-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>{user?.hospital?.name || 'Healthcare Facility Portal'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Facility Waste Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Segregation logging, collection dispatching & digital traceability
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center space-x-2">
          <Link
            to="/hospital/waste"
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 shadow-glow-teal flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Log Waste</span>
          </Link>
          <Link
            to="/hospital/requests"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center space-x-1.5 transition-colors"
          >
            <Truck className="w-4 h-4 text-teal-400" />
            <span>Request Pickup</span>
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Waste"
          value={stats?.todayWaste || 0}
          unit="KG"
          icon={FileText}
          colorScheme="teal"
        />
        <StatCard
          title="Pending Pickups"
          value={stats?.pendingRequests || 0}
          icon={Clock}
          colorScheme="amber"
        />
        <StatCard
          title="Facility Smart Bins"
          value={bins.length}
          icon={Trash2}
          colorScheme="blue"
        />
        <StatCard
          title="Completed Collections"
          value={stats?.completedCollections || 0}
          icon={ShieldCheck}
          colorScheme="emerald"
        />
      </div>

      {/* Smart Bins Fill Level Overview */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Facility Bins Fill Level Telemetry
            </h3>
            <p className="text-xs text-slate-400">Current waste volume vs capacity threshold</p>
          </div>
          <Link
            to="/hospital/bins"
            className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center space-x-1"
          >
            <span>View All Bins</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {bins.length === 0 ? (
          <EmptyState
            icon={Trash2}
            title="No smart bins assigned"
            description="Contact administrator to configure bins for your facility wards."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bins.slice(0, 6).map((bin) => {
              const util = Math.min(Math.round(((bin.currentLevel || 0) / (bin.capacity || 1)) * 100), 100);
              const isFull = util >= 90;

              return (
                <div
                  key={bin._id}
                  className={`p-4 rounded-xl bg-slate-900/60 border transition-all ${
                    isFull ? 'border-rose-500/50 ring-1 ring-rose-500/20' : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                      {bin.binId}
                    </span>
                    <StatusBadge status={bin.status} size="sm" />
                  </div>
                  <h4 className="text-xs font-bold text-white truncate mb-1">{bin.department}</h4>
                  <p className="text-[11px] text-slate-400 mb-3 truncate">
                    {bin.category?.name || 'General'}
                  </p>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/40">
                    <ProgressBar
                      value={bin.currentLevel}
                      max={bin.capacity}
                      label="Level:"
                      subLabel={`${bin.currentLevel} / ${bin.capacity} KG`}
                      showPercent={true}
                      size="sm"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>

      {/* Split Section: Recent Waste Entries & Collection Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Waste Records */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Recent Segregated Waste Records
              </h3>
              <p className="text-xs text-slate-400">Biomedical waste logged in wards</p>
            </div>
            <Link
              to="/hospital/waste"
              className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentWaste.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No waste logged yet"
              description="Click '+ Log Waste' to record hazardous or sharp waste."
            />
          ) : (
            <div className="divide-y divide-slate-800">
              {recentWaste.map((w) => (
                <div key={w._id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-teal-400">{w.wasteId}</span>
                      <StatusBadge status={w.status} size="sm" />
                    </div>
                    <div className="mt-1 text-slate-400">
                      <span>{w.category?.name}</span> • <span>{w.department}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-white text-sm">
                      {w.quantity} {w.unit}
                    </span>
                    <div className="text-[10px] text-slate-500">
                      {new Date(w.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Active Collection Requests */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Active Collection Requests
              </h3>
              <p className="text-xs text-slate-400">Status of collector pickups and dispatches</p>
            </div>
            <Link
              to="/hospital/requests"
              className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {activeRequests.length === 0 ? (
            <EmptyState
              icon={Truck}
              title="No active collection requests"
              description="Request collection once sufficient waste has accumulated."
            />
          ) : (
            <div className="divide-y divide-slate-800">
              {activeRequests.map((req) => (
                <div key={req._id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-teal-400">{req.requestId}</span>
                      <PriorityBadge priority={req.priority} />
                    </div>
                    <div className="mt-1 text-slate-400">
                      Collector: {req.collector?.name || <span className="italic text-amber-400">Awaiting assignment</span>}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <StatusBadge status={req.status} size="sm" />
                    <Link
                      to={`/collections/${req.requestId}`}
                      className="text-slate-400 hover:text-white"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};

export default HospitalDashboard;
