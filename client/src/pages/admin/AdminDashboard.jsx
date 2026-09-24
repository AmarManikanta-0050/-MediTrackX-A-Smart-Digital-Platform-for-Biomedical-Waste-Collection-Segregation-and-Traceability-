import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import GlassCard from '../../components/common/GlassCard';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import {
  Building2,
  Trash2,
  Truck,
  Users,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, analyticsRes, requestsRes] = await Promise.all([
          api.get('/reports/dashboard'),
          api.get('/reports/analytics?days=30'),
          api.get('/collections?limit=5'),
        ]);

        if (statsRes?.data) setStats(statsRes.data);
        if (analyticsRes?.data) setAnalytics(analyticsRes.data);
        if (requestsRes?.data) setRecentRequests(requestsRes.data);
      } catch (err) {
        console.error('Failed to load dashboard:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading MediTrackX Analytics..." />;
  }

  // Pre-seed fallback colors for categories if not present
  const categoryColors = ['#EF4444', '#F59E0B', '#DC2626', '#8B5CF6', '#EC4899', '#10B981'];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            System Administration
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time biomedical waste monitoring, segregation metrics & collection status
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            to="/admin/collections"
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 shadow-glow-teal flex items-center space-x-1.5 transition-all"
          >
            <Truck className="w-4 h-4" />
            <span>Manage Requests</span>
          </Link>
          <Link
            to="/admin/reports"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
          >
            Analytics & Reports
          </Link>
        </div>
      </div>

      {/* Primary KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Hospitals"
          value={stats?.totalHospitals || 0}
          icon={Building2}
          colorScheme="teal"
        />
        <StatCard
          title="Pending Requests"
          value={stats?.pendingRequests || 0}
          icon={AlertCircle}
          colorScheme="amber"
        />
        <StatCard
          title="Month's Biowaste"
          value={stats?.monthWaste || 0}
          unit="KG"
          icon={Trash2}
          colorScheme="blue"
        />
        <StatCard
          title="Completed Disposals"
          value={stats?.completedCollections || 0}
          icon={ShieldCheck}
          colorScheme="emerald"
        />
      </div>

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Generation Trend Area Chart */}
        <div className="lg:col-span-2">
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Daily Biomedical Waste Volume
                </h3>
                <p className="text-xs text-slate-400">Total KG logged over last 30 days</p>
              </div>
              <div className="flex items-center space-x-1 text-xs text-teal-400 font-semibold">
                <TrendingUp className="w-4 h-4" />
                <span>MongoDB Atlas Aggregations</span>
              </div>
            </div>

            <div className="h-64 w-full">
              {analytics?.dailyTrend?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.dailyTrend}>
                    <defs>
                      <linearGradient id="wasteGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0D9488" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      stroke="#64748b"
                      fontSize={10}
                      tickLine={false}
                      tickFormatter={(val) => val.slice(5)}
                    />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F1E36',
                        borderColor: '#1E3A5F',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        color: '#fff',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="quantity"
                      name="Waste (KG)"
                      stroke="#14B8A6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#wasteGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState title="No trend data recorded yet" description="Generate waste records to see trends." />
              )}
            </div>
          </GlassCard>
        </div>

        {/* Waste By Category Pie Chart */}
        <div className="lg:col-span-1">
          <GlassCard>
            <div className="mb-4">
              <h3 className="text-sm font-bold text-white tracking-wide">Waste by Category</h3>
              <p className="text-xs text-slate-400">Distribution across color-coded types</p>
            </div>

            <div className="h-64 w-full flex items-center justify-center">
              {analytics?.wasteByCategory?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.wasteByCategory}
                      dataKey="totalQuantity"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {analytics.wasteByCategory.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color || categoryColors[index % categoryColors.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F1E36',
                        borderColor: '#1E3A5F',
                        borderRadius: '0.75rem',
                        fontSize: '11px',
                        color: '#fff',
                      }}
                      formatter={(val) => [`${val} KG`, 'Quantity']}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }}
                      formatter={(val) => <span className="text-slate-300">{val}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState title="No category data" description="Awaiting waste entries." />
              )}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Waste Volume by Hospital Facility (Bar Chart) */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Healthcare Facility Waste Generation
            </h3>
            <p className="text-xs text-slate-400">Comparative waste volume across registered hospitals</p>
          </div>
          <Link
            to="/admin/hospitals"
            className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center space-x-1"
          >
            <span>View All Hospitals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="h-56 w-full">
          {analytics?.wasteByHospital?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.wasteByHospital}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F1E36',
                    borderColor: '#1E3A5F',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                  formatter={(val) => [`${val} KG`, 'Total Waste']}
                />
                <Bar dataKey="totalQuantity" fill="#0D9488" radius={[6, 6, 0, 0]} name="Waste (KG)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No hospital metrics" description="Hospitals haven't logged waste yet." />
          )}
        </div>
      </GlassCard>

      {/* Recent Collection Requests Table */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Recent Collection Requests
            </h3>
            <p className="text-xs text-slate-400">Live requests waiting for collector pickup</p>
          </div>
          <Link
            to="/admin/collections"
            className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentRequests.length === 0 ? (
          <EmptyState title="No collection requests" description="No requests have been submitted yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-700/60 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="pb-3 px-3">Request ID</th>
                  <th className="pb-3 px-3">Hospital</th>
                  <th className="pb-3 px-3">Waste Items</th>
                  <th className="pb-3 px-3">Priority</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3">Collector</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {recentRequests.map((req) => (
                  <tr key={req._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-teal-400">
                      <Link to={`/collections/${req.requestId}`} className="hover:underline">
                        {req.requestId}
                      </Link>
                    </td>
                    <td className="py-3 px-3 text-slate-200 font-medium">
                      {req.hospital?.name || 'N/A'}
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {req.wasteRecords?.length || 0} batches
                    </td>
                    <td className="py-3 px-3">
                      <PriorityBadge priority={req.priority} />
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {req.collector?.name || (
                        <span className="text-amber-400/80 font-medium italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        to={`/collections/${req.requestId}`}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 transition-colors"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default AdminDashboard;
