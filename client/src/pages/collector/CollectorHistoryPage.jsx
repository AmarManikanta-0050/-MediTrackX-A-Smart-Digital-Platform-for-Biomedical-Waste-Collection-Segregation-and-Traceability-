import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import GlassCard from '../../components/common/GlassCard';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import EmptyState from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { History, CheckCircle2, MapPin, ExternalLink, Calendar } from 'lucide-react';

const CollectorHistoryPage = () => {
  const [completedRequests, setCompletedRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await api.get('/collections?status=Completed');
        if (res?.data) {
          setCompletedRequests(res.data);
        }
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white">Disposal History & Archive</h1>
        <p className="text-xs text-slate-400 mt-1">
          Complete ledger of verified hospital biomedical waste collections and terminal handoffs
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading completed collections..." />
      ) : completedRequests.length === 0 ? (
        <EmptyState
          icon={History}
          title="No completed collections yet"
          description="Your completed and signed waste disposal orders will appear here."
        />
      ) : (
        <div className="space-y-4">
          {completedRequests.map((req) => {
            const totalKg = req.wasteRecords?.reduce((sum, w) => sum + (w.quantity || 0), 0) || 0;

            return (
              <GlassCard key={req._id} className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center space-x-2.5">
                    <span className="font-mono text-xs font-bold text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded border border-teal-500/20">
                      {req.requestId}
                    </span>
                    <StatusBadge status={req.status} />
                    <PriorityBadge priority={req.priority} />
                  </div>
                  <div className="text-xs text-slate-400">
                    Completed on:{' '}
                    <strong className="text-slate-200">
                      {req.completedAt
                        ? new Date(req.completedAt).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Verified'}
                    </strong>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">{req.hospital?.name}</h4>
                    <p className="text-slate-400">{req.hospital?.address}, {req.hospital?.city}</p>
                    {req.collectorNotes && (
                      <p className="mt-2 text-[11px] text-teal-300 bg-slate-900/60 p-2 rounded-lg border border-slate-700/40">
                        Notes: {req.collectorNotes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-6 text-right sm:self-center">
                    <div>
                      <span className="text-[11px] text-slate-400">Total Disposed</span>
                      <div className="font-mono font-bold text-base text-white">
                        {Math.round(totalKg * 10) / 10} KG
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {req.wasteRecords?.length || 0} batches
                      </span>
                    </div>

                    <Link
                      to={`/collections/${req.requestId}`}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 transition-colors flex items-center space-x-1"
                    >
                      <span>Audit Trail</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
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

export default CollectorHistoryPage;
