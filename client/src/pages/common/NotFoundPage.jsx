import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Leaf } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={{
      background: 'linear-gradient(135deg, #f0fdf9 0%, #ecfdf5 40%, #f0f9ff 100%)',
    }}>

      {/* Decorative blob */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none opacity-30"
        style={{ background: 'radial-gradient(circle, rgba(5,150,105,0.12) 0%, transparent 70%)' }} />

      <div className="relative z-10 animate-fade-up">
        {/* Icon */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-md" style={{
            background: 'linear-gradient(135deg, #059669, #0d9488)',
            boxShadow: '0 8px 32px rgba(5,150,105,0.25)',
          }}>
            <svg viewBox="0 0 32 32" className="w-10 h-10" fill="none">
              <rect x="13" y="4" width="6" height="24" rx="3" fill="white" />
              <rect x="4" y="13" width="24" height="6" rx="3" fill="white" />
            </svg>
          </div>
        </div>

        {/* 404 */}
        <div className="text-8xl font-black tracking-tighter mb-2" style={{
          background: 'linear-gradient(135deg, #059669, #0d9488)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          404
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Page Not Located</h1>
        <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed mb-8">
          The requested biomedical waste resource or console route does not exist or has been relocated.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="btn-primary flex items-center space-x-2 px-6 py-3"
          >
            <Home className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>

        <div className="mt-8 flex items-center justify-center space-x-1.5 text-xs text-slate-400">
          <Leaf className="w-3.5 h-3.5 text-emerald-400" />
          <span>MediTrackX · Smart Biomedical Waste Platform</span>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
