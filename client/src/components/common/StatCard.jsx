import React from 'react';
import GlassCard from './GlassCard';

const StatCard = ({
  title,
  value,
  unit = '',
  icon: Icon,
  trend = null,
  trendLabel = '',
  colorScheme = 'teal', // teal, blue, amber, emerald, rose
}) => {
  const colorMap = {
    teal: {
      bg: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
      glow: 'group-hover:border-teal-500/40',
    },
    blue: {
      bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      glow: 'group-hover:border-blue-500/40',
    },
    amber: {
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      glow: 'group-hover:border-amber-500/40',
    },
    emerald: {
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      glow: 'group-hover:border-emerald-500/40',
    },
    rose: {
      bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      glow: 'group-hover:border-rose-500/40',
    },
  };

  const scheme = colorMap[colorScheme] || colorMap.teal;

  return (
    <GlassCard className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <div className="mt-2 flex items-baseline space-x-2">
            <h3 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">{value}</h3>
            {unit && <span className="text-xs font-semibold text-slate-400">{unit}</span>}
          </div>
          {trend !== null && (
            <p className="mt-2 text-xs flex items-center space-x-1">
              <span className={`font-semibold ${trend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {trend >= 0 ? `+${trend}%` : `${trend}%`}
              </span>
              <span className="text-slate-400">{trendLabel}</span>
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl border ${scheme.bg} transition-transform duration-300 group-hover:scale-110`}>
            <Icon className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
        )}
      </div>
      {/* Subtle bottom gradient line */}
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-teal-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </GlassCard>
  );
};

export default StatCard;
