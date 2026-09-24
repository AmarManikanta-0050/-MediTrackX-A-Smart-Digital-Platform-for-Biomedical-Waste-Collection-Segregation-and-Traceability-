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
import { Truck, Plus, Search, ExternalLink, Calendar, CheckSquare, Square } from 'lucide-react';

const HospitalRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [availableWaste, setAvailableWaste] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });

  // Create Request Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWasteIds, setSelectedWasteIds] = useState([]);
  const [priority, setPriority] = useState('Medium');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { addToast } = useNotifications();

  const fetchRequests = async () => {
    try {
      setLoading(true);
      let query = `/collections?page=${page}&limit=10`;
      if (statusFilter) query += `&status=${statusFilter}`;

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

  const fetchAvailableWaste = async () => {
    try {
      // Fetch Logged waste records that have not been assigned to a collection request
      const res = await api.get('/waste?status=Logged&limit=50');
      if (res?.data) {
        setAvailableWaste(res.data);
      }
    } catch (err) {
      console.error('Failed to load available waste:', err.message);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [page, statusFilter]);

  const handleOpenCreateModal = () => {
    fetchAvailableWaste();
    setSelectedWasteIds([]);
    setPriority('Medium');
    setNotes('');
    setIsModalOpen(true);
  };

  const toggleSelectWaste = (id) => {
    setSelectedWasteIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllWaste = () => {
    if (selectedWasteIds.length === availableWaste.length) {
      setSelectedWasteIds([]);
    } else {
      setSelectedWasteIds(availableWaste.map((w) => w._id));
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (selectedWasteIds.length === 0) {
      addToast('Please select at least one waste record for pickup.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/collections', {
        wasteRecordIds: selectedWasteIds,
        priority,
        notes,
      });

      addToast(`Collection request ${res.data.requestId} created!`, 'success');
      setIsModalOpen(false);
      fetchRequests();
    } catch (err) {
      addToast(err.message || 'Failed to create collection request.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Waste Collection Requests</h1>
          <p className="text-xs text-slate-400 mt-1">
            Dispatch pickup requests for accumulated biomedical waste bags & containers
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 shadow-glow-teal flex items-center space-x-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Pickup Request</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center space-x-3">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-xs rounded-xl glass-input bg-navy-850 text-slate-200 focus:outline-none"
        >
          <option value="">All Request Statuses</option>
          <option value="Pending">Pending (Awaiting Admin Dispatch)</option>
          <option value="Assigned">Assigned to Collector</option>
          <option value="Accepted">Accepted by Collector</option>
          <option value="Collecting">Collecting / In Transit</option>
          <option value="Collected">Collected</option>
          <option value="Completed">Completed / Disposed</option>
        </select>
      </div>

      {/* Requests Table */}
      <GlassCard className="p-0 overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Fetching collection requests..." />
        ) : requests.length === 0 ? (
          <EmptyState
            icon={Truck}
            title="No collection requests"
            description="Create a collection request when you have logged waste ready for pickup."
            action={
              <button
                onClick={handleOpenCreateModal}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 transition-colors"
              >
                Create Pickup Request
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-700/60 text-slate-400 uppercase font-semibold bg-slate-900/40">
                <tr>
                  <th className="py-3 px-4">Request ID</th>
                  <th className="py-3 px-4">Waste Quantity</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned Collector</th>
                  <th className="py-3 px-4">Date Requested</th>
                  <th className="py-3 px-4 text-right">Traceability</th>
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
                      <td className="py-3 px-4 font-mono">
                        <span className="font-bold text-white">{Math.round(totalKg * 10) / 10} KG</span>{' '}
                        <span className="text-[11px] text-slate-400">({req.wasteRecords?.length || 0} batches)</span>
                      </td>
                      <td className="py-3 px-4">
                        <PriorityBadge priority={req.priority} />
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {req.collector ? (
                          <div>
                            <div className="font-semibold text-slate-200">{req.collector.name}</div>
                            {req.collector.phone && (
                              <div className="text-[10px] text-slate-500">{req.collector.phone}</div>
                            )}
                          </div>
                        ) : (
                          <span className="italic text-amber-400/90 font-medium">Awaiting Dispatch</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {new Date(req.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/collections/${req.requestId}`}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 transition-colors"
                        >
                          Track
                        </Link>
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

      {/* Create Pickup Request Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Biomedical Waste Collection Request"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateRequest} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Priority Classification *
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input bg-navy-850 text-slate-200 focus:outline-none"
              >
                <option value="Low">Low (Routine Pickup)</option>
                <option value="Medium">Medium (Standard Next-Day)</option>
                <option value="High">High (Same-Day / Ward Accumulation)</option>
                <option value="Urgent">Urgent (Immediate Biohazard Pickup)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Request Notes / Floor Instructions
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. ICU Isolation Ward pickup, contact Nurse station"
                className="w-full px-3 py-2 text-xs rounded-xl glass-input focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Select Logged Waste Batches ({selectedWasteIds.length} selected) *
              </label>
              {availableWaste.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectAllWaste}
                  className="text-xs text-teal-400 hover:text-teal-300 font-medium"
                >
                  {selectedWasteIds.length === availableWaste.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>

            {availableWaste.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-slate-900/60 border border-slate-700/50 text-xs text-slate-400">
                No unassigned 'Logged' waste records found. Please log waste batches before requesting pickup.
              </div>
            ) : (
              <div className="max-h-56 overflow-y-auto divide-y divide-slate-800 rounded-xl bg-slate-900/60 border border-slate-700/50 p-2 space-y-1">
                {availableWaste.map((w) => {
                  const isSelected = selectedWasteIds.includes(w._id);
                  return (
                    <div
                      key={w._id}
                      onClick={() => toggleSelectWaste(w._id)}
                      className={`flex items-center justify-between p-2.5 rounded-lg text-xs cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-teal-500/15 border border-teal-500/30 text-white'
                          : 'hover:bg-slate-800/40 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="text-teal-400">
                          {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-500" />}
                        </div>
                        <div>
                          <span className="font-mono font-bold">{w.wasteId}</span>
                          <span className="ml-2 text-slate-400 font-medium">({w.department})</span>
                          <div className="text-[11px] text-slate-500">{w.category?.name}</div>
                        </div>
                      </div>
                      <div className="font-mono font-bold text-teal-300">
                        {w.quantity} {w.unit}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-end space-x-3 pt-4 border-t border-slate-700/60">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || selectedWasteIds.length === 0}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 shadow-glow-teal transition-all disabled:opacity-50"
            >
              {submitting ? 'Submitting Request...' : `Submit Request (${selectedWasteIds.length} Batches)`}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HospitalRequestsPage;
