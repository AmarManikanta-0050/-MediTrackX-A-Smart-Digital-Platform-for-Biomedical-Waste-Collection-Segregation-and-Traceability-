import React from 'react';
import StatusBadge from './StatusBadge';
import { Clock, User, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

const Timeline = ({ events = [] }) => {
  if (!events || events.length === 0) {
    return (
      <div className="py-10 text-center">
        <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-sm text-slate-400 font-medium">No tracking records available.</p>
      </div>
    );
  }

  const stages = [
    'Generated', 'Segregated', 'Collected', 'Transported', 'Received', 'Processed'
  ];

  return (
    <div className="relative pl-8 md:pl-10 space-y-5">
      {/* Vertical connector line */}
      <div className="absolute left-3.5 md:left-4 top-4 bottom-4 w-0.5 rounded-full"
        style={{ background: 'linear-gradient(to bottom, #059669, #0d9488 60%, #e2e8f0)' }}
      />

      {events.map((event, idx) => {
        const isLatest = idx === events.length - 1;
        const dateObj = new Date(event.timestamp || event.createdAt);
        const formattedDate = dateObj.toLocaleDateString(undefined, {
          month: 'short', day: 'numeric', year: 'numeric',
        });
        const formattedTime = dateObj.toLocaleTimeString(undefined, {
          hour: '2-digit', minute: '2-digit',
        });

        return (
          <div
            key={event._id || idx}
            className="relative group animate-fade-up"
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            {/* Node */}
            <div
              className={`absolute -left-8 md:-left-10 top-2 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center border-2 transition-transform duration-200 group-hover:scale-110 ${
                isLatest
                  ? 'bg-emerald-600 border-emerald-300 text-white shadow-sm'
                  : 'bg-white border-emerald-300 text-emerald-600'
              }`}
              style={isLatest ? { boxShadow: '0 0 0 4px rgba(5,150,105,0.15)' } : {}}
            >
              {isLatest
                ? <CheckCircle2 className="w-4 h-4" />
                : <ShieldCheck className="w-3.5 h-3.5" />
              }
            </div>

            {/* Event Card */}
            <div className="rounded-xl border transition-all duration-200 group-hover:border-emerald-200 group-hover:shadow-sm overflow-hidden"
              style={{ background: '#ffffff', borderColor: '#e2f5f0' }}
            >
              {/* Card header */}
              <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-2"
                style={{ background: isLatest ? 'linear-gradient(135deg, #ecfdf5, #f0fdf9)' : '#f8fafc' }}
              >
                <div className="flex items-center space-x-2 flex-wrap gap-1">
                  <h4 className="text-sm font-bold text-slate-800">{event.action}</h4>
                  {event.status && <StatusBadge status={event.status} size="sm" />}
                </div>
                <div className="flex items-center space-x-1.5 text-[11px] text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{formattedDate} at {formattedTime}</span>
                </div>
              </div>

              {/* Card body */}
              <div className="px-4 pb-3 pt-2.5 space-y-2">
                {event.notes && (
                  <p className="text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100 leading-relaxed">
                    {event.notes}
                  </p>
                )}
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      By:{' '}
                      <strong className="text-slate-700 font-semibold">
                        {event.performedBy?.name || 'System'}
                      </strong>
                      {event.performedBy?.role && (
                        <span className="ml-1 text-[10px] text-emerald-600 uppercase font-mono">
                          ({event.performedBy.role.replace('_', ' ')})
                        </span>
                      )}
                    </span>
                  </div>
                  {event.requestId && (
                    <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      {event.requestId}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Timeline;
