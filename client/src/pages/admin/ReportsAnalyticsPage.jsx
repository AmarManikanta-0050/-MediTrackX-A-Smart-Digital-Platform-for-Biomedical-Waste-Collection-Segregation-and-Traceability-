import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import GlassCard from '../../components/common/GlassCard';
import StatCard from '../../components/common/StatCard';
import EmptyState from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useNotifications } from '../../context/NotificationContext';
import {
  BarChart3,
  Download,
  Calendar,
  Building2,
  Trash2,
  TrendingUp,
  PieChart as PieIcon,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

const ReportsAnalyticsPage = () => {
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState('all');
  const [selectedDays, setSelectedDays] = useState('30');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const { addToast } = useNotifications();

  const fetchHospitals = async () => {
    try {
      const res = await api.get('/hospitals');
      if (res?.data) setHospitals(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/reports/analytics?hospitalId=${selectedHospital}&days=${selectedDays}`
      );
      if (res?.data) {
        setAnalytics(res.data);
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [selectedHospital, selectedDays]);

  const handleExportCSV = async () => {
    try {
      addToast('Preparing CSV report...', 'info');
      const blob = await api.get('/reports/export/csv', { responseType: 'blob' });
      const blobData = blob instanceof Blob ? blob : new Blob([blob], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blobData);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meditrackx-biomedical-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      addToast('Report exported successfully.', 'success');
    } catch (err) {
      addToast(err.message || 'Export error', 'error');
    }
  };

  const categoryColors = ['#EF4444', '#F59E0B', '#DC2626', '#8B5CF6', '#EC4899', '#10B981'];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Compliance & Waste Analytics</h1>
          <p className="text-xs text-slate-500 mt-1">
            Aggregated biomedical waste audit reports, facility rankings & collection completion rates
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center space-x-2 transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-teal-600" />
          <span>Export Full Audit CSV</span>
        </button>
      </div>

      {/* Filter Options */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={selectedHospital}
          onChange={(e) => setSelectedHospital(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl glass-input bg-navy-850 text-slate-700 focus:outline-none"
        >
          <option value="all">All Hospitals (Consolidated)</option>
          {hospitals.map((h) => (
            <option key={h._id} value={h._id} className="bg-surface-tertiary text-slate-900">
              {h.name}
            </option>
          ))}
        </select>

        <select
          value={selectedDays}
          onChange={(e) => setSelectedDays(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl glass-input bg-navy-850 text-slate-700 focus:outline-none"
        >
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
          <option value="365">Past Year</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner text="Aggregating MongoDB data..." />
      ) : (
        <div className="space-y-6">
          {/* Main Trend Line Chart */}
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-wide">
                  Generation Trend Curve (Daily KG)
                </h3>
                <p className="text-xs text-slate-500">
                  Daily aggregated biomedical waste volume over selected period
                </p>
              </div>
              <div className="flex items-center space-x-1.5 text-xs text-teal-600 font-semibold">
                <TrendingUp className="w-4 h-4" />
                <span>Aggregated Real Data</span>
              </div>
            </div>

            <div className="h-72 w-full">
              {analytics?.dailyTrend?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.dailyTrend}>
                    <defs>
                      <linearGradient id="analyticsTrend" x1="0" y1="0" x2="0" y2="1">
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
                        backgroundColor: '#ffffff',
                        borderColor: '#e2f5f0',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        color: '#fff',
                      }}
                      formatter={(val) => [`${val} KG`, 'Waste Volume']}
                    />
                    <Area
                      type="monotone"
                      dataKey="quantity"
                      stroke="#14B8A6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#analyticsTrend)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState title="No trend data" description="No logged waste records in this period." />
              )}
            </div>
          </GlassCard>

          {/* Department Breakdown & Category Segregation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* By Department */}
            <GlassCard>
              <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-900 tracking-wide">
                  Departmental Waste Distribution
                </h3>
                <p className="text-xs text-slate-500">Total volume accumulated by hospital ward</p>
              </div>

              <div className="h-64 w-full">
                {analytics?.departmentBreakdown?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.departmentBreakdown} layout="vertical">
                      <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} />
                      <YAxis
                        type="category"
                        dataKey="department"
                        stroke="#64748b"
                        fontSize={10}
                        tickLine={false}
                        width={110}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderColor: '#e2f5f0',
                          borderRadius: '0.75rem',
                          fontSize: '12px',
                          color: '#fff',
                        }}
                        formatter={(val) => [`${val} KG`, 'Volume']}
                      />
                      <Bar dataKey="totalQuantity" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState title="No department data" description="Awaiting waste records." />
                )}
              </div>
            </GlassCard>

            {/* Waste By Category Segregation */}
            <GlassCard>
              <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-900 tracking-wide">
                  Category Segregation Ratio
                </h3>
                <p className="text-xs text-slate-500">Color-coded biomedical segregation compliance</p>
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
                        innerRadius={50}
                        outerRadius={80}
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
                          backgroundColor: '#ffffff',
                          borderColor: '#e2f5f0',
                          borderRadius: '0.75rem',
                          fontSize: '11px',
                          color: '#fff',
                        }}
                        formatter={(val) => [`${val} KG`, 'Quantity']}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: '10px' }}
                        formatter={(val) => <span className="text-slate-600">{val}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState title="No category data" description="Awaiting waste records." />
                )}
              </div>
            </GlassCard>
          </div>

          {/* Collection Workflow Status Breakdown */}
          <GlassCard>
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-900 tracking-wide">
                Collection Workflow Pipeline Breakdown
              </h3>
              <p className="text-xs text-slate-500">Total collection orders by operational state</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {analytics?.requestStatusBreakdown?.map((item) => (
                <div
                  key={item.status}
                  className="p-4 rounded-xl bg-white/60 border border-slate-200/50 flex flex-col justify-between"
                >
                  <span className="text-xs text-slate-500 font-semibold">{item.status}</span>
                  <div className="mt-2 flex items-baseline space-x-2">
                    <span className="text-2xl font-bold text-slate-900">{item.count}</span>
                    <span className="text-xs text-slate-500">requests</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default ReportsAnalyticsPage;
