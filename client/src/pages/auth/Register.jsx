import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import api from '../../services/api';
import { Activity, User, Mail, Lock, Phone, Building2, ArrowRight, Leaf } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [hospitalId, setHospitalId] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const { addToast } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await api.get('/hospitals');
        if (res?.data) {
          setHospitals(res.data);
          if (res.data.length > 0) {
            setHospitalId(res.data[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load hospitals list:', err.message);
      }
    };
    fetchHospitals();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (!hospitalId) {
      setError('Please select your affiliated hospital.');
      return;
    }

    try {
      setLoading(true);
      const user = await register({
        name,
        email,
        password,
        phone,
        role: 'hospital_staff',
        hospitalId,
      });

      addToast(`Account created successfully! Welcome, ${user.name}`, 'success');
      navigate('/hospital/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-10 px-4 sm:px-6" style={{
      background: 'linear-gradient(135deg, #f0fdf9 0%, #ecfdf5 30%, #f0f9ff 70%, #f8fffe 100%)',
    }}>

      {/* Decorative blobs */}
      <div className="fixed top-0 left-0 w-96 h-96 rounded-full pointer-events-none opacity-30"
        style={{ background: 'radial-gradient(circle, rgba(5,150,105,0.12) 0%, transparent 70%)' }} />
      <div className="fixed bottom-0 right-0 w-80 h-80 rounded-full pointer-events-none opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(13,148,136,0.12) 0%, transparent 70%)' }} />

      <div className="relative z-10 w-full max-w-lg">

        {/* Brand header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 shadow-md group cursor-pointer transition-transform duration-200 hover:scale-105" style={{
            background: 'linear-gradient(135deg, #059669, #0d9488)',
            boxShadow: '0 6px 20px rgba(5,150,105,0.30)',
          }} title="Return to Home">
            <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
              <rect x="10" y="2" width="4" height="20" rx="2" fill="white" />
              <rect x="2" y="10" width="20" height="4" rx="2" fill="white" />
            </svg>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Hospital Staff Registration</h1>
          <p className="mt-1 text-sm text-slate-500">Join your healthcare facility on MediTrackX</p>
        </div>

        {/* Form card */}
        <div className="rounded-2xl p-6 sm:p-8" style={{
          background: '#ffffff',
          border: '1px solid rgba(16,185,129,0.12)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06), 0 16px 40px rgba(16,185,129,0.06)',
        }}>

          {error && (
            <div className="mb-5 p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-sm font-medium leading-relaxed">
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">

            {/* Full Name */}
            <div>
              <label className="form-label">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dr. Jane Smith"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="form-label">Work Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="staff@hospital.org"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="form-label">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 012-3456"
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Hospital Select */}
            <div>
              <label className="form-label">Select Hospital Facility</label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                <select
                  value={hospitalId}
                  onChange={(e) => setHospitalId(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-slate-800 focus:outline-none appearance-none"
                >
                  {hospitals.map((hosp) => (
                    <option key={hosp._id} value={hosp._id}>
                      {hosp.name} ({hosp.hospitalId}) - {hosp.city}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="form-label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-3 py-3 rounded-xl glass-input text-sm placeholder-slate-400 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="form-label">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-3 py-3 rounded-xl glass-input text-sm placeholder-slate-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 flex items-center justify-center space-x-2 mt-2"
            >
              <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="text-emerald-600 hover:text-emerald-800 font-semibold underline-offset-2 hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-4 text-center flex items-center justify-center space-x-1.5 text-xs text-slate-400">
          <Leaf className="w-3.5 h-3.5 text-emerald-400" />
          <span>MediTrackX · Smart Biomedical Waste Platform</span>
        </div>
      </div>
    </div>
  );
};

export default Register;
