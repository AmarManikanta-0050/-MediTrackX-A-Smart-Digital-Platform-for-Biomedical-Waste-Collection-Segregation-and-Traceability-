import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import GlassCard from '../../components/common/GlassCard';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import Timeline from '../../components/common/Timeline';
import EmptyState from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Search, ShieldCheck, ArrowRight, Building2, Truck, FileText, ScanLine } from 'lucide-react';

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
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-up">

      {/* Page Header */}
      <div className="text-center py-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-md" style={{
          background: 'linear-gradient(135deg, #059669, #0d9488)',
          boxShadow: '0 6px 20px rgba(5,150,105,0.25)',
        }}>
          <ShieldCheck className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Digital Traceability & Chain of Custody
        </h1>
        <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
          Query the immutable audit record of any biomedical waste batch or collection order
        </p>

        {/* Workflow stages indicator */}
        <div className="flex items-center justify-center flex-wrap gap-1 mt-4">
          {['Generated', 'Segregated', 'Collected', 'Transported', 'Received', 'Processed'].map((stage, i, arr) => (
            <div key={stage} className="flex items-center">
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-full">
                {stage}
              </span>
              {i < arr.length - 1 && (
                <ArrowRight className="w-3 h-3 text-slate-300 mx-1" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <GlassCard className="p-4 sm:p-5">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <ScanLine className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Enter Waste ID (MW-2026-...) or Request ID (CR-2026-...)..."
              className="w-full pl-10 pr-4 py-3 text-sm rounded-xl glass-input placeholder-slate-400 font-mono focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary px-6 py-3 flex items-center justify-center space-x-2 whitespace-nowrap"
          >
            <Search className="w-4 h-4" />
            <span>Track Chain</span>
          </button>
        </form>
      </GlassCard>

      {/* Results */}
      {loading ? (
        <LoadingSpinner size="lg" text="Searching audit logs..." />
      ) : error ? (
        <EmptyState icon={Search} title="Record Not Located" description={error} />
      ) : trackingData ? (
        <div className="space-y-5">

          {/* Metadata Card */}
          <GlassCard>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                  Tracked Entity
                </span>
                <div className="flex items-center space-x-2 mt-1">
                  <h3 className="text-xl font-extrabold font-mono text-emerald-600">
                    {trackingData.identifier}
                  </h3>
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
              </div>
              <div className="flex items-center space-x-2 flex-wrap gap-2">
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
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <span className="text-slate-500 uppercase font-bold tracking-wider text-[10px]">Category</span>
                    <p className="font-bold text-slate-800 mt-1">{trackingData.wasteRecord.category?.name}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <span className="text-slate-500 uppercase font-bold tracking-wider text-[10px]">Weight & Department</span>
                    <p className="font-bold text-slate-800 mt-1">
                      {trackingData.wasteRecord.quantity} {trackingData.wasteRecord.unit} · {trackingData.wasteRecord.department}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <span className="text-slate-500 uppercase font-bold tracking-wider text-[10px]">Facility</span>
                    <p className="font-bold text-slate-800 mt-1">{trackingData.wasteRecord.hospital?.name}</p>
                  </div>
                </>
              )}

              {trackingData.collectionRequest && (
                <>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <span className="text-slate-500 uppercase font-bold tracking-wider text-[10px]">Hospital Facility</span>
                    <p className="font-bold text-slate-800 mt-1">{trackingData.collectionRequest.hospital?.name}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <span className="text-slate-500 uppercase font-bold tracking-wider text-[10px]">Priority</span>
                    <div className="mt-1">
                      <PriorityBadge priority={trackingData.collectionRequest.priority} />
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <span className="text-slate-500 uppercase font-bold tracking-wider text-[10px]">Collector</span>
                    <p className="font-bold text-slate-800 mt-1">
                      {trackingData.collectionRequest.collector?.name || (
                        <span className="text-amber-600 font-medium">Awaiting assignment</span>
                      )}
                    </p>
                  </div>
                </>
              )}
            </div>
          </GlassCard>

          {/* Timeline Card */}
          <GlassCard>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Audit Trail
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {trackingData.totalEvents} chronologically logged custody events
                </p>
              </div>
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-100 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[11px] text-emerald-700 font-bold">Verified Records</span>
              </div>
            </div>
            <Timeline events={trackingData.timeline} />
          </GlassCard>
        </div>
      ) : searched ? (
        <EmptyState title="No results" description="Please verify the entered ID and try again." />
      ) : null}
    </div>
  );
};

export default TraceabilitySearchPage;
