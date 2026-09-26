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
  Activity,
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
    <div className="space-y-6 animate-fade-up">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
              {user?.hospital?.name || 'Healthcare Facility Portal'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Facility Waste Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Segregation logging, collection dispatching & digital traceability
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to="/hospital/waste"
            className="btn-primary flex items-center space-x-1.5 px-4 py-2 text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Log Waste</span>
          </Link>
          <Link
            to="/hospital/requests"
            className="btn-secondary flex items-center space-x-1.5 px-4 py-2 text-xs"
          >
            <Truck className="w-4 h-4 text-emerald-600" />
            <span>Request Pickup</span>
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Waste" value={stats?.todayWaste || 0} unit="KG" icon={FileText} colorScheme="emerald" />
        <StatCard title="Pending Pickups" value={stats?.pendingRequests || 0} icon={Clock} colorScheme="amber" />
        <StatCard title="Facility Smart Bins" value={bins.length} icon={Trash2} colorScheme="blue" />
        <StatCard title="Completed Collections" value={stats?.completedCollections || 0} icon={ShieldCheck} colorScheme="teal" />
      </div>

      {/* Smart Bins Fill Level */}
      <GlassCard>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Facility Bins Fill Level Telemetry</h3>
            <p className="text-xs text-slate-500 mt-0.5">Current waste volume vs capacity threshold</p>
          </div>
          <Link
            to="/hospital/bins"
            className="text-xs text-emerald-600 hover:text-emerald-800 font-semibold flex items-center space-x-1 transition-colors"
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
                  className={`p-4 rounded-xl border transition-all hover:shadow-sm ${
                    isFull
                      ? 'border-rose-200 bg-rose-50/40 ring-1 ring-rose-200'
                      : 'border-slate-200 bg-white hover:border-emerald-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-lg">
                      {bin.binId}
                    </span>
                    <StatusBadge status={bin.status} size="sm" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 truncate mb-0.5">{bin.department}</h4>
                  <p className="text-[11px] text-slate-500 mb-3 truncate">
                    {bin.category?.name || 'General Waste'}
                  </p>
                  {isFull && (
                    <div className="flex items-center space-x-1 text-[10px] text-rose-600 font-semibold mb-2">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Bin at capacity — pickup required</span>
                    </div>
                  )}
                  <ProgressBar
                    value={bin.currentLevel}
                    max={bin.capacity}
                    label="Fill:"
                    subLabel={`${bin.currentLevel} / ${bin.capacity} KG`}
                    showPercent={true}
                    size="sm"
                  />
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>

      {/* Split: Recent Waste & Collection Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Waste Records */}
        <GlassCard className="p-0 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Recent Segregated Waste Records</h3>
              <p className="text-xs text-slate-500 mt-0.5">Biomedical waste logged in wards</p>
            </div>
            <Link
              to="/hospital/waste"
              className="text-xs text-emerald-600 hover:text-emerald-800 font-semibold flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentWaste.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={FileText}
                title="No waste logged yet"
                description="Click '+ Log Waste' to record hazardous or sharp waste."
              />
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentWaste.map((w) => (
                <div key={w._id} className="px-5 py-3.5 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-emerald-600">{w.wasteId}</span>
                      <StatusBadge status={w.status} size="sm" />
                    </div>
                    <div className="mt-1 text-slate-500">
                      <span>{w.category?.name}</span>
                      <span className="mx-1 text-slate-300">·</span>
                      <span>{w.department}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-800 text-sm">
                      {w.quantity} {w.unit}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(w.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Active Collection Requests */}
        <GlassCard className="p-0 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Active Collection Requests</h3>
              <p className="text-xs text-slate-500 mt-0.5">Status of collector pickups and dispatches</p>
            </div>
            <Link
              to="/hospital/requests"
              className="text-xs text-emerald-600 hover:text-emerald-800 font-semibold flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {activeRequests.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={Truck}
                title="No active collection requests"
                description="Request collection once sufficient waste has accumulated."
              />
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {activeRequests.map((req) => (
                <div key={req._id} className="px-5 py-3.5 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-emerald-600">{req.requestId}</span>
                      <PriorityBadge priority={req.priority} />
                    </div>
                    <div className="mt-1 text-slate-500">
                      Collector: {req.collector?.name || (
                        <span className="italic text-amber-600">Awaiting assignment</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <StatusBadge status={req.status} size="sm" />
                    <Link
                      to={`/collections/${req.requestId}`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
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
