import React from 'react';

const StatusBadge = ({ status, size = 'sm' }) => {
  const normalized = (status || '').toLowerCase();

  const config = {
    pending: {
      label: 'Pending',
      bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      dot: 'bg-amber-400',
    },
    assigned: {
      label: 'Assigned',
      bg: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
      dot: 'bg-blue-400',
    },
    accepted: {
      label: 'Accepted',
      bg: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
      dot: 'bg-teal-400',
    },
    collecting: {
      label: 'Collecting',
      bg: 'bg-sky-500/15 text-sky-300 border-sky-500/30 animate-pulse',
      dot: 'bg-sky-400',
    },
    collected: {
      label: 'Collected',
      bg: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
      dot: 'bg-indigo-400',
    },
    completed: {
      label: 'Completed',
      bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      dot: 'bg-emerald-400',
    },
    disposed: {
      label: 'Disposed',
      bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      dot: 'bg-emerald-400',
    },
    cancelled: {
      label: 'Cancelled',
      bg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      dot: 'bg-rose-400',
    },
    active: {
      label: 'Active',
      bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      dot: 'bg-emerald-400',
    },
    full: {
      label: 'Full',
      bg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      dot: 'bg-rose-400 animate-ping',
    },
    maintenance: {
      label: 'Maintenance',
      bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      dot: 'bg-amber-400',
    },
    inactive: {
      label: 'Inactive',
      bg: 'bg-slate-700/40 text-slate-400 border-slate-600/30',
      dot: 'bg-slate-500',
    },
    logged: {
      label: 'Logged',
      bg: 'bg-slate-600/20 text-slate-300 border-slate-500/30',
      dot: 'bg-slate-400',
    },
    'pending collection': {
      label: 'Pending Collection',
      bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      dot: 'bg-amber-400',
    },
    'in transit': {
      label: 'In Transit',
      bg: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
      dot: 'bg-sky-400',
    },
  };

  const current = config[normalized] || {
    label: status || 'Unknown',
    bg: 'bg-slate-700/30 text-slate-300 border-slate-600/30',
    dot: 'bg-slate-400',
  };

  const sizeClass = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm font-semibold';

  return (
    <span
      className={`inline-flex items-center space-x-1.5 rounded-full border font-medium ${sizeClass} ${current.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      <span>{current.label}</span>
    </span>
  );
};

export default StatusBadge;
