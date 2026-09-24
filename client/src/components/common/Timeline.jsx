import React from 'react';
import StatusBadge from './StatusBadge';
import { Clock, User, CheckCircle2, ShieldCheck } from 'lucide-react';

const Timeline = ({ events = [] }) => {
  if (!events || events.length === 0) {
    return (
      <div className="p-6 text-center text-slate-400 text-sm">
        No tracking records available for this item.
      </div>
    );
  }

  return (
    <div className="relative pl-6 md:pl-8 space-y-6 before:absolute before:left-3 md:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-teal-500 before:via-blue-500 before:to-slate-700">
      {events.map((event, idx) => {
        const isLatest = idx === events.length - 1;
        const dateObj = new Date(event.timestamp || event.createdAt);
        const formattedDate = dateObj.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        const formattedTime = dateObj.toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
        });

        return (
          <div key={event._id || idx} className="relative group">
            {/* Step Marker Node */}
            <div
              className={`absolute -left-6 md:-left-8 top-1 w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center border transition-transform duration-200 group-hover:scale-110 ${
                isLatest
                  ? 'bg-teal-500 text-white border-teal-300 ring-4 ring-teal-500/20 shadow-glow-teal'
                  : 'bg-navy-900 text-teal-400 border-teal-500/40'
              }`}
            >
              {isLatest ? <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <ShieldCheck className="w-3 h-3 md:w-4 md:h-4" />}
            </div>

            {/* Event Content Card */}
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 hover:border-slate-600 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-semibold text-white tracking-wide">
                    {event.action}
                  </h4>
                  {event.status && <StatusBadge status={event.status} size="sm" />}
                </div>
                <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-teal-400" />
                  <span>
                    {formattedDate} at {formattedTime}
                  </span>
                </div>
              </div>

              {event.notes && (
                <p className="text-xs text-slate-300 bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/30 mb-2">
                  {event.notes}
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <div className="flex items-center space-x-1.5">
                  <User className="w-3 h-3 text-slate-500" />
                  <span>
                    Performed by: <strong className="text-slate-300">{event.performedBy?.name || 'System Operator'}</strong>
                    {event.performedBy?.role && (
                      <span className="ml-1 text-[11px] text-teal-400 uppercase font-mono">
                        ({event.performedBy.role.replace('_', ' ')})
                      </span>
                    )}
                  </span>
                </div>
                {event.requestId && (
                  <span className="font-mono text-[11px] text-slate-500">
                    Req: {event.requestId}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Timeline;
