import React from 'react';

const PriorityBadge = ({ priority }) => {
  const normalized = (priority || '').toLowerCase();

  const config = {
    critical: {
      label: '🔴 Critical',
      className: 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
    },
    high: {
      label: '🟠 High',
      className: 'bg-orange-100 text-orange-800 border-orange-300 font-bold',
    },
    medium: {
      label: '🟡 Medium',
      className: 'bg-amber-100 text-amber-800 border-amber-300',
    },
    low: {
      label: '🟢 Low',
      className: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
  };

  const current = config[normalized] || {
    label: priority || 'Normal',
    className: 'bg-slate-100 text-slate-700 border-slate-300',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] border ${current.className}`}>
      {current.label}
    </span>
  );
};

export default PriorityBadge;
