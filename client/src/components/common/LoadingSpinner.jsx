import React from 'react';

export const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <div
        className={`${sizeMap[size] || sizeMap.md} rounded-full border-teal-500/20 border-t-teal-400 animate-spin`}
      />
      {text && <p className="text-xs text-slate-400 font-medium tracking-wide">{text}</p>}
    </div>
  );
};

export const SkeletonLoader = ({ count = 3, height = 'h-16', className = '' }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`w-full ${height} rounded-xl bg-slate-800/50 border border-slate-700/30 animate-pulse`}
        />
      ))}
    </div>
  );
};

export default LoadingSpinner;
