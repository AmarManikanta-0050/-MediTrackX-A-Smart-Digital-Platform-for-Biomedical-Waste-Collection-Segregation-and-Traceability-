import React from 'react';
import { Activity } from 'lucide-react';

export const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeMap = {
    sm: { spinner: 'w-5 h-5', border: 'border-2', logo: 'w-6 h-6' },
    md: { spinner: 'w-9 h-9', border: 'border-3', logo: 'w-9 h-9' },
    lg: { spinner: 'w-14 h-14', border: 'border-4', logo: 'w-14 h-14' },
  };
  const s = sizeMap[size] || sizeMap.md;

  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4 animate-fade-in">
      {/* Spinner ring around brand icon */}
      <div className="relative">
        <div
          className={`${s.spinner} ${s.border} rounded-full animate-spin`}
          style={{
            borderColor: 'rgba(5,150,105,0.15)',
            borderTopColor: '#059669',
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{
            background: 'linear-gradient(135deg, #059669, #0d9488)',
          }}>
            <svg viewBox="0 0 14 14" className="w-3.5 h-3.5" fill="none">
              <rect x="5.5" y="1" width="3" height="12" rx="1.5" fill="white" />
              <rect x="1" y="5.5" width="12" height="3" rx="1.5" fill="white" />
            </svg>
          </div>
        </div>
      </div>
      {text && (
        <div className="text-center space-y-1">
          <p className="text-sm font-semibold text-slate-700">{text}</p>
          <div className="flex items-center justify-center space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const SkeletonLoader = ({ count = 3, height = 'h-16', className = '' }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`w-full ${height} rounded-xl skeleton`}
          style={{ animationDelay: `${index * 100}ms` }}
        />
      ))}
    </div>
  );
};

export default LoadingSpinner;
