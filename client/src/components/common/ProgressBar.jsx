import React from 'react';

const ProgressBar = ({
  value = 0,
  max = 100,
  label = '',
  subLabel = '',
  showPercent = true,
  size = 'md', // sm, md, lg
}) => {
  const percentage = Math.min(Math.max(Math.round((value / (max || 1)) * 100), 0), 100);

  // Dynamic color threshold: green -> amber -> red
  let colorClass = 'from-teal-500 to-emerald-400';
  if (percentage >= 90) {
    colorClass = 'from-rose-500 to-rose-600 animate-pulse';
  } else if (percentage >= 75) {
    colorClass = 'from-amber-500 to-orange-500';
  }

  const heightClass = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3.5' : 'h-2.5';

  return (
    <div className="w-full">
      {(label || showPercent || subLabel) && (
        <div className="flex justify-between items-center mb-1.5 text-xs">
          <div className="flex items-center space-x-1.5 truncate">
            {label && <span className="text-slate-400 font-medium">{label}</span>}
            {subLabel && <span className="font-mono font-bold text-white">{subLabel}</span>}
          </div>
          {showPercent && (
            <span
              className={`font-semibold ml-2 font-mono ${
                percentage >= 90 ? 'text-rose-400 font-bold' : percentage >= 75 ? 'text-amber-400' : 'text-slate-300'
              }`}
            >
              {percentage}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/50 ${heightClass}`}>
        <div
          className={`h-full rounded-full bg-gradient-to-r ${colorClass} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
