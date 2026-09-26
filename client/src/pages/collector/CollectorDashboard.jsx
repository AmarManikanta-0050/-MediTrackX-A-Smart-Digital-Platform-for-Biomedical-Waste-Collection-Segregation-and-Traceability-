import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import GlassCard from '../../components/common/GlassCard';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import EmptyState from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Package,
  Activity,
} from 'lucide-react';

const CollectorDashboard = () => {
  const [stats, setStats] = useState(null);
  const [activeRequests, setActiveRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollectorData = async () => {
      try {
        setLoading(true);
        const [statsRes, reqRes] = await Promise.all([
          api.get('/reports/dashboard'),
          api.get('/collections?limit=5'),
        ]);

        if (statsRes?.data) setStats(statsRes.data);
        if (reqRes?.data) {
          setActiveRequests(
            reqRes.data.filter((r) => !['Completed', 'Cancelled'].includes(r.status))
          );
        }
      } catch (err) {
        console.error('Failed to load collector dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCollectorData();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading Collector Operations Center..." />;
  }

  return (
    <div className="space-y-6 animate-fade-up">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-2 h-6 rounded-full bg-gradient-to-b from-sky-500 to-blue-600" />
            <span className="text-xs font-bold uppercase tracking-widest text-sky-600">Collector Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Collector Operations Console
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Biomedical waste transit, custody handoffs & disposal verification
          </p>
        </div>
        <Link
          to="/collector/assigned"
          className="btn-primary flex items-center space-x-1.5 px-4 py-2 text-xs self-start sm:self-auto"
          style={{
            background: 'linear-gradient(135deg, #0369a1, #0284c7)',
            boxShadow: '0 4px 14px rgba(3,105,161,0.28)',
          }}
        >
          <Truck className="w-4 h-4" />
          <span>Active Assignments ({activeRequests.length})</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Pickups" value={activeRequests.length} icon={Truck} colorScheme="sky" />
        <StatCard title="Completed Disposals" value={stats?.completedCollections || 0} icon={CheckCircle2} colorScheme="emerald" />
        <StatCard title="Facility Smart Bins" value={stats?.totalBins || 0} icon={ShieldCheck} colorScheme="teal" />
        <StatCard title="Month Biowaste" value={stats?.monthWaste || 0} unit="KG" icon={Clock} colorScheme="amber" />
      </div>

      {/* Active Assignments Queue */}
      <GlassCard>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Immediate Collection Assignments</h3>
            <p className="text-xs text-slate-500 mt-0.5">Scheduled hospital biohazard pickups requiring action</p>
          </div>
          <Link
            to="/collector/assigned"
            className="text-xs text-sky-600 hover:text-sky-800 font-semibold flex items-center space-x-1 transition-colors"
          >
            <span>Process Assignments</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {activeRequests.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="All assignments cleared!"
            description="You have no pending collection pickups assigned right now."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeRequests.map((req) => {
              const totalKg = req.wasteRecords?.reduce((sum, w) => sum + (w.quantity || 0), 0) || 0;

              return (
                <div
                  key={req._id}
                  className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-sky-300 hover:shadow-sm transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="font-mono font-bold text-sky-700 text-xs bg-sky-100 border border-sky-200 px-2.5 py-0.5 rounded-lg">
                        {req.requestId}
                      </span>
                      <div className="flex items-center space-x-2">
                        <PriorityBadge priority={req.priority} />
                        <StatusBadge status={req.status} size="sm" />
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 mb-1.5">{req.hospital?.name}</h4>

                    <div className="flex items-start space-x-1.5 text-xs text-slate-500 mb-3">
                      <MapPin className="w-3.5 h-3.5 mt-0.5 text-slate-400 flex-shrink-0" />
                      <span>{req.hospital?.address}, {req.hospital?.city}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-slate-500">Total Waste Payload:</span>
                        <strong className="text-slate-900 font-mono">{Math.round(totalKg * 10) / 10} KG</strong>
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-slate-400">
                        <span>Batches:</span>
                        <span>{req.wasteRecords?.length || 0} segregated items</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    to="/collector/assigned"
                    className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-center text-white flex items-center justify-center space-x-1.5 transition-all"
                    style={{
                      background: 'linear-gradient(135deg, #0369a1, #0284c7)',
                      boxShadow: '0 3px 10px rgba(3,105,161,0.25)',
                    }}
                  >
                    <span>Update Status</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default CollectorDashboard;
