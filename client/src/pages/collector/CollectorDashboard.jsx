import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import GlassCard from '../../components/common/GlassCard';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import EmptyState from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Truck, CheckCircle2, Clock, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';

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
          // Filter to active (not completed/cancelled)
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Collector Operations Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Biomedical waste transit, custody handoffs & disposal verification
          </p>
        </div>
        <Link
          to="/collector/assigned"
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 shadow-glow-teal flex items-center space-x-1.5 transition-all self-start sm:self-auto"
        >
          <Truck className="w-4 h-4" />
          <span>Active Assignments ({activeRequests.length})</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Pickups"
          value={activeRequests.length}
          icon={Truck}
          colorScheme="teal"
        />
        <StatCard
          title="Completed Disposals"
          value={stats?.completedCollections || 0}
          icon={CheckCircle2}
          colorScheme="emerald"
        />
        <StatCard
          title="Facility Smart Bins"
          value={stats?.totalBins || 0}
          icon={ShieldCheck}
          colorScheme="blue"
        />
        <StatCard
          title="Month Biowaste (KG)"
          value={stats?.monthWaste || 0}
          icon={Clock}
          colorScheme="amber"
        />
      </div>

      {/* Active Assignments Queue */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Immediate Collection Assignments
            </h3>
            <p className="text-xs text-slate-400">Scheduled hospital biohazard pickups requiring action</p>
          </div>
          <Link
            to="/collector/assigned"
            className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center space-x-1"
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
                  className="p-5 rounded-2xl bg-slate-900/60 border border-slate-700/60 flex flex-col justify-between hover:border-teal-500/30 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-mono font-bold text-teal-400 text-xs bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                        {req.requestId}
                      </span>
                      <div className="flex items-center space-x-2">
                        <PriorityBadge priority={req.priority} />
                        <StatusBadge status={req.status} size="sm" />
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-white mb-1.5">{req.hospital?.name}</h4>

                    <div className="flex items-start space-x-1.5 text-xs text-slate-400 mb-3">
                      <MapPin className="w-3.5 h-3.5 mt-0.5 text-slate-500 flex-shrink-0" />
                      <span>{req.hospital?.address}, {req.hospital?.city}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 text-xs text-slate-300 mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-slate-400">Total Waste Payload:</span>
                        <strong className="text-white font-mono">{Math.round(totalKg * 10) / 10} KG</strong>
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-slate-400">
                        <span>Batches:</span>
                        <span>{req.wasteRecords?.length || 0} segregated items</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    to="/collector/assigned"
                    className="w-full py-2 px-3 rounded-xl text-xs font-bold text-center text-white bg-teal-600 hover:bg-teal-500 shadow-glow-teal flex items-center justify-center space-x-1 transition-all"
                  >
                    <span>Update Status ({req.status})</span>
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
