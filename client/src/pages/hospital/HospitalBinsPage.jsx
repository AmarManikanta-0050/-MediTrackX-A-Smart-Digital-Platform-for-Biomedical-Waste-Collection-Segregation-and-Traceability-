import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import GlassCard from '../../components/common/GlassCard';
import ProgressBar from '../../components/common/ProgressBar';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Trash2, AlertTriangle, MapPin, Building2 } from 'lucide-react';

const HospitalBinsPage = () => {
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBins = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bins');
      if (res?.data) {
        setBins(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBins();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Facility Smart Bins</h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor ward-level fill levels, segregation compartments & collection thresholds
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Reading bin sensors..." />
      ) : bins.length === 0 ? (
        <EmptyState
          icon={Trash2}
          title="No smart bins assigned"
          description="Your hospital does not currently have deployed smart bins."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {bins.map((bin) => {
            const utilization = Math.min(Math.round(((bin.currentLevel || 0) / (bin.capacity || 1)) * 100), 100);
            const isFull = utilization >= 90;

            return (
              <GlassCard
                key={bin._id}
                className={`relative flex flex-col justify-between ${
                  isFull ? 'border-rose-500/40 ring-1 ring-rose-500/30' : ''
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="font-mono text-xs font-bold text-teal-600 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                        {bin.binId}
                      </span>
                      <h3 className="mt-1 text-sm font-bold text-slate-900">{bin.department}</h3>
                    </div>
                    <StatusBadge status={bin.status} />
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 mb-4">
                    <div className="flex items-center space-x-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: bin.category?.colorCode || '#0D9488' }}
                      />
                      <span className="font-semibold text-slate-700">
                        {bin.category?.name || 'Waste Category'}
                      </span>
                    </div>

                    {bin.locationDescription && (
                      <div className="flex items-start space-x-2 text-[11px] text-slate-500">
                        <MapPin className="w-3.5 h-3.5 mt-0.5 text-slate-500 flex-shrink-0" />
                        <span>{bin.locationDescription}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/60 border border-slate-200/40">
                    <ProgressBar
                      value={bin.currentLevel}
                      max={bin.capacity}
                      label="Capacity:"
                      subLabel={`${bin.currentLevel} / ${bin.capacity} KG`}
                      showPercent={true}
                      size="md"
                    />
                    {isFull && (
                      <p className="mt-2 text-[11px] text-rose-600 font-semibold flex items-center space-x-1">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Bin reached capacity threshold! Please request pickup.</span>
                      </p>
                    )}
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HospitalBinsPage;
