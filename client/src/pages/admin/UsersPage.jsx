import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import GlassCard from '../../components/common/GlassCard';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useNotifications } from '../../context/NotificationContext';
import { Users, Plus, Search, Shield, UserCheck, Truck, Edit2, Trash2 } from 'lucide-react';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { addToast } = useNotifications();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'hospital_staff',
    hospital: '',
    status: 'active',
  });

  const fetchHospitals = async () => {
    try {
      const res = await api.get('/hospitals');
      if (res?.data) setHospitals(res.data);
    } catch (err) {
      console.error('Failed to load hospitals:', err.message);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      let query = `/users?page=${page}&limit=12&search=${encodeURIComponent(search)}`;
      if (roleFilter) query += `&role=${roleFilter}`;

      const res = await api.get(query);
      if (res?.data) {
        setUsers(res.data);
        if (res.meta) setPagination(res.meta);
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
    fetchUsers();
  }, [page, search, roleFilter]);

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        phone: user.phone || '',
        role: user.role,
        hospital: user.hospital?._id || user.hospital || '',
        status: user.status || 'active',
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'hospital_staff',
        hospital: hospitals[0]?._id || '',
        status: 'active',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingUser) {
        await api.put(`/users/${editingUser._id}`, formData);
        addToast('User account updated.', 'success');
      } else {
        await api.post('/users', formData);
        addToast('New user provisioned successfully.', 'success');
      }
      setIsModalOpen(false);
      fetchUsers();
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
      await api.delete(`/users/${deleteTarget._id}`);
      addToast('User deleted.', 'success');
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      addToast(err.message || 'Failed to delete user.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-3.5 h-3.5 text-rose-400" />;
      case 'collector':
        return <Truck className="w-3.5 h-3.5 text-sky-400" />;
      default:
        return <UserCheck className="w-3.5 h-3.5 text-teal-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">User Accounts</h1>
          <p className="text-xs text-slate-400 mt-1">
            System access control, staff authentication profiles & collectors
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 shadow-glow-teal flex items-center space-x-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Provision User</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, email, or phone..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl glass-input placeholder-slate-500 focus:outline-none"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-xs rounded-xl glass-input bg-navy-850 text-slate-200 focus:outline-none"
        >
          <option value="">All Roles</option>
          <option value="admin">System Admin</option>
          <option value="hospital_staff">Hospital Staff</option>
          <option value="collector">Waste Collector</option>
        </select>
      </div>

      {/* Users Table / Grid */}
      <GlassCard className="p-0 overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Fetching user directory..." />
        ) : users.length === 0 ? (
          <EmptyState icon={Users} title="No users found" description="No accounts match current criteria." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-700/60 text-slate-400 uppercase font-semibold bg-slate-900/40">
                <tr>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Affiliated Facility</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-teal-400 font-bold uppercase text-[11px]">
                          {u.name?.charAt(0) || 'U'}
                        </div>
                        <span>{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-mono text-[11px]">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 border border-slate-700">
                        {getRoleIcon(u.role)}
                        <span className="capitalize">{u.role.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {u.hospital?.name || <span className="text-slate-500 italic">None (Global)</span>}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          u.status === 'active'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleOpenModal(u)}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(u)}
                          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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

      {/* Add / Edit User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Edit User Profile' : 'Provision User Account'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Dr. Evelyn Vance"
                className="w-full px-3 py-2 text-xs rounded-xl glass-input focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Work Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@hospital.org"
                className="w-full px-3 py-2 text-xs rounded-xl glass-input focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Password {editingUser ? '(leave blank to keep unchanged)' : '*'}
              </label>
              <input
                type="password"
                required={!editingUser}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-xs rounded-xl glass-input focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 text-xs rounded-xl glass-input focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                User Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input bg-navy-850 text-slate-200 focus:outline-none"
              >
                <option value="hospital_staff">Hospital Staff</option>
                <option value="collector">Waste Collector</option>
                <option value="admin">System Administrator</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Account Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input bg-navy-850 text-slate-200 focus:outline-none"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive / Suspended</option>
              </select>
            </div>
          </div>

          {formData.role === 'hospital_staff' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Affiliated Hospital Facility *
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
                    {h.name} ({h.hospitalId})
                  </option>
                ))}
              </select>
            </div>
          )}

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
              {submitting ? 'Saving...' : editingUser ? 'Update Account' : 'Provision User'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete User Account"
        message={`Are you sure you want to delete ${deleteTarget?.name}?`}
        confirmText="Delete Account"
        isDanger={true}
        loading={submitting}
      />
    </div>
  );
};

export default UsersPage;
