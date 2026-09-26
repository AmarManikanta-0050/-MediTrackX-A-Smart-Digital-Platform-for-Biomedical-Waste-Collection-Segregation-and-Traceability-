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

  // Dynamic color: emerald → amber → rose
  let trackBg, trackGradient;
  if (percentage >= 90) {
    trackBg = 'bg-rose-100';
    trackGradient = 'from-rose-500 to-rose-600';
  } else if (percentage >= 75) {
    trackBg = 'bg-amber-100';
    trackGradient = 'from-amber-400 to-orange-500';
  } else {
    trackBg = 'bg-emerald-100';
    trackGradient = 'from-emerald-500 to-teal-500';
  }

  const heightClass = size === 'sm' ? 'h-2' : size === 'lg' ? 'h-4' : 'h-3';

  const percentColor = percentage >= 90
    ? 'text-rose-600 font-bold'
    : percentage >= 75
    ? 'text-amber-600'
    : 'text-emerald-600';

  return (
    <div className="w-full">
      {(label || showPercent || subLabel) && (
        <div className="flex justify-between items-center mb-2 text-xs">
          <div className="flex items-center space-x-2 truncate">
            {label && <span className="text-slate-500 font-medium">{label}</span>}
            {subLabel && <span className="font-mono font-bold text-slate-800">{subLabel}</span>}
          </div>
          {showPercent && (
            <span className={`font-semibold ml-2 font-mono text-[11px] ${percentColor}`}>
              {percentage}%
            </span>
          )}
        </div>
      )}

      {/* Track */}
      <div className={`w-full ${trackBg} rounded-full overflow-hidden ${heightClass}`}>
        <div
          className={`h-full rounded-full bg-gradient-to-r ${trackGradient} transition-all duration-700 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
