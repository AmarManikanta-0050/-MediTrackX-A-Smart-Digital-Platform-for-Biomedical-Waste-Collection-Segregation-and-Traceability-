import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import GlassCard from '../../components/common/GlassCard';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useNotifications } from '../../context/NotificationContext';
import { FileText, Plus, Search, ExternalLink, Calendar, Filter } from 'lucide-react';

const HospitalWastePage = () => {
  const [wasteRecords, setWasteRecords] = useState([]);
  const [categories, setCategories] = useState([]);
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useNotifications();

  const [formData, setFormData] = useState({
    category: '',
    bin: '',
    department: '',
    quantity: '',
    unit: 'KG',
    description: '',
  });

  const fetchMetadata = async () => {
    try {
      const [catRes, binRes] = await Promise.all([api.get('/categories'), api.get('/bins')]);
      if (catRes?.data) {
        setCategories(catRes.data);
        if (catRes.data.length > 0) setFormData((prev) => ({ ...prev, category: catRes.data[0]._id }));
      }
      if (binRes?.data) setBins(binRes.data);
    } catch (err) {
      console.error('Failed to load waste metadata:', err);
    }
  };

  const fetchRecords = async () => {
    try {
      setLoading(true);
      let query = `/waste?page=${page}&limit=10&search=${encodeURIComponent(search)}`;
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
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [page, search, selectedCategory, selectedStatus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category || !formData.department || !formData.quantity) {
      addToast('Please fill out all required fields.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/waste', {
        ...formData,
        bin: formData.bin || null,
        quantity: Number(formData.quantity),
      });

      addToast(`Waste batch ${res.data.wasteId} recorded and logged.`, 'success');
      setIsModalOpen(false);
      setFormData({
        category: categories[0]?._id || '',
        bin: '',
        department: '',
        quantity: '',
        unit: 'KG',
        description: '',
      });
      fetchRecords();
    } catch (err) {
      addToast(err.message || 'Failed to record waste.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Biomedical Waste Logging</h1>
          <p className="text-xs text-slate-400 mt-1">
            Record segregated medical waste bags, specify weight & update bin fill levels
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 shadow-glow-teal flex items-center space-x-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Log Waste Batch</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search Waste ID (MW-...) or department..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl glass-input placeholder-slate-500 focus:outline-none"
          />
        </div>

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
          <option value="Logged">Logged (Awaiting Request)</option>
          <option value="Pending Collection">Pending Collection</option>
          <option value="In Transit">In Transit</option>
          <option value="Disposed">Disposed / Completed</option>
        </select>
      </div>

      {/* Table */}
      <GlassCard className="p-0 overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Fetching hospital waste records..." />
        ) : wasteRecords.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No waste records logged"
            description="Log new waste batches from your hospital wards to start tracking."
            action={
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 transition-colors"
              >
                Log First Waste Batch
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-700/60 text-slate-400 uppercase font-semibold bg-slate-900/40">
                <tr>
                  <th className="py-3 px-4">Waste ID</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Department / Ward</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Associated Bin</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Logged At</th>
                  <th className="py-3 px-4 text-right">Traceability</th>
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
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: w.category?.colorCode || '#0D9488' }}
                        />
                        <span className="text-slate-200 font-semibold">{w.category?.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-medium">{w.department}</td>
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {w.quantity} {w.unit}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {w.bin ? (
                        <span className="font-mono text-xs text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          {w.bin.binId}
                        </span>
                      ) : (
                        <span className="italic text-slate-500">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={w.status} />
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(w.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/waste/${w.wasteId}`}
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

        <Pagination
          currentPage={page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          onPageChange={(p) => setPage(p)}
        />
      </GlassCard>

      {/* Log Waste Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Biomedical Waste Batch"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Waste Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input bg-navy-850 text-slate-200 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id} className="bg-navy-900 text-white">
                    {c.name} ({c.code}) - {c.hazardLevel}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Ward / Department *
              </label>
              <input
                type="text"
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="ICU Ward 3B, Pathology Lab, Surgery"
                className="w-full px-3 py-2 text-xs rounded-xl glass-input focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Measured Quantity *
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="12.5"
                className="w-full px-3 py-2 text-xs rounded-xl glass-input focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Unit of Measure
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input bg-navy-850 text-slate-200 focus:outline-none"
              >
                <option value="KG">KG (Kilograms)</option>
                <option value="Liters">Liters</option>
                <option value="Bags">Bags / Containers</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Deposit into Smart Bin (Optional)
            </label>
            <select
              value={formData.bin}
              onChange={(e) => setFormData({ ...formData, bin: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl glass-input bg-navy-850 text-slate-200 focus:outline-none"
            >
              <option value="">No Bin (Direct Bagging / Standalone Storage)</option>
              {bins.map((b) => (
                <option key={b._id} value={b._id} className="bg-navy-900 text-white">
                  {b.binId} - {b.department} ({b.currentLevel}/{b.capacity} KG)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Batch Description & Notes
            </label>
            <textarea
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Suture needles, IV tubes, surgical gauze sealed in double yellow bag"
              className="w-full px-3 py-2 text-xs rounded-xl glass-input focus:outline-none"
            />
          </div>

          <div className="mt-6 flex items-center justify-end space-x-3 pt-4 border-t border-slate-700/60">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 shadow-glow-teal transition-all disabled:opacity-50"
            >
              {submitting ? 'Generating ID & Logging...' : 'Record Waste'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HospitalWastePage;
