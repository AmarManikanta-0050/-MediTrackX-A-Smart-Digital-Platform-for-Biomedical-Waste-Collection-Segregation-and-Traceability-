import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import GlassCard from '../../components/common/GlassCard';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useNotifications } from '../../context/NotificationContext';
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Phone,
  Mail,
  User,
  Edit2,
  Trash2,
  ShieldCheck,
} from 'lucide-react';

const HospitalsPage = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHospital, setEditingHospital] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { addToast } = useNotifications();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    hospitalId: '',
    address: '',
    city: '',
    state: '',
    phone: '',
    email: '',
    contactPerson: '',
    status: 'active',
  });

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/hospitals?search=${encodeURIComponent(search)}`);
      if (res?.data) {
        setHospitals(res.data);
      }
    } catch (err) {
      console.error('Failed to load hospitals:', err.message);
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, [search]);

  const handleOpenModal = (hospital = null) => {
    if (hospital) {
      setEditingHospital(hospital);
      setFormData({
        name: hospital.name,
        hospitalId: hospital.hospitalId,
        address: hospital.address,
        city: hospital.city,
        state: hospital.state,
        phone: hospital.phone,
        email: hospital.email,
        contactPerson: hospital.contactPerson,
        status: hospital.status || 'active',
      });
    } else {
      setEditingHospital(null);
      setFormData({
        name: '',
        hospitalId: '',
        address: '',
        city: '',
        state: '',
        phone: '',
        email: '',
        contactPerson: '',
        status: 'active',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingHospital) {
        await api.put(`/hospitals/${editingHospital._id}`, formData);
        addToast('Hospital information updated successfully.', 'success');
      } else {
        await api.post('/hospitals', formData);
        addToast('New hospital registered successfully.', 'success');
      }
      setIsModalOpen(false);
      fetchHospitals();
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
      await api.delete(`/hospitals/${deleteTarget._id}`);
      addToast('Hospital record removed.', 'success');
      setDeleteTarget(null);
      fetchHospitals();
    } catch (err) {
      addToast(err.message || 'Failed to delete hospital.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Healthcare Facilities</h1>
          <p className="text-xs text-slate-400 mt-1">
            Registered hospitals, clinics, and medical waste generator profiles
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 shadow-glow-teal flex items-center space-x-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register Hospital</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center space-x-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search hospital by name, ID, or city..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl glass-input placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Hospital Cards Grid */}
      {loading ? (
        <LoadingSpinner text="Fetching hospital directory..." />
      ) : hospitals.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No healthcare facilities found"
          description="Register a new hospital to begin tracking biomedical waste generation."
          action={
            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 transition-colors"
            >
              Add First Hospital
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {hospitals.map((hosp) => (
            <GlassCard key={hosp._id} className="relative flex flex-col justify-between hover:border-teal-500/30">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                      {hosp.hospitalId}
                    </span>
                    <h3 className="mt-1.5 text-base font-bold text-white leading-snug">{hosp.name}</h3>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      hosp.status === 'active'
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : 'bg-slate-700/40 text-slate-400 border-slate-600/30'
                    }`}
                  >
                    {hosp.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-300 mb-4">
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                    <span>
                      {hosp.address}, {hosp.city}, {hosp.state}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{hosp.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{hosp.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 pt-1 border-t border-slate-700/40">
                    <User className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                    <span className="text-slate-400">
                      Contact: <strong className="text-slate-200">{hosp.contactPerson}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  onClick={() => handleOpenModal(hosp)}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                  title="Edit details"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteTarget(hosp)}
                  className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                  title="Remove hospital"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Add / Edit Hospital Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingHospital ? 'Edit Hospital Details' : 'Register New Hospital Facility'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Hospital Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="St. Mercy Trauma Center"
                className="w-full px-3 py-2 text-xs rounded-xl glass-input focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Hospital ID Code (Auto-generated if empty)
              </label>
              <input
                type="text"
                value={formData.hospitalId}
                onChange={(e) => setFormData({ ...formData, hospitalId: e.target.value })}
                placeholder="HOSP-404"
                className="w-full px-3 py-2 text-xs rounded-xl glass-input focus:outline-none uppercase font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Physical Address *
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="120 Medical Boulevard"
              className="w-full px-3 py-2 text-xs rounded-xl glass-input focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                City *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Metropolis"
                className="w-full px-3 py-2 text-xs rounded-xl glass-input focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                State / Province *
              </label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="State Central"
                className="w-full px-3 py-2 text-xs rounded-xl glass-input focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Contact Phone Number *
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 text-xs rounded-xl glass-input focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Official Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="safety@hospital.org"
                className="w-full px-3 py-2 text-xs rounded-xl glass-input focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Primary Contact Person / Bio-Safety Officer *
              </label>
              <input
                type="text"
                required
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="Dr. Jordan Hayes"
                className="w-full px-3 py-2 text-xs rounded-xl glass-input focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Operational Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input bg-navy-850 text-slate-200 focus:outline-none"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
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
              {submitting ? 'Saving...' : editingHospital ? 'Update Hospital' : 'Register Facility'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Remove Healthcare Facility"
        message={`Are you sure you want to remove "${deleteTarget?.name}"? Associated historical records will remain archived.`}
        confirmText="Remove Hospital"
        isDanger={true}
        loading={submitting}
      />
    </div>
  );
};

export default HospitalsPage;
