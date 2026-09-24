import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import api from '../../services/api';
import GlassCard from '../../components/common/GlassCard';
import { User, Mail, Phone, Lock, Building2, Shield, Save } from 'lucide-react';

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

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white">Account Settings</h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your personal details and authentication security credentials
        </p>
      </div>

      <GlassCard>
        <div className="flex items-center space-x-4 pb-6 mb-6 border-b border-slate-700/60">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-600 to-sky-400 flex items-center justify-center text-white font-black text-xl uppercase shadow-glow-teal">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{user?.name}</h2>
            <div className="flex items-center space-x-2 mt-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
                {user?.role?.replace('_', ' ')}
              </span>
              {user?.hospital?.name && (
                <span className="text-xs text-slate-400 flex items-center space-x-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>{user.hospital.name}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl glass-input focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Work Email Address (Read-only)
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl glass-input opacity-60 cursor-not-allowed bg-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Contact Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl glass-input focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-700/60">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              New Password (Optional)
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl glass-input focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 shadow-glow-teal flex items-center space-x-2 transition-all disabled:opacity-50"
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
