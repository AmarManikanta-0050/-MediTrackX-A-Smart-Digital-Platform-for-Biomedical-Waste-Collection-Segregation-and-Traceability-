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
  ArrowRight,
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
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center space-x-2 text-sm text-emerald-600 hover:text-emerald-800 font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go Back</span>
        </button>
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
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div>
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center space-x-2 text-sm text-emerald-600 hover:text-emerald-800 font-semibold mb-3 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go Back</span>
        </button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 font-mono">
            {collectionRequest.requestId}
          </h1>
          <StatusBadge status={collectionRequest.status} size="md" />
          <PriorityBadge priority={collectionRequest.priority} />
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Initiated on{' '}
          {new Date(collectionRequest.createdAt).toLocaleString([], {
            month: 'long', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Facility Info */}
          <GlassCard>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
              Facility Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2 font-bold text-slate-900">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>{collectionRequest.hospital?.name}</span>
              </div>
              <p className="text-slate-500 text-xs pl-6">
                {collectionRequest.hospital?.address}, {collectionRequest.hospital?.city}
              </p>
              <p className="text-slate-500 text-xs pl-6">
                Requested by: <strong className="text-slate-700">{collectionRequest.requestedBy?.name}</strong>
              </p>
            </div>
          </GlassCard>

          {/* Collector Info */}
          <GlassCard>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
              Assigned Collector & Handoff
            </h3>
            {collectionRequest.collector ? (
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2 font-bold text-slate-900">
                  <User className="w-4 h-4 text-sky-600" />
                  <span>{collectionRequest.collector.name}</span>
                </div>
                <p className="text-slate-500 text-xs pl-6">
                  {collectionRequest.collector.email}
                </p>
                {collectionRequest.collector.phone && (
                  <p className="text-slate-500 text-xs pl-6">
                    {collectionRequest.collector.phone}
                  </p>
                )}
                {collectionRequest.collectorNotes && (
                  <div className="mt-3 p-3 rounded-xl bg-teal-50 border border-teal-100 text-teal-800 text-xs">
                    <span className="font-bold block mb-1">Collector Notes:</span>
                    {collectionRequest.collectorNotes}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700 font-medium">
                <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>Awaiting administrator collector assignment.</span>
              </div>
            )}
          </GlassCard>

          {/* Waste Batches */}
          <GlassCard>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Waste Batches ({collectionRequest.wasteRecords?.length || 0})
              </h3>
              <span className="font-mono font-bold text-emerald-600 text-xs bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                {Math.round(totalKg * 10) / 10} KG
              </span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {collectionRequest.wasteRecords?.map((w) => (
                <Link
                  key={w._id}
                  to={`/waste/${w.wasteId}`}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all flex items-center justify-between text-xs group"
                >
                  <div>
                    <span className="font-mono font-bold text-emerald-600">{w.wasteId}</span>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {w.category?.name} · {w.department}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-mono font-bold text-slate-800">
                      {w.quantity} {w.unit}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Timeline */}
        <div className="lg:col-span-2">
          <GlassCard>
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Collection Workflow & Audit Traceability
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time status changes, collector actions & verified disposal timestamps
                </p>
              </div>
              <div className="flex items-center space-x-1.5 text-xs text-emerald-700 font-semibold bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" />
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
