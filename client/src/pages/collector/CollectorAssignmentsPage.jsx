import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import GlassCard from '../../components/common/GlassCard';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useNotifications } from '../../context/NotificationContext';
import {
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  ArrowRight,
  FileText,
  AlertCircle,
  PackageCheck,
  Check,
} from 'lucide-react';

const CollectorAssignmentsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status Action Modal State
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    request: null,
    targetStatus: '',
    title: '',
  });
  const [collectorNotes, setCollectorNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { addToast } = useNotifications();

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/collections');
      if (res?.data) {
        // Show active assignments (not Completed/Cancelled)
        setRequests(res.data.filter((r) => !['Completed', 'Cancelled'].includes(r.status)));
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleOpenAction = (request, targetStatus, title) => {
    setActionModal({
      isOpen: true,
      request,
      targetStatus,
      title,
    });
    setCollectorNotes('');
  };

  const handleConfirmStatusChange = async (e) => {
    e.preventDefault();
    if (!actionModal.request || !actionModal.targetStatus) return;

    try {
      setSubmitting(true);
      await api.patch(`/collections/${actionModal.request._id}/status`, {
        status: actionModal.targetStatus,
        collectorNotes,
      });

      addToast(
        `Request ${actionModal.request.requestId} updated to ${actionModal.targetStatus}!`,
        'success'
      );
      setActionModal({ isOpen: false, request: null, targetStatus: '', title: '' });
      fetchAssignments();
    } catch (err) {
      addToast(err.message || 'Status transition failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const renderWorkflowActionButton = (req) => {
    switch (req.status) {
      case 'Assigned':
        return (
          <button
            onClick={() => handleOpenAction(req, 'Accepted', 'Accept Assignment')}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 shadow-glow-teal flex items-center justify-center space-x-1.5 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Accept Assignment</span>
          </button>
        );
      case 'Accepted':
        return (
          <button
            onClick={() => handleOpenAction(req, 'Collecting', 'Start Collection & Transit')}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 shadow-glow-blue flex items-center justify-center space-x-1.5 transition-all"
          >
            <Truck className="w-4 h-4" />
            <span>Start Waste Collection</span>
          </button>
        );
      case 'Collecting':
        return (
          <button
            onClick={() => handleOpenAction(req, 'Collected', 'Confirm Physical Collection')}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center space-x-1.5 transition-all"
          >
            <PackageCheck className="w-4 h-4" />
            <span>Mark Waste Collected</span>
          </button>
        );
      case 'Collected':
        return (
          <button
            onClick={() => handleOpenAction(req, 'Completed', 'Complete Disposal & Handover')}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center space-x-1.5 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Complete Disposal Protocol</span>
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white">Active Biohazard Pickups</h1>
        <p className="text-xs text-slate-400 mt-1">
          Perform digital workflow handoffs: Accept → Start Transit → Collect → Complete Disposal
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading assigned pickups..." />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No pending assignments"
          description="You have no active collection requests assigned at this time."
          action={
            <Link
              to="/collector/history"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 transition-colors"
            >
              View Collection History
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const totalKg = req.wasteRecords?.reduce((sum, w) => sum + (w.quantity || 0), 0) || 0;

            return (
              <GlassCard key={req._id} className="p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center space-x-2.5 mb-2">
                      <span className="font-mono text-sm font-bold text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded border border-teal-500/20">
                        {req.requestId}
                      </span>
                      <PriorityBadge priority={req.priority} />
                      <StatusBadge status={req.status} />
                    </div>
                    <h3 className="text-lg font-bold text-white">{req.hospital?.name}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{req.hospital?.address}, {req.hospital?.city}</span>
                      </div>
                      {req.hospital?.phone && (
                        <div className="flex items-center space-x-1">
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          <span>{req.hospital.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400">Total Biohazard Payload</span>
                    <div className="text-2xl font-black text-white font-mono">
                      {Math.round(totalKg * 10) / 10} KG
                    </div>
                    <span className="text-[11px] text-teal-400">
                      {req.wasteRecords?.length || 0} Segregated Batches
                    </span>
                  </div>
                </div>

                {/* Waste Records inside this Collection Order */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50 mb-5">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
                    Waste Items to Collect:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {req.wasteRecords?.map((w) => (
                      <div
                        key={w._id}
                        className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/40 text-xs flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono font-bold text-teal-300">{w.wasteId}</span>
                          <span className="font-bold text-white">{w.quantity} {w.unit}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {w.category?.name} • <span className="text-slate-300">{w.department}</span>
                        </div>
                        {w.bin && (
                          <div className="text-[10px] text-slate-500 mt-1 font-mono">
                            Bin: {w.bin.binId}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
                  <div className="text-xs text-slate-400">
                    Requested by: <strong className="text-slate-200">{req.requestedBy?.name}</strong> on{' '}
                    {new Date(req.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>

                  <div className="w-full sm:w-auto flex items-center space-x-3">
                    <Link
                      to={`/collections/${req.requestId}`}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
                    >
                      Audit Trail
                    </Link>
                    <div className="flex-1 sm:w-64">
                      {renderWorkflowActionButton(req)}
                    </div>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Workflow Transition Notes Modal */}
      <Modal
        isOpen={actionModal.isOpen}
        onClose={() => setActionModal({ isOpen: false, request: null, targetStatus: '', title: '' })}
        title={actionModal.title}
      >
        <form onSubmit={handleConfirmStatusChange} className="space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Updating status of <strong className="text-teal-400 font-mono">{actionModal.request?.requestId}</strong> to{' '}
            <strong className="text-white uppercase font-bold">{actionModal.targetStatus}</strong>.
            This action will be digitally signed and recorded in the immutable tracking audit log.
          </p>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Collector Verification Notes & Seal Numbers
            </label>
            <textarea
              rows="3"
              value={collectorNotes}
              onChange={(e) => setCollectorNotes(e.target.value)}
              placeholder="e.g. Verified 3 yellow bags sealed, tamper tag #TG-9821 verified, weighed 23.4 KG on portable scale"
              className="w-full px-3 py-2 text-xs rounded-xl glass-input focus:outline-none"
            />
          </div>

          <div className="mt-6 flex items-center justify-end space-x-3 pt-4 border-t border-slate-700/60">
            <button
              type="button"
              onClick={() => setActionModal({ isOpen: false, request: null, targetStatus: '', title: '' })}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 shadow-glow-teal transition-all disabled:opacity-50"
            >
              {submitting ? 'Updating...' : `Confirm: Mark ${actionModal.targetStatus}`}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CollectorAssignmentsPage;
