import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Activity, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, Truck } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { addToast } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('expired') === 'true') {
      setError('Your session has expired. Please sign in again.');
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      const user = await login(email, password);
      addToast(`Welcome back, ${user.name}!`, 'success');

      // Navigate to role-specific dashboard
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'collector') {
        navigate('/collector/dashboard');
      } else {
        navigate('/hospital/dashboard');
      }
    } catch (err) {
      const msg = err.message || '';
      if (
        msg.toLowerCase().includes('network') ||
        msg.toLowerCase().includes('timeout') ||
        msg.toLowerCase().includes('failed to fetch')
      ) {
        setError('Server is spinning up (free Render tier cold-start takes ~30-45s). Please wait a moment and click Sign In again.');
      } else {
        setError(msg || 'Failed to sign in. Please verify your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Quick One-Click Demo Account Fill
  const setDemoCredentials = (role) => {
    setError('');
    if (role === 'admin') {
      setEmail('admin@example.com');
      setPassword('Admin@123');
    } else if (role === 'hospital') {
      setEmail('hospital@example.com');
      setPassword('Hospital@123');
    } else if (role === 'collector') {
      setEmail('collector@example.com');
      setPassword('Collector@123');
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 px-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-600 via-teal-500 to-sky-400 shadow-glow-teal mb-4">
          <Activity className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white">
          MediTrack<span className="text-teal-400">X</span>
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
          Smart Biomedical Waste Collection, Segregation & Digital Traceability Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 z-10">
        <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/10">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl glass-input placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl glass-input placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 transition-all duration-200 shadow-glow-teal flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Access Bar */}
          <div className="mt-6 pt-5 border-t border-slate-700/60">
            <p className="text-[11px] font-semibold text-slate-400 text-center uppercase tracking-wider mb-2.5">
              Quick One-Click Demo Credentials
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDemoCredentials('admin')}
                className="py-2 px-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700 text-[10px] font-semibold text-slate-300 hover:text-white transition-all text-center flex flex-col items-center"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-rose-400 mb-1" />
                <span>Admin</span>
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('hospital')}
                className="py-2 px-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700 text-[10px] font-semibold text-slate-300 hover:text-white transition-all text-center flex flex-col items-center"
              >
                <UserCheck className="w-3.5 h-3.5 text-teal-400 mb-1" />
                <span>Hospital Staff</span>
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('collector')}
                className="py-2 px-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700 text-[10px] font-semibold text-slate-300 hover:text-white transition-all text-center flex flex-col items-center"
              >
                <Truck className="w-3.5 h-3.5 text-sky-400 mb-1" />
                <span>Collector</span>
              </button>
            </div>
          </div>

          <div className="mt-5 text-center">
            <p className="text-xs text-slate-400">
              Need to register hospital staff?{' '}
              <Link to="/register" className="text-teal-400 hover:text-teal-300 font-semibold">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
