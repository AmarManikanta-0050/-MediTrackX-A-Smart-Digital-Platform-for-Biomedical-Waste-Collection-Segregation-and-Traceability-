import React from 'react';

const PriorityBadge = ({ priority }) => {
  const normalized = (priority || '').toLowerCase();

  const config = {
    urgent: 'bg-rose-500/15 text-rose-300 border-rose-500/40 ring-1 ring-rose-500/30 animate-pulse',
    high: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    medium: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    low: 'bg-slate-700/40 text-slate-300 border-slate-600/30',
  };

  const badgeClass = config[normalized] || config.medium;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeClass}`}
    >
      {priority || 'Medium'}
    </span>
  );
};

export default PriorityBadge;
