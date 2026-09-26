import React, { useState, useEffect } from 'react';
import { robotService } from '../../services/robotService';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import GlassCard from '../../components/common/GlassCard';
import StatCard from '../../components/common/StatCard';
import ProgressBar from '../../components/common/ProgressBar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import PriorityBadge from '../../components/common/PriorityBadge';
import {
  Bot,
  BatteryCharging,
  Layers,
  Send,
  CheckCircle2,
  Clock,
  ArrowRight,
  Shield,
  RefreshCw,
  Plus,
  Play,
  RotateCcw,
} from 'lucide-react';

const MISSION_STAGES = [
  'Queued',
  'En Route to Ward',
  'Docking & Loading',
  'In Transit to Bay',
  'Completed',
];

const RobotDispatchPage = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [loading, setLoading] = useState(true);
  const [fleet, setFleet] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState(null);

  // Dispatch Modal
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [dispatchForm, setDispatchForm] = useState({
    robotId: 'AMR-MEDIBOT-01',
    ward: 'ICU Ward 3B',
    department: 'Intensive Care Unit (ICU)',
    floor: 'Floor 2',
    binId: 'BIN-101',
    destinationBay: 'Central Biohazard Staging Bay A',
    priority: 'High',
    payloadWeightKg: '25.0',
  });
  const [dispatching, setDispatching] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000); // 8s auto-refresh
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [fleetRes, tasksRes] = await Promise.all([
        robotService.getFleet(),
        robotService.getTasks(),
      ]);

      if (fleetRes.success) setFleet(fleetRes.data);
      if (tasksRes.success) {
        setTasks(tasksRes.data);
        setSummary(tasksRes.summary);
      }
    } catch (err) {
      console.error('Failed to load AMR data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdvanceStatus = async (taskId, currentStatus) => {
    const currentIndex = MISSION_STAGES.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex >= MISSION_STAGES.length - 1) return;

    const nextStatus = MISSION_STAGES[currentIndex + 1];
    try {
      const res = await robotService.updateStatus(taskId, nextStatus);
      if (res.success) {
        showSuccess(`Mission ${res.data.taskId} progressed to "${nextStatus}"`);
        await fetchData();
      }
    } catch (err) {
      showError(err.message || 'Failed to update mission status');
    }
  };

  const handleDispatchSubmit = async (e) => {
    e.preventDefault();
    try {
      setDispatching(true);
      const res = await robotService.dispatchTask({
        ...dispatchForm,
        hospitalId: user?.hospital?._id || user?.hospital,
      });

      if (res.success) {
        showSuccess(`AMR mission ${res.data.taskId} dispatched successfully!`);
        setIsDispatchModalOpen(false);
        await fetchData();
      }
    } catch (err) {
      showError(err.message || 'Mission dispatch failed');
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
              Future Work Module 4
            </span>
            <span className="text-xs text-slate-500">ROS 2 / SLAM Navigation</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1 flex items-center space-x-2">
            <Bot className="w-6 h-6 text-purple-400" />
            <span>Autonomous Hospital Mobile Robot (AMR) Dispatching</span>
          </h1>
          <p className="text-sm text-slate-500">
            Automated internal hospital transfer of hazardous biomedical bins from ICUs and OTs to central decontamination bays.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsDispatchModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-navy-950 font-bold text-xs shadow-sm transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Dispatch AMR Mission</span>
          </button>
          <button
            onClick={fetchData}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Robot Units"
          value={fleet.length || 3}
          subtitle="All SLAM nodes operational"
          icon={Bot}
          color="purple"
        />
        <StatCard
          title="In-Flight Missions"
          value={summary?.activeTasks || 2}
          subtitle="Docking & Autonomous Transit"
          icon={Send}
          color="blue"
        />
        <StatCard
          title="Completed Missions"
          value={summary?.completedTasks || 1}
          subtitle="Zero collision incidents"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Docking Bay Status"
          value="4 Bays Online"
          subtitle="Inductive wireless fast charging"
          icon={BatteryCharging}
          color="teal"
        />
      </div>

      {/* Robot Hardware Status Fleet Cards */}
      <div>
        <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
          <Bot className="w-4 h-4 text-purple-400" />
          <span>Operational AMR Fleet Telemetry</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {fleet.map((robot) => {
            const isCharging = robot.status === 'Charging';
            return (
              <GlassCard key={robot.robotId} className="p-5 border border-slate-800">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-purple-400">
                      {robot.robotId}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">{robot.name}</h3>
                    <p className="text-[11px] text-slate-500">{robot.model}</p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      isCharging
                        ? 'bg-amber-500/20 text-amber-600 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/30'
                    }`}
                  >
                    {robot.status}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span className="text-slate-500">Current Position:</span>
                    <span className="font-semibold text-slate-700">{robot.floor}</span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span className="text-slate-500">Payload Load:</span>
                    <span className="font-mono font-bold text-teal-700">
                      {robot.currentPayloadKg} / {robot.maxPayloadKg} KG
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span className="text-slate-500">Battery Level:</span>
                    <span className="font-mono font-bold text-emerald-600">{robot.batteryLevel}%</span>
                  </div>
                  <ProgressBar value={robot.batteryLevel} color="emerald" height="h-1.5" />

                  <div className="pt-2 text-[10px] text-slate-500 border-t border-slate-800 flex items-center space-x-1">
                    <Shield className="w-3 h-3 text-teal-600" />
                    <span>LIDAR: {robot.lidarStatus}</span>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* AMR Mission Queue Table */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-bold text-slate-900 tracking-wide">
              Active Hospital Transfer Mission Queue
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-400">
              {tasks.length} Missions
            </span>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner size="md" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/60 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Mission ID</th>
                  <th className="py-3 px-4">Robot Unit</th>
                  <th className="py-3 px-4">Pickup Ward</th>
                  <th className="py-3 px-4">Destination Bay</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Payload</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4 text-right">Step Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {tasks.map((task) => {
                  const isCompleted = task.status === 'Completed';
                  return (
                    <tr key={task._id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {task.taskId}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-purple-300">
                        {task.robotId}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-700">{task.pickupLocation?.ward}</div>
                        <div className="text-[10px] text-slate-500">
                          {task.pickupLocation?.department}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {task.destinationBay}
                      </td>
                      <td className="py-3.5 px-4">
                        <PriorityBadge priority={task.priority} />
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {task.payloadWeightKg} KG
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isCompleted
                              ? 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/30'
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}
                        >
                          {task.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {!isCompleted ? (
                          <button
                            onClick={() => handleAdvanceStatus(task._id, task.status)}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-700 text-teal-700 hover:text-navy-950 font-bold border border-teal-500/30 transition-all text-[11px]"
                          >
                            <span>Advance Stage</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-600 font-semibold flex items-center justify-end space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Done</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* Dispatch Modal */}
      <Modal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        title="Dispatch Autonomous Mobile Robot (AMR)"
      >
        <form onSubmit={handleDispatchSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Robot Unit</label>
              <select
                value={dispatchForm.robotId}
                onChange={(e) => setDispatchForm({ ...dispatchForm, robotId: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-900"
              >
                <option value="AMR-MEDIBOT-01">AMR-MEDIBOT-01 (Floor 2 ICU)</option>
                <option value="AMR-MEDIBOT-02">AMR-MEDIBOT-02 (Central Dock 1)</option>
                <option value="AMR-MEDIBOT-03">AMR-MEDIBOT-03 (Floor 3 OT)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Priority</label>
              <select
                value={dispatchForm.priority}
                onChange={(e) => setDispatchForm({ ...dispatchForm, priority: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-900"
              >
                <option value="Routine">Routine</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Pickup Ward</label>
              <input
                type="text"
                required
                value={dispatchForm.ward}
                onChange={(e) => setDispatchForm({ ...dispatchForm, ward: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Department</label>
              <input
                type="text"
                required
                value={dispatchForm.department}
                onChange={(e) => setDispatchForm({ ...dispatchForm, department: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Destination Bay</label>
              <input
                type="text"
                required
                value={dispatchForm.destinationBay}
                onChange={(e) => setDispatchForm({ ...dispatchForm, destinationBay: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Payload (KG)</label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="100"
                required
                value={dispatchForm.payloadWeightKg}
                onChange={(e) =>
                  setDispatchForm({ ...dispatchForm, payloadWeightKg: e.target.value })
                }
                className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-900"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={() => setIsDispatchModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-500 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={dispatching}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-purple-500 hover:bg-purple-400 text-navy-950 disabled:opacity-50"
            >
              {dispatching ? 'Dispatching...' : 'Dispatch AMR Unit'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RobotDispatchPage;
