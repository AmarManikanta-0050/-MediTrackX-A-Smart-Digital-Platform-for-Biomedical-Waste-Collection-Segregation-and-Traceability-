import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There is currently no data to display for this view.',
  action = null,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 md:p-14 text-center rounded-2xl border-2 border-dashed border-emerald-100 bg-gradient-to-b from-emerald-50/40 to-white">
      {/* Icon container */}
      <div className="relative mb-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm">
          <Icon className="w-8 h-8" />
        </div>
        {/* Decorative rings */}
        <div className="absolute inset-0 rounded-2xl border-2 border-emerald-100 scale-110 opacity-50" />
        <div className="absolute inset-0 rounded-2xl border border-emerald-50 scale-125 opacity-30" />
      </div>

      <h4 className="text-base font-bold text-slate-800">{title}</h4>
      <p className="mt-1.5 text-sm text-slate-500 max-w-xs leading-relaxed">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

export default EmptyState;
