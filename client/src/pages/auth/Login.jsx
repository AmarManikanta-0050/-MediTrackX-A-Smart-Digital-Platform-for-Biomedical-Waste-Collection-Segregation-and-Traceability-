import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Lock, Mail, ArrowRight, ShieldCheck, UserCheck, Truck, Leaf, Activity } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { addToast } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'MediTrackX | Smart Biomedical Waste Management & Traceability';
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
    <div className="min-h-screen flex" style={{
      background: 'linear-gradient(135deg, #f0fdf9 0%, #ecfdf5 30%, #f0f9ff 70%, #f8fffe 100%)',
    }}>

      {/* Left panel — Brand / Feature showcase */}
      <div className="hidden lg:flex flex-col justify-between w-5/12 xl:w-2/5 p-10 xl:p-14 relative overflow-hidden" style={{
        background: 'linear-gradient(160deg, #065f46 0%, #059669 45%, #0d9488 80%, #0369a1 100%)',
      }}>
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full opacity-10" style={{ background: 'rgba(255,255,255,0.3)' }} />
        <div className="absolute bottom-10 -right-16 w-80 h-80 rounded-full opacity-10" style={{ background: 'rgba(255,255,255,0.2)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-5" style={{ background: 'rgba(255,255,255,0.4)' }} />

        {/* Top: Logo */}
        <div className="relative z-10">
          <Link to="/" className="flex items-center space-x-3 mb-12 group cursor-pointer inline-flex" title="Back to Home">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
              <svg viewBox="0 0 20 20" className="w-6 h-6" fill="none">
                <rect x="8" y="2" width="4" height="16" rx="2" fill="white" />
                <rect x="2" y="8" width="16" height="4" rx="2" fill="white" />
              </svg>
            </div>
            <div>
              <div className="flex items-center space-x-0.5">
                <span className="text-2xl font-black text-white tracking-tight">MediTrack</span>
                <span className="text-2xl font-black text-emerald-200 tracking-tight">X</span>
              </div>
              <span className="text-xs text-emerald-200 font-medium tracking-widest uppercase">Biomedical Traceability Platform</span>
            </div>
          </Link>

          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-emerald-100 text-[11px] font-bold mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
            <span>Next-Generation Bio-Medical Waste Ecosystem</span>
          </div>

          <h1 className="text-3xl xl:text-4xl font-black text-white leading-tight mb-4">
            Intelligent Biomedical<br />
            <span className="text-emerald-200">Waste Traceability</span><br />
            & Smart Segregation
          </h1>
          <p className="text-emerald-100 text-sm leading-relaxed max-w-xs font-normal">
            End-to-end digital chain of custody connecting hospital wards, IoT ultrasonic smart bins, AI classification, GPS fleet logistics, and certified treatment facilities.
          </p>
        </div>

        {/* Middle: Feature list */}
        <div className="relative z-10 space-y-4 my-8">
          {[
            { icon: '🏥', label: 'Hospital Waste Logging', desc: 'Real-time biomedical segregation' },
            { icon: '🚛', label: 'Collection & Transit', desc: 'GPS-tracked pickup routing' },
            { icon: '🔍', label: 'Digital Traceability', desc: 'Immutable chain of custody' },
            { icon: '📊', label: 'Analytics & Compliance', desc: 'Reports & regulatory tracking' },
          ].map((f) => (
            <div key={f.label} className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-lg flex-shrink-0">
                {f.icon}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{f.label}</p>
                <p className="text-xs text-emerald-200">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom: Sustainability badge */}
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/15 border border-white/20">
            <Leaf className="w-4 h-4 text-emerald-200" />
            <span className="text-xs text-emerald-100 font-medium">Committed to Environmental Sustainability</span>
          </div>
        </div>
      </div>

      {/* Right panel — Login form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 sm:px-8 lg:px-14 xl:px-20">

        {/* Mobile logo */}
        <Link to="/" className="lg:hidden flex items-center space-x-3 mb-8 group cursor-pointer" title="Back to Home">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105" style={{
            background: 'linear-gradient(135deg, #059669, #0d9488)',
            boxShadow: '0 4px 12px rgba(5,150,105,0.3)',
          }}>
            <svg viewBox="0 0 20 20" className="w-5 h-5" fill="none">
              <rect x="8" y="2" width="4" height="16" rx="2" fill="white" />
              <rect x="2" y="8" width="16" height="4" rx="2" fill="white" />
            </svg>
          </div>
          <div>
            <div className="flex items-center">
              <span className="text-xl font-black text-slate-900">MediTrack</span>
              <span className="text-xl font-black text-emerald-600">X</span>
            </div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Biomedical Traceability Platform</span>
          </div>
        </Link>

        <div className="w-full max-w-md">
          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Sign in to your account
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Access your biomedical waste management portal
            </p>
          </div>

          {/* Error alert */}
          {error && (
            <div className="mb-5 p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-sm font-medium leading-relaxed flex items-start space-x-2">
              <span className="text-rose-500 mt-0.5">⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="form-label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 flex items-center justify-center space-x-2 mt-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <p className="text-[11px] font-bold text-slate-400 text-center uppercase tracking-widest mb-3">
              Quick One-Click Demo Access
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { role: 'admin', label: 'Admin', icon: ShieldCheck, color: 'rose' },
                { role: 'hospital', label: 'Hospital Staff', icon: UserCheck, color: 'emerald' },
                { role: 'collector', label: 'Collector', icon: Truck, color: 'sky' },
              ].map(({ role, label, icon: Icon, color }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setDemoCredentials(role)}
                  className={`flex flex-col items-center py-3 px-2 rounded-xl border text-[11px] font-semibold transition-all hover:-translate-y-0.5 ${
                    color === 'rose'
                      ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                      : color === 'emerald'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                      : 'bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 mb-1 ${
                    color === 'rose' ? 'text-rose-500' : color === 'emerald' ? 'text-emerald-500' : 'text-sky-500'
                  }`} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 text-center">
            <p className="text-sm text-slate-500">
              Need to register hospital staff?{' '}
              <Link to="/register" className="text-emerald-600 hover:text-emerald-800 font-semibold underline-offset-2 hover:underline transition-colors">
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
