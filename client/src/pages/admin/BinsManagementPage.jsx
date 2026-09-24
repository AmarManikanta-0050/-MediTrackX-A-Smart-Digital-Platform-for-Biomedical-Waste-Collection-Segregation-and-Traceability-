import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import GlassCard from '../../components/common/GlassCard';
import ProgressBar from '../../components/common/ProgressBar';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useNotifications } from '../../context/NotificationContext';
import { Trash2, Plus, Search, Edit2, AlertTriangle, Building2, MapPin } from 'lucide-react';

const BinsManagementPage = () => {
  const [bins, setBins] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedHospital, setSelectedHospital] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBin, setEditingBin] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { addToast } = useNotifications();

  const [formData, setFormData] = useState({
    binId: '',
    hospital: '',
    department: '',
    category: '',
    capacity: 50,
    currentLevel: 0,
    status: 'Active',
    locationDescription: '',
  });

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [hospRes, catRes] = await Promise.all([api.get('/hospitals'), api.get('/categories')]);
      if (hospRes?.data) setHospitals(hospRes.data);
      if (catRes?.data) setCategories(catRes.data);
    } catch (err) {
      console.error('Failed to load initial metadata:', err.message);
    }
  };

  const fetchBins = async () => {
    try {
      setLoading(true);
      let query = `/bins?search=${encodeURIComponent(search)}`;
      if (selectedHospital) query += `&hospital=${selectedHospital}`;
      if (selectedStatus) query += `&status=${selectedStatus}`;

      const res = await api.get(query);
      if (res?.data) {
        setBins(res.data);
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchBins();
  }, [search, selectedHospital, selectedStatus]);

  const handleOpenModal = (bin = null) => {
    if (bin) {
      setEditingBin(bin);
      setFormData({
        binId: bin.binId,
        hospital: bin.hospital?._id || bin.hospital,
        department: bin.department,
        category: bin.category?._id || bin.category,
        capacity: bin.capacity,
        currentLevel: bin.currentLevel,
        status: bin.status,
        locationDescription: bin.locationDescription || '',
      });
    } else {
      setEditingBin(null);
      setFormData({
        binId: '',
        hospital: hospitals[0]?._id || '',
        department: '',
        category: categories[0]?._id || '',
        capacity: 50,
        currentLevel: 0,
        status: 'Active',
        locationDescription: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingBin) {
        await api.put(`/bins/${editingBin._id}`, formData);
        addToast('Smart bin metrics updated.', 'success');
      } else {
        await api.post('/bins', formData);
        addToast('New smart bin registered.', 'success');
      }
      setIsModalOpen(false);
      fetchBins();
    } catch (err) {
      addToast(err.message || 'Operation failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setSubmitting(true);
      await api.delete(`/bins/${deleteTarget._id}`);
      addToast('Bin record removed.', 'success');
      setDeleteTarget(null);
      fetchBins();
    } catch (err) {
      addToast(err.message || 'Failed to remove bin.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Smart Bins Directory</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time fill level telemetry, sensor thresholds & capacity tracking
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 shadow-glow-teal flex items-center space-x-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Smart Bin</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Bin ID or department..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl glass-input placeholder-slate-500 focus:outline-none"
          />
        </div>

        <select
          value={selectedHospital}
          onChange={(e) => setSelectedHospital(e.target.value)}
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
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl glass-input bg-navy-850 text-slate-200 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Full">Full (Alert)</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Bins Grid */}
      {loading ? (
        <LoadingSpinner text="Checking bin sensor fill levels..." />
      ) : bins.length === 0 ? (
        <EmptyState
          icon={Trash2}
          title="No smart bins found"
          description="Register smart bins across departments to enable real-time tracking."
          action={
            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 transition-colors"
            >
              Add First Smart Bin
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {bins.map((bin) => {
            const utilization = Math.min(Math.round(((bin.currentLevel || 0) / (bin.capacity || 1)) * 100), 100);
            const isCritical = utilization >= 90;

            return (
              <GlassCard
                key={bin._id}
                className={`relative flex flex-col justify-between ${
                  isCritical ? 'border-rose-500/40 ring-1 ring-rose-500/30' : ''
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="font-mono text-xs font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                        {bin.binId}
                      </span>
                      <h3 className="mt-1 text-sm font-bold text-white">{bin.department}</h3>
                    </div>
                    <StatusBadge status={bin.status} />
                  </div>

                  <div className="space-y-2 text-xs text-slate-300 mb-4">
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{bin.hospital?.name || 'Assigned Hospital'}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: bin.category?.colorCode || '#0D9488' }}
                      />
                      <span className="font-medium text-slate-200">
                        {bin.category?.name || 'Category Unset'}
                      </span>
                    </div>

                    {bin.locationDescription && (
                      <div className="flex items-start space-x-2 text-[11px] text-slate-400">
                        <MapPin className="w-3.5 h-3.5 mt-0.5 text-slate-500 flex-shrink-0" />
                        <span>{bin.locationDescription}</span>
                      </div>
                    )}
                  </div>

                  {/* Fill Level Metric & Visual Progress */}
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/40 mb-3">
                    <ProgressBar
                      value={bin.currentLevel}
                      max={bin.capacity}
                      label="Current Level:"
                      subLabel={`${bin.currentLevel} / ${bin.capacity} KG`}
                      showPercent={true}
                      size="md"
                    />
                    {isCritical && (
                      <p className="mt-2 text-[10px] text-rose-400 font-semibold flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>High fill alert! Collection pickup required.</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => handleOpenModal(bin)}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(bin)}
                    className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Add / Edit Bin Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBin ? 'Edit Smart Bin Telemetry' : 'Deploy New Smart Bin'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Bin ID (Auto-generated if empty)
              </label>
              <input
                type="text"
                value={formData.binId}
                onChange={(e) => setFormData({ ...formData, binId: e.target.value.toUpperCase() })}
                placeholder="BIN-201"
                className="w-full px-3 py-2 text-xs rounded-xl glass-input focus:outline-none uppercase font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Hospital Facility *
              </label>
              <select
                required
                value={formData.hospital}
                onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input bg-navy-850 text-slate-200 focus:outline-none"
              >
                <option value="">Select Hospital</option>
                {hospitals.map((h) => (
                  <option key={h._id} value={h._id} className="bg-navy-900 text-white">
                    {h.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Department *
              </label>
              <input
                type="text"
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="ICU Ward 3B, Surgery, OPD"
                className="w-full px-3 py-2 text-xs rounded-xl glass-input focus:outline-none"
              />
            </div>

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
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id} className="bg-navy-900 text-white">
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Capacity (KG) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Current Level (KG)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.currentLevel}
                onChange={(e) => setFormData({ ...formData, currentLevel: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input bg-navy-850 text-slate-200 focus:outline-none"
              >
                <option value="Active">Active</option>
                <option value="Full">Full</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Physical Location Details
            </label>
            <input
              type="text"
              value={formData.locationDescription}
              onChange={(e) => setFormData({ ...formData, locationDescription: e.target.value })}
              placeholder="Next to scrub sink 4, Emergency triage entrance"
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
              {submitting ? 'Saving...' : editingBin ? 'Update Bin' : 'Deploy Bin'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Remove Smart Bin"
        message={`Are you sure you want to remove Bin ${deleteTarget?.binId}?`}
        confirmText="Remove Bin"
        isDanger={true}
        loading={submitting}
      />
    </div>
  );
};

export default BinsManagementPage;
