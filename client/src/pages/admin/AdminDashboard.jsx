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
  BarChart3,
  Activity,
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

  const categoryColors = ['#EF4444', '#F59E0B', '#DC2626', '#8B5CF6', '#EC4899', '#10B981'];

  /* Tooltip style for light charts */
  const tooltipStyle = {
    backgroundColor: '#ffffff',
    border: '1px solid #e2f5f0',
    borderRadius: '12px',
    fontSize: '12px',
    color: '#0f172a',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  };

  return (
    <div className="space-y-6 animate-fade-up">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-2 h-6 rounded-full bg-gradient-to-b from-emerald-500 to-teal-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">System Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Command Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time biomedical waste monitoring, segregation metrics & collection status
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            to="/admin/collections"
            className="btn-primary flex items-center space-x-1.5 px-4 py-2 text-xs"
          >
            <Truck className="w-4 h-4" />
            <span>Manage Requests</span>
          </Link>
          <Link
            to="/admin/reports"
            className="btn-secondary flex items-center space-x-1.5 px-4 py-2 text-xs"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analytics</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Area Chart: Daily Waste Trend */}
        <div className="lg:col-span-2">
          <GlassCard>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Daily Biomedical Waste Volume</h3>
                <p className="text-xs text-slate-500 mt-0.5">Total KG logged over last 30 days</p>
              </div>
              <div className="flex items-center space-x-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Live Analytics</span>
              </div>
            </div>
            <div className="h-64 w-full">
              {analytics?.dailyTrend?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.dailyTrend}>
                    <defs>
                      <linearGradient id="wasteGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      stroke="#94a3b8"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => val.slice(5)}
                    />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area
                      type="monotone"
                      dataKey="quantity"
                      name="Waste (KG)"
                      stroke="#059669"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#wasteGradient)"
                      dot={false}
                      activeDot={{ r: 4, fill: '#059669', strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState title="No trend data yet" description="Generate waste records to see trends." />
              )}
            </div>
          </GlassCard>
        </div>

        {/* Pie Chart: Waste by Category */}
        <div className="lg:col-span-1">
          <GlassCard>
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-800">Waste by Category</h3>
              <p className="text-xs text-slate-500 mt-0.5">Distribution across color-coded types</p>
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
                      innerRadius={48}
                      outerRadius={78}
                      paddingAngle={3}
                    >
                      {analytics.wasteByCategory.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color || categoryColors[index % categoryColors.length]}
                          stroke="rgba(255,255,255,0.8)"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(val) => [`${val} KG`, 'Quantity']}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }}
                      formatter={(val) => <span className="text-slate-700">{val}</span>}
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

      {/* Bar Chart: Waste by Hospital */}
      <GlassCard>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Healthcare Facility Waste Generation</h3>
            <p className="text-xs text-slate-500 mt-0.5">Comparative waste volume across registered hospitals</p>
          </div>
          <Link
            to="/admin/hospitals"
            className="text-xs text-emerald-600 hover:text-emerald-800 font-semibold flex items-center space-x-1 transition-colors"
          >
            <span>View All Hospitals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="h-56 w-full">
          {analytics?.wasteByHospital?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.wasteByHospital} barCategoryGap="35%">
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(val) => [`${val} KG`, 'Total Waste']}
                  cursor={{ fill: 'rgba(5,150,105,0.04)' }}
                />
                <Bar dataKey="totalQuantity" fill="#059669" radius={[8, 8, 0, 0]} name="Waste (KG)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No hospital metrics" description="Hospitals haven't logged waste yet." />
          )}
        </div>
      </GlassCard>

      {/* Recent Collection Requests Table */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="flex items-center justify-between p-5 md:p-6 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Recent Collection Requests</h3>
            <p className="text-xs text-slate-500 mt-0.5">Live requests waiting for collector pickup</p>
          </div>
          <Link
            to="/admin/collections"
            className="text-xs text-emerald-600 hover:text-emerald-800 font-semibold flex items-center space-x-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentRequests.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No collection requests" description="No requests have been submitted yet." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Hospital</th>
                  <th>Waste Items</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Collector</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentRequests.map((req) => (
                  <tr key={req._id}>
                    <td>
                      <Link
                        to={`/collections/${req.requestId}`}
                        className="font-mono font-bold text-emerald-600 hover:text-emerald-800 hover:underline underline-offset-2 text-xs"
                      >
                        {req.requestId}
                      </Link>
                    </td>
                    <td className="font-medium text-slate-800">{req.hospital?.name || 'N/A'}</td>
                    <td className="text-slate-600">{req.wasteRecords?.length || 0} batches</td>
                    <td><PriorityBadge priority={req.priority} /></td>
                    <td><StatusBadge status={req.status} /></td>
                    <td className="text-slate-600">
                      {req.collector?.name || (
                        <span className="text-amber-600 font-medium italic text-xs">Unassigned</span>
                      )}
                    </td>
                    <td className="text-right">
                      <Link
                        to={`/collections/${req.requestId}`}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                      >
                        <span>Inspect</span>
                        <ArrowRight className="w-3 h-3" />
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
