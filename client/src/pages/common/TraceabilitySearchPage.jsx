import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import GlassCard from '../../components/common/GlassCard';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import Timeline from '../../components/common/Timeline';
import EmptyState from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Search, ShieldCheck, ArrowRight, Building2, Truck, FileText } from 'lucide-react';

const TraceabilitySearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryId = searchParams.get('id') || '';

  const [inputVal, setInputVal] = useState(queryId);
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const executeSearch = async (identifier) => {
    if (!identifier.trim()) return;
    try {
      setLoading(true);
      setError('');
      setSearched(true);
      const res = await api.get(`/tracking/${encodeURIComponent(identifier.trim())}`);
      if (res?.data) {
        setTrackingData(res.data);
      }
    } catch (err) {
      setError(err.message || 'No tracking records found for this identifier.');
      setTrackingData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queryId) {
      setInputVal(queryId);
      executeSearch(queryId);
    }
  }, [queryId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputVal.trim()) {
      setSearchParams({ id: inputVal.trim() });
      executeSearch(inputVal.trim());
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20 mb-3 shadow-glow-teal">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          Digital Traceability & Chain of Custody
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
          Query the immutable audit record of any biomedical waste batch or collection order
        </p>
      </div>

      {/* Search Input Bar */}
      <GlassCard className="p-4 sm:p-5">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Enter Waste ID (e.g. MW-2026-900101) or Request ID (e.g. CR-2026-000101)..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl glass-input placeholder-slate-500 font-mono focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 shadow-glow-teal transition-all flex items-center justify-center space-x-2"
          >
            <span>Track Chain</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </GlassCard>

      {/* Results Area */}
      {loading ? (
        <LoadingSpinner size="lg" text="Searching cryptographic audit logs..." />
      ) : error ? (
        <EmptyState icon={Search} title="Record Not Located" description={error} />
      ) : trackingData ? (
        <div className="space-y-6">
          {/* Metadata Card */}
          <GlassCard>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-700/60">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Target Entity
                </span>
                <h3 className="text-xl font-black font-mono text-teal-400">
                  {trackingData.identifier}
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                {trackingData.wasteRecord && (
                  <StatusBadge status={trackingData.wasteRecord.status} size="md" />
                )}
                {trackingData.collectionRequest && (
                  <StatusBadge status={trackingData.collectionRequest.status} size="md" />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
              {trackingData.wasteRecord && (
                <>
                  <div>
                    <span className="text-slate-400">Category</span>
                    <p className="font-semibold text-white mt-0.5">
                      {trackingData.wasteRecord.category?.name}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Weight & Dept</span>
                    <p className="font-semibold text-white mt-0.5">
                      {trackingData.wasteRecord.quantity} {trackingData.wasteRecord.unit} • {trackingData.wasteRecord.department}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Facility</span>
                    <p className="font-semibold text-white mt-0.5">
                      {trackingData.wasteRecord.hospital?.name}
                    </p>
                  </div>
                </>
              )}

              {trackingData.collectionRequest && (
                <>
                  <div>
                    <span className="text-slate-400">Hospital Facility</span>
                    <p className="font-semibold text-white mt-0.5">
                      {trackingData.collectionRequest.hospital?.name}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Priority</span>
                    <div className="mt-0.5">
                      <PriorityBadge priority={trackingData.collectionRequest.priority} />
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Collector</span>
                    <p className="font-semibold text-white mt-0.5">
                      {trackingData.collectionRequest.collector?.name || 'Awaiting assignment'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </GlassCard>

          {/* Chronological Timeline */}
          <GlassCard>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700/60">
              <h3 className="text-sm font-bold text-white tracking-wide">
                Audit Trail ({trackingData.totalEvents} Logged Events)
              </h3>
              <span className="text-xs text-teal-400 font-mono font-semibold">
                Verified Records
              </span>
            </div>

            <Timeline events={trackingData.timeline} />
          </GlassCard>
        </div>
      ) : searched ? (
        <EmptyState title="No results" description="Please verify the entered ID." />
      ) : null}
    </div>
  );
};

export default TraceabilitySearchPage;
