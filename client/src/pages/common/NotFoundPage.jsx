import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Home, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-navy-900 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center mb-4 shadow-glow-teal">
        <Activity className="w-8 h-8" />
      </div>
      <h1 className="text-5xl font-black text-white font-mono">404</h1>
      <h2 className="text-xl font-bold text-slate-200 mt-2">Page Not Located</h2>
      <p className="text-xs text-slate-400 mt-1 max-w-sm">
        The requested biomedical waste resource or console route does not exist or has been relocated.
      </p>
      <div className="mt-6">
        <Link
          to="/"
          className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 shadow-glow-teal flex items-center space-x-2 transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
