import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import GlassCard from '../../components/common/GlassCard';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import Timeline from '../../components/common/Timeline';
import EmptyState from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Truck,
  Building2,
  Calendar,
  User,
  ShieldCheck,
  Package,
  ArrowLeft,
  FileText,
  Clock,
} from 'lucide-react';

const CollectionDetailPage = () => {
  const { id } = useParams();
  const [collectionRequest, setCollectionRequest] = useState(null);
  const [trackingHistory, setTrackingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCollectionDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/collections/${id}`);
        if (res?.data) {
          setCollectionRequest(res.data.request);
          setTrackingHistory(res.data.trackingHistory || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to load collection request.');
      } finally {
        setLoading(false);
      }
    };

    fetchCollectionDetails();
  }, [id]);

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading collection order audit trail..." />;
  }

  if (error || !collectionRequest) {
    return (
      <div className="space-y-4">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-xs text-teal-400 hover:text-teal-300 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Portal</span>
        </Link>
        <EmptyState
          icon={Truck}
          title="Collection Order Not Found"
          description={error || `No collection order found for ID: ${id}`}
        />
      </div>
    );
  }

  const totalKg = collectionRequest.wasteRecords?.reduce((sum, w) => sum + (w.quantity || 0), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center space-x-2 text-xs text-teal-400 hover:text-teal-300 font-semibold mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go Back</span>
        </button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-black tracking-tight text-white font-mono">
            {collectionRequest.requestId}
          </h1>
          <StatusBadge status={collectionRequest.status} size="md" />
          <PriorityBadge priority={collectionRequest.priority} />
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Initiated on{' '}
          {new Date(collectionRequest.createdAt).toLocaleString([], {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Hospital & Collector Info */}
        <div className="space-y-5">
          <GlassCard>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Facility Information
            </h3>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center space-x-2 font-bold text-white text-sm">
                <Building2 className="w-4 h-4 text-teal-400" />
                <span>{collectionRequest.hospital?.name}</span>
              </div>
              <p className="text-slate-400 pl-6">
                {collectionRequest.hospital?.address}, {collectionRequest.hospital?.city}
              </p>
              <p className="text-slate-400 pl-6">
                Requested by: <strong className="text-slate-200">{collectionRequest.requestedBy?.name}</strong>
              </p>
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Assigned Collector & Handoff
            </h3>
            {collectionRequest.collector ? (
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center space-x-2 font-bold text-white text-sm">
                  <User className="w-4 h-4 text-sky-400" />
                  <span>{collectionRequest.collector.name}</span>
                </div>
                <p className="text-slate-400 pl-6">Email: {collectionRequest.collector.email}</p>
                {collectionRequest.collector.phone && (
                  <p className="text-slate-400 pl-6">Phone: {collectionRequest.collector.phone}</p>
                )}
                {collectionRequest.collectorNotes && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-900/60 border border-slate-700/40 text-teal-300 text-xs">
                    <span className="font-semibold text-slate-400 block mb-1">Collector Notes:</span>
                    {collectionRequest.collectorNotes}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-amber-400 italic">
                Awaiting administrator collector assignment.
              </div>
            )}
          </GlassCard>

          {/* Waste Items Payload */}
          <GlassCard>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Waste Batches ({collectionRequest.wasteRecords?.length || 0})
              </h3>
              <span className="font-mono font-bold text-teal-300 text-xs">
                Total: {Math.round(totalKg * 10) / 10} KG
              </span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {collectionRequest.wasteRecords?.map((w) => (
                <Link
                  key={w._id}
                  to={`/waste/${w.wasteId}`}
                  className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-700/50 hover:border-teal-500/40 transition-colors flex items-center justify-between text-xs block"
                >
                  <div>
                    <span className="font-mono font-bold text-teal-400">{w.wasteId}</span>
                    <div className="text-[11px] text-slate-400">
                      {w.category?.name} • {w.department}
                    </div>
                  </div>
                  <div className="text-right font-mono font-bold text-white">
                    {w.quantity} {w.unit}
                  </div>
                </Link>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Workflow Traceability Timeline */}
        <div className="lg:col-span-2">
          <GlassCard>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700/60">
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">
                  Collection Workflow & Audit Traceability
                </h3>
                <p className="text-xs text-slate-400">
                  Real-time status changes, collector actions & verified disposal timestamps
                </p>
              </div>
              <div className="flex items-center space-x-1.5 text-xs text-teal-400 font-mono font-bold bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20">
                <ShieldCheck className="w-4 h-4" />
                <span>Audited Request</span>
              </div>
            </div>

            <Timeline events={trackingHistory} />
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default CollectionDetailPage;
