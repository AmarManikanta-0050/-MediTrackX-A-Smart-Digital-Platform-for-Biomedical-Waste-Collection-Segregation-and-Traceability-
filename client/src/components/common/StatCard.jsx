import React from 'react';
import GlassCard from './GlassCard';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({
  title,
  value,
  unit = '',
  icon: Icon,
  trend = null,
  trendLabel = '',
  colorScheme = 'emerald', // emerald, teal, blue, amber, rose, sky
}) => {
  const colorMap = {
    emerald: {
      iconBg: 'bg-emerald-600',
      iconText: 'text-white',
      accent: 'bg-emerald-500',
      valueFg: 'text-slate-900',
      glow: 'rgba(5,150,105,0.12)',
      borderHover: 'rgba(5,150,105,0.25)',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    teal: {
      iconBg: 'bg-teal-600',
      iconText: 'text-white',
      accent: 'bg-teal-500',
      valueFg: 'text-slate-900',
      glow: 'rgba(13,148,136,0.12)',
      borderHover: 'rgba(13,148,136,0.25)',
      badge: 'bg-teal-50 text-teal-700 border-teal-200',
    },
    blue: {
      iconBg: 'bg-blue-600',
      iconText: 'text-white',
      accent: 'bg-blue-500',
      valueFg: 'text-slate-900',
      glow: 'rgba(2,132,199,0.12)',
      borderHover: 'rgba(2,132,199,0.25)',
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    amber: {
      iconBg: 'bg-amber-500',
      iconText: 'text-white',
      accent: 'bg-amber-400',
      valueFg: 'text-slate-900',
      glow: 'rgba(217,119,6,0.10)',
      borderHover: 'rgba(217,119,6,0.25)',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    rose: {
      iconBg: 'bg-rose-600',
      iconText: 'text-white',
      accent: 'bg-rose-500',
      valueFg: 'text-slate-900',
      glow: 'rgba(225,29,72,0.10)',
      borderHover: 'rgba(225,29,72,0.25)',
      badge: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    sky: {
      iconBg: 'bg-sky-500',
      iconText: 'text-white',
      accent: 'bg-sky-400',
      valueFg: 'text-slate-900',
      glow: 'rgba(14,165,233,0.10)',
      borderHover: 'rgba(14,165,233,0.25)',
      badge: 'bg-sky-50 text-sky-700 border-sky-200',
    },
  };

  const scheme = colorMap[colorScheme] || colorMap.emerald;

  return (
    <div
      className="group relative rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 cursor-default overflow-hidden"
      style={{
        background: '#ffffff',
        border: '1px solid rgba(16,185,129,0.10)',
        boxShadow: `0 1px 3px rgba(0,0,0,0.04), 0 8px 24px ${scheme.glow}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 4px 12px rgba(0,0,0,0.06), 0 16px 32px ${scheme.glow.replace('0.12', '0.18')}`;
        e.currentTarget.style.borderColor = scheme.borderHover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = `0 1px 3px rgba(0,0,0,0.04), 0 8px 24px ${scheme.glow}`;
        e.currentTarget.style.borderColor = 'rgba(16,185,129,0.10)';
      }}
    >
      {/* Accent top stripe */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${scheme.accent} rounded-t-2xl opacity-80`} />

      <div className="flex items-start justify-between pt-1">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">{title}</p>
          <div className="flex items-baseline space-x-1.5">
            <h3 className={`text-2xl lg:text-3xl font-extrabold tracking-tight ${scheme.valueFg}`}>
              {value}
            </h3>
            {unit && (
              <span className="text-sm font-semibold text-slate-400">{unit}</span>
            )}
          </div>
          {trend !== null && (
            <div className="mt-2 flex items-center space-x-1">
              {trend >= 0
                ? <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                : <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
              }
              <span className={`text-xs font-semibold ${trend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {trend >= 0 ? `+${trend}%` : `${trend}%`}
              </span>
              <span className="text-xs text-slate-400">{trendLabel}</span>
            </div>
          )}
        </div>

        {Icon && (
          <div className={`w-12 h-12 rounded-2xl ${scheme.iconBg} ${scheme.iconText} flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 shadow-sm`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
