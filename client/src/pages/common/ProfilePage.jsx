import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import api from '../../services/api';
import GlassCard from '../../components/common/GlassCard';
import { User, Mail, Phone, Lock, Building2, Shield, Save, Leaf } from 'lucide-react';

const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const { addToast } = useNotifications();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = { name, phone };
      if (password) payload.password = password;

      await api.put('/auth/profile', payload);
      await refreshUser();
      setPassword('');
      addToast('Profile updated successfully.', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getAvatarBg = (role) => {
    switch (role) {
      case 'admin': return 'from-rose-500 to-rose-600';
      case 'hospital_staff': return 'from-emerald-500 to-teal-600';
      case 'collector': return 'from-sky-500 to-blue-600';
      default: return 'from-slate-400 to-slate-500';
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'hospital_staff': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'collector': return 'bg-sky-100 text-sky-700 border-sky-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-up">
      <div>
        <div className="flex items-center space-x-2 mb-1">
          <div className="w-2 h-6 rounded-full bg-gradient-to-b from-emerald-500 to-teal-500" />
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">Account Settings</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">My Profile</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your personal details and authentication security credentials
        </p>
      </div>

      <GlassCard>
        {/* User avatar + info header */}
        <div className="flex items-center space-x-4 pb-6 mb-6 border-b border-slate-100">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getAvatarBg(user?.role)} flex items-center justify-center text-white font-black text-2xl uppercase shadow-sm`}>
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
            <div className="flex items-center space-x-2 mt-1 flex-wrap gap-1">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${getRoleBadge(user?.role)}`}>
                {user?.role?.replace('_', ' ')}
              </span>
              {user?.hospital?.name && (
                <span className="text-xs text-slate-500 flex items-center space-x-1">
                  <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{user.hospital.name}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="form-label">Work Email Address (Read-only)</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm opacity-60 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="form-label">Contact Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <label className="form-label">New Password (Optional)</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
                className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm focus:outline-none"
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-400">Minimum 6 characters required if changing password.</p>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex items-center space-x-2 px-5 py-2.5"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Saving Changes...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};

export default ProfilePage;
