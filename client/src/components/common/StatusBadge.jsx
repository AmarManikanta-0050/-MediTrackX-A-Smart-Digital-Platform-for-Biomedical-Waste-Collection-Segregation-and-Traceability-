import React from 'react';

const StatusBadge = ({ status, size = 'sm' }) => {
  const normalized = (status || '').toLowerCase();

  const config = {
    pending: {
      label: 'Pending',
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      dot: 'bg-amber-500',
    },
    assigned: {
      label: 'Assigned',
      bg: 'bg-blue-50 text-blue-800 border-blue-200',
      dot: 'bg-blue-500',
    },
    accepted: {
      label: 'Accepted',
      bg: 'bg-teal-50 text-teal-800 border-teal-200',
      dot: 'bg-teal-500',
    },
    collecting: {
      label: 'Collecting',
      bg: 'bg-sky-50 text-sky-800 border-sky-200',
      dot: 'bg-sky-500 animate-pulse',
    },
    collected: {
      label: 'Collected',
      bg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      dot: 'bg-indigo-500',
    },
    completed: {
      label: 'Completed',
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dot: 'bg-emerald-500',
    },
    disposed: {
      label: 'Disposed',
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dot: 'bg-emerald-500',
    },
    cancelled: {
      label: 'Cancelled',
      bg: 'bg-rose-50 text-rose-800 border-rose-200',
      dot: 'bg-rose-500',
    },
    active: {
      label: 'Active',
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dot: 'bg-emerald-500',
    },
    full: {
      label: 'Full',
      bg: 'bg-rose-50 text-rose-800 border-rose-200',
      dot: 'bg-rose-500 animate-ping',
    },
    maintenance: {
      label: 'Maintenance',
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      dot: 'bg-amber-500',
    },
    inactive: {
      label: 'Inactive',
      bg: 'bg-slate-100 text-slate-600 border-slate-200',
      dot: 'bg-slate-400',
    },
    logged: {
      label: 'Logged',
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      dot: 'bg-slate-500',
    },
    'pending collection': {
      label: 'Pending Collection',
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      dot: 'bg-amber-500',
    },
    'in transit': {
      label: 'In Transit',
      bg: 'bg-sky-50 text-sky-800 border-sky-200',
      dot: 'bg-sky-500 animate-pulse',
    },
  };

  const current = config[normalized] || {
    label: status || 'Unknown',
    bg: 'bg-slate-100 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
  };

  const sizeClass = size === 'sm'
    ? 'px-2.5 py-0.5 text-[11px]'
    : 'px-3 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center space-x-1.5 rounded-full border font-medium whitespace-nowrap ${sizeClass} ${current.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${current.dot}`} />
      <span>{current.label}</span>
    </span>
  );
};

export default StatusBadge;
