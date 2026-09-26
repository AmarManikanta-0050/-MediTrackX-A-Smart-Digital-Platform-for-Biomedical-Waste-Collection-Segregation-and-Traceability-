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
  AlertTriangle,
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
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center space-x-2 text-sm text-emerald-600 hover:text-emerald-800 font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go Back</span>
        </button>
        <EmptyState
          icon={FileText}
          title="Waste Record Not Found"
          description={error || `No record found matching identifier: ${id}`}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center space-x-2 text-sm text-emerald-600 hover:text-emerald-800 font-semibold mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
          <div className="flex items-center space-x-3 flex-wrap gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 font-mono">
              {wasteRecord.wasteId}
            </h1>
            <StatusBadge status={wasteRecord.status} size="md" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Registered on{' '}
            {new Date(wasteRecord.createdAt).toLocaleString([], {
              month: 'long', day: 'numeric', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </p>
        </div>

        {wasteRecord.collectionRequest && (
          <Link
            to={`/collections/${wasteRecord.collectionRequest.requestId}`}
            className="btn-primary flex items-center space-x-2 px-4 py-2 text-xs self-start sm:self-auto"
          >
            <Truck className="w-4 h-4" />
            <span>View Collection {wasteRecord.collectionRequest.requestId}</span>
          </Link>
        )}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Waste Specs */}
        <div className="lg:col-span-1 space-y-4">
          <GlassCard>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
              Biomedical Specifications
            </h3>

            <div className="space-y-4 text-sm">
              <div>
                <span className="text-xs text-slate-500 font-medium">Waste Category</span>
                <div className="mt-1.5 flex items-center space-x-2">
                  <span
                    className="w-3.5 h-3.5 rounded-full flex-shrink-0 border-2 border-white shadow-sm"
                    style={{ backgroundColor: wasteRecord.category?.colorCode || '#059669' }}
                  />
                  <span className="font-bold text-slate-900">
                    {wasteRecord.category?.name}
                    <span className="ml-1 text-slate-500 font-mono text-xs">({wasteRecord.category?.code})</span>
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-500 font-medium">Hazard Classification</span>
                <div className="mt-1 flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <p className="text-amber-700 font-semibold text-xs">
                    {wasteRecord.category?.hazardLevel || 'Medium'} Severity
                  </p>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-500 font-medium">Net Weight</span>
                <p className="text-2xl font-extrabold font-mono text-slate-900 mt-0.5">
                  {wasteRecord.quantity}
                  <span className="text-base text-slate-500 font-semibold ml-1">{wasteRecord.unit}</span>
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-500 font-medium">Recommended Container</span>
                <p className="mt-1 text-slate-700 font-medium text-xs">
                  {wasteRecord.category?.recommendedContainer}
                </p>
              </div>

              {wasteRecord.description && (
                <div className="pt-3 border-t border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">Staff Description</span>
                  <p className="mt-1 text-slate-600 leading-relaxed text-xs italic bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                    "{wasteRecord.description}"
                  </p>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Facility Card */}
          <GlassCard>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
              Origin Facility
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2 font-bold text-slate-900">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>{wasteRecord.hospital?.name}</span>
              </div>
              <p className="text-slate-500 text-xs pl-6">
                Ward: <strong className="text-slate-700">{wasteRecord.department}</strong>
              </p>
              {wasteRecord.bin && (
                <p className="text-slate-500 text-xs pl-6 font-mono">
                  Smart Bin: <strong className="text-emerald-600">{wasteRecord.bin.binId}</strong>
                </p>
              )}
              <p className="text-slate-500 text-xs pl-6">
                Logged By: <strong className="text-slate-700">{wasteRecord.createdBy?.name}</strong>
              </p>
            </div>
          </GlassCard>
        </div>

        {/* Right: Timeline */}
        <div className="lg:col-span-2">
          <GlassCard>
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  End-to-End Digital Traceability Timeline
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Custody handoffs, collection states & operator timestamps
                </p>
              </div>
              <div className="flex items-center space-x-1.5 text-xs text-emerald-700 font-semibold bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" />
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
