import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import GlassCard from '../../components/common/GlassCard';
import StatusBadge from '../../components/common/StatusBadge';
import Timeline from '../../components/common/Timeline';
import EmptyState from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  FileText,
  Building2,
  Trash2,
  Calendar,
  User,
  ShieldCheck,
  Package,
  ArrowLeft,
  Truck,
} from 'lucide-react';

const WasteDetailPage = () => {
  const { id } = useParams();
  const [wasteRecord, setWasteRecord] = useState(null);
  const [trackingHistory, setTrackingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchWasteDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/waste/${id}`);
        if (res?.data) {
          setWasteRecord(res.data.record);
          setTrackingHistory(res.data.trackingHistory || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to load waste record details.');
      } finally {
        setLoading(false);
      }
    };

    fetchWasteDetails();
  }, [id]);

  if (loading) {
    return <LoadingSpinner size="lg" text="Retrieving digital waste ledger..." />;
  }

  if (error || !wasteRecord) {
    return (
      <div className="space-y-4">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-xs text-teal-400 hover:text-teal-300 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
        <EmptyState
          icon={FileText}
          title="Waste Record Not Found"
          description={error || `No record found matching identifier: ${id}`}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center space-x-2 text-xs text-teal-400 hover:text-teal-300 font-semibold mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-black tracking-tight text-white font-mono">
              {wasteRecord.wasteId}
            </h1>
            <StatusBadge status={wasteRecord.status} size="md" />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Registered on{' '}
            {new Date(wasteRecord.createdAt).toLocaleString([], {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        {wasteRecord.collectionRequest && (
          <Link
            to={`/collections/${wasteRecord.collectionRequest.requestId}`}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 shadow-glow-teal flex items-center space-x-2 self-start sm:self-auto"
          >
            <Truck className="w-4 h-4" />
            <span>View Collection Order {wasteRecord.collectionRequest.requestId}</span>
          </Link>
        )}
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Waste Batch Specs */}
        <div className="lg:col-span-1 space-y-5">
          <GlassCard>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Biomedical Specifications
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-slate-400">Waste Category</span>
                <div className="mt-1 flex items-center space-x-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: wasteRecord.category?.colorCode || '#0D9488' }}
                  />
                  <span className="text-base font-bold text-white">
                    {wasteRecord.category?.name} ({wasteRecord.category?.code})
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-400">Hazard Classification</span>
                <p className="mt-0.5 text-rose-300 font-semibold">
                  {wasteRecord.category?.hazardLevel || 'Medium'} Severity
                </p>
              </div>

              <div>
                <span className="text-slate-400">Net Weight</span>
                <p className="mt-0.5 text-xl font-bold font-mono text-white">
                  {wasteRecord.quantity} {wasteRecord.unit}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-700/50">
                <span className="text-slate-400">Recommended Container</span>
                <p className="mt-0.5 text-slate-200">
                  {wasteRecord.category?.recommendedContainer}
                </p>
              </div>

              {wasteRecord.description && (
                <div className="pt-2 border-t border-slate-700/50">
                  <span className="text-slate-400">Staff Description</span>
                  <p className="mt-0.5 text-slate-300 leading-relaxed italic">
                    "{wasteRecord.description}"
                  </p>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Healthcare Facility Card */}
          <GlassCard>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Origin Facility
            </h3>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center space-x-2 font-bold text-white">
                <Building2 className="w-4 h-4 text-teal-400" />
                <span>{wasteRecord.hospital?.name}</span>
              </div>
              <p className="text-slate-400 pl-6">
                Ward: <strong className="text-slate-200">{wasteRecord.department}</strong>
              </p>
              {wasteRecord.bin && (
                <p className="text-slate-400 pl-6 font-mono">
                  Smart Bin: <strong className="text-teal-400">{wasteRecord.bin.binId}</strong>
                </p>
              )}
              <p className="text-slate-400 pl-6">
                Logged By: <strong className="text-slate-200">{wasteRecord.createdBy?.name}</strong>
              </p>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Digital Traceability Audit Timeline */}
        <div className="lg:col-span-2">
          <GlassCard>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700/60">
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">
                  End-to-End Digital Traceability Timeline
                </h3>
                <p className="text-xs text-slate-400">
                  Cryptographically tied custody handoffs, collection states & operator timestamps
                </p>
              </div>
              <div className="flex items-center space-x-1.5 text-xs text-teal-400 font-mono font-bold bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20">
                <ShieldCheck className="w-4 h-4" />
                <span>Audited Chain</span>
              </div>
            </div>

            <Timeline events={trackingHistory} />
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default WasteDetailPage;
