import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import GlassCard from '../../components/common/GlassCard';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useNotifications } from '../../context/NotificationContext';
import { Truck, Search, UserCheck, ArrowRight, ExternalLink, Calendar } from 'lucide-react';

const CollectionRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });

  // Assign Collector Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedCollectorId, setSelectedCollectorId] = useState('');
  const [assignPriority, setAssignPriority] = useState('Medium');
  const [assigning, setAssigning] = useState(false);

  const { addToast } = useNotifications();

  const fetchCollectors = async () => {
    try {
      const res = await api.get('/users/collectors');
      if (res?.data) {
        setCollectors(res.data);
        if (res.data.length > 0) setSelectedCollectorId(res.data[0]._id);
      }
    } catch (err) {
      console.error('Failed to load collectors:', err.message);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      let query = `/collections?page=${page}&limit=10&search=${encodeURIComponent(search)}`;
      if (statusFilter) query += `&status=${statusFilter}`;
      if (priorityFilter) query += `&priority=${priorityFilter}`;

      const res = await api.get(query);
      if (res?.data) {
        setRequests(res.data);
        if (res.meta) setPagination(res.meta);
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollectors();
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [page, statusFilter, priorityFilter, search]);

  const handleOpenAssignModal = (request) => {
    setSelectedRequest(request);
    setAssignPriority(request.priority || 'Medium');
    if (request.collector?._id) {
      setSelectedCollectorId(request.collector._id);
    } else if (collectors.length > 0) {
      setSelectedCollectorId(collectors[0]._id);
    }
    setIsAssignModalOpen(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRequest || !selectedCollectorId) return;

    try {
      setAssigning(true);
      await api.put(`/collections/${selectedRequest._id}/assign`, {
        collectorId: selectedCollectorId,
        priority: assignPriority,
      });

      addToast(`Collector dispatched for request ${selectedRequest.requestId}!`, 'success');
      setIsAssignModalOpen(false);
      fetchRequests();
    } catch (err) {
      addToast(err.message || 'Failed to assign collector.', 'error');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Collection Operations</h1>
          <p className="text-xs text-slate-400 mt-1">
            Dispatch collectors, monitor active biomedical pickups & verify custody handoffs
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search Request ID (CR-...)..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl glass-input placeholder-slate-500 focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-xs rounded-xl glass-input bg-navy-850 text-slate-200 focus:outline-none"
        >
          <option value="">All Workflow Statuses</option>
          <option value="Pending">Pending (Needs Collector)</option>
          <option value="Assigned">Assigned</option>
          <option value="Accepted">Accepted by Collector</option>
          <option value="Collecting">Collecting / Transit</option>
          <option value="Collected">Collected</option>
          <option value="Completed">Completed & Disposed</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => {
            setPriorityFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-xs rounded-xl glass-input bg-navy-850 text-slate-200 focus:outline-none"
        >
          <option value="">All Priorities</option>
          <option value="Urgent">Urgent</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {/* Requests Ledger */}
      <GlassCard className="p-0 overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Loading collection requests..." />
        ) : requests.length === 0 ? (
          <EmptyState
            icon={Truck}
            title="No collection requests found"
            description="All scheduled biomedical waste has been picked up or none have been submitted."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-700/60 text-slate-400 uppercase font-semibold bg-slate-900/40">
                <tr>
                  <th className="py-3 px-4">Request ID</th>
                  <th className="py-3 px-4">Facility</th>
                  <th className="py-3 px-4">Waste Quantity</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned Collector</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {requests.map((req) => {
                  const totalKg = req.wasteRecords?.reduce((sum, w) => sum + (w.quantity || 0), 0) || 0;

                  return (
                    <tr key={req._id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-teal-400">
                        <Link to={`/collections/${req.requestId}`} className="hover:underline flex items-center space-x-1">
                          <span>{req.requestId}</span>
                          <ExternalLink className="w-3 h-3 text-slate-500" />
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-white font-medium">
                        {req.hospital?.name || 'N/A'}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        <span className="font-bold text-white">{Math.round(totalKg * 10) / 10} KG</span>{' '}
                        <span className="text-[11px] text-slate-500">({req.wasteRecords?.length || 0} batches)</span>
                      </td>
                      <td className="py-3 px-4">
                        <PriorityBadge priority={req.priority} />
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {req.collector ? (
                          <div className="flex items-center space-x-1.5">
                            <span className="font-medium text-slate-200">{req.collector.name}</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenAssignModal(req)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-all flex items-center space-x-1"
                          >
                            <UserCheck className="w-3 h-3" />
                            <span>Assign Collector</span>
                          </button>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {new Date(req.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {req.status === 'Pending' && (
                            <button
                              onClick={() => handleOpenAssignModal(req)}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white shadow-glow-teal transition-all"
                            >
                              Dispatch
                            </button>
                          )}
                          <Link
                            to={`/collections/${req.requestId}`}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 transition-colors"
                          >
                            Details
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          onPageChange={(p) => setPage(p)}
        />
      </GlassCard>

      {/* Assign Collector Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={`Assign Collector to Request ${selectedRequest?.requestId}`}
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Healthcare Facility
            </label>
            <p className="text-sm font-bold text-white bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
              {selectedRequest?.hospital?.name}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Select Waste Collector *
            </label>
            {collectors.length === 0 ? (
              <p className="text-xs text-rose-400">No active collectors available in the system.</p>
            ) : (
              <select
                required
                value={selectedCollectorId}
                onChange={(e) => setSelectedCollectorId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input bg-navy-850 text-slate-200 focus:outline-none"
              >
                {collectors.map((col) => (
                  <option key={col._id} value={col._id} className="bg-navy-900 text-white">
                    {col.name} ({col.email}) - {col.phone || 'No phone'}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Priority Classification
            </label>
            <select
              value={assignPriority}
              onChange={(e) => setAssignPriority(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl glass-input bg-navy-850 text-slate-200 focus:outline-none"
            >
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
              <option value="Urgent">Urgent / Immediate Biohazard Pickup</option>
            </select>
          </div>

          <div className="mt-6 flex items-center justify-end space-x-3 pt-4 border-t border-slate-700/60">
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={assigning || collectors.length === 0}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 shadow-glow-teal transition-all disabled:opacity-50"
            >
              {assigning ? 'Dispatching...' : 'Dispatch Collector'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CollectionRequestsPage;
