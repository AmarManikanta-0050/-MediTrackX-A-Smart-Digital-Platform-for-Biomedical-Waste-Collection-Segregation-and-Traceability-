import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import GlassCard from '../../components/common/GlassCard';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useNotifications } from '../../context/NotificationContext';
import { FileText, Search, Download, Calendar, Filter, ExternalLink } from 'lucide-react';

const AllWasteRecordsPage = () => {
  const [wasteRecords, setWasteRecords] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedHospital, setSelectedHospital] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });

  const { addToast } = useNotifications();

  const fetchFiltersData = async () => {
    try {
      const [hospRes, catRes] = await Promise.all([api.get('/hospitals'), api.get('/categories')]);
      if (hospRes?.data) setHospitals(hospRes.data);
      if (catRes?.data) setCategories(catRes.data);
    } catch (err) {
      console.error('Failed to load filter metadata:', err.message);
    }
  };

  const fetchWasteRecords = async () => {
    try {
      setLoading(true);
      let query = `/waste?page=${page}&limit=12&search=${encodeURIComponent(search)}`;
      if (selectedHospital) query += `&hospital=${selectedHospital}`;
      if (selectedCategory) query += `&category=${selectedCategory}`;
      if (selectedStatus) query += `&status=${selectedStatus}`;

      const res = await api.get(query);
      if (res?.data) {
        setWasteRecords(res.data);
        if (res.meta) setPagination(res.meta);
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiltersData();
  }, []);

  useEffect(() => {
    fetchWasteRecords();
  }, [page, search, selectedHospital, selectedCategory, selectedStatus]);

  const handleExportCSV = async () => {
    try {
      addToast('Preparing CSV export...', 'info');
      const token = localStorage.getItem('meditrackx_token');
      const response = await fetch('/api/reports/export/csv', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to generate export file');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meditrackx-biowaste-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      addToast('CSV export downloaded successfully.', 'success');
    } catch (err) {
      addToast(err.message || 'Export failed.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Biomedical Waste Ledger</h1>
          <p className="text-xs text-slate-400 mt-1">
            Global segregation records, batch weights & chain of custody records
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center space-x-2 transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-teal-400" />
          <span>Export Audit CSV</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search Waste ID (MW-...) or dept..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl glass-input placeholder-slate-500 focus:outline-none"
          />
        </div>

        <select
          value={selectedHospital}
          onChange={(e) => {
            setSelectedHospital(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-xs rounded-xl glass-input bg-navy-850 text-slate-200 focus:outline-none"
        >
          <option value="">All Hospital Facilities</option>
          {hospitals.map((h) => (
            <option key={h._id} value={h._id} className="bg-navy-900 text-white">
              {h.name}
            </option>
          ))}
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-xs rounded-xl glass-input bg-navy-850 text-slate-200 focus:outline-none"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id} className="bg-navy-900 text-white">
              {c.name} ({c.code})
            </option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-xs rounded-xl glass-input bg-navy-850 text-slate-200 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="Logged">Logged</option>
          <option value="Pending Collection">Pending Collection</option>
          <option value="In Transit">In Transit</option>
          <option value="Disposed">Disposed / Completed</option>
        </select>
      </div>

      {/* Waste Records Table */}
      <GlassCard className="p-0 overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Searching waste records..." />
        ) : wasteRecords.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No biomedical waste records found"
            description="Adjust your search filters or wait for hospital staff to log waste."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-700/60 text-slate-400 uppercase font-semibold bg-slate-900/40">
                <tr>
                  <th className="py-3 px-4">Waste ID</th>
                  <th className="py-3 px-4">Hospital Facility</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Department / Bin</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {wasteRecords.map((w) => (
                  <tr key={w._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-teal-400">
                      <Link to={`/waste/${w.wasteId}`} className="hover:underline flex items-center space-x-1">
                        <span>{w.wasteId}</span>
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-white font-medium">
                      {w.hospital?.name || 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: w.category?.colorCode || '#0D9488' }}
                        />
                        <span className="text-slate-200 font-semibold">{w.category?.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <div>{w.department}</div>
                      {w.bin && <div className="text-[10px] text-slate-500 font-mono">Bin: {w.bin.binId}</div>}
                    </td>
                    <td className="py-3 px-4 font-bold text-white font-mono">
                      {w.quantity} {w.unit || 'KG'}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={w.status} />
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(w.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/waste/${w.wasteId}`}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 transition-colors"
                      >
                        Timeline
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          onPageChange={(p) => setPage(p)}
        />
      </GlassCard>
    </div>
  );
};

export default AllWasteRecordsPage;
