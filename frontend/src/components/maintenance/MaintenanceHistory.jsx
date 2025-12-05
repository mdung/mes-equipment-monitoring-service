import { useState, useEffect } from 'react';
import { History, Download, Filter } from 'lucide-react';
import api from '../../services/api';
import Toast from '../Toast';

function MaintenanceHistory() {
  const [tasks, setTasks] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [toast, setToast] = useState(null);
  const [expandedTask, setExpandedTask] = useState(null);

  useEffect(() => {
    fetchTasks();
    fetchEquipment();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/maintenance/tasks');
      setTasks(response.data.filter(t => t.status === 'COMPLETED'));
    } catch (error) {
      setToast({ message: 'Error fetching maintenance history', type: 'error' });
    }
  };

  const fetchEquipment = async () => {
    try {
      const response = await api.get('/equipment');
      setEquipment(response.data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    }
  };

  const fetchCostsForTask = async (taskId) => {
    try {
      const response = await api.get(`/maintenance/costs/task/${taskId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching costs:', error);
      return [];
    }
  };

  const handleTaskExpand = async (taskId) => {
    if (expandedTask === taskId) {
      setExpandedTask(null);
    } else {
      setExpandedTask(taskId);
      const costs = await fetchCostsForTask(taskId);
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, costs } : task
      ));
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (selectedEquipment && task.equipmentId !== parseInt(selectedEquipment)) {
      return false;
    }
    if (dateRange.start && new Date(task.completedAt) < new Date(dateRange.start)) {
      return false;
    }
    if (dateRange.end && new Date(task.completedAt) > new Date(dateRange.end)) {
      return false;
    }
    return true;
  });

  const getTotalCost = (costs) => {
    if (!costs) return 0;
    return costs.reduce((sum, cost) => sum + (cost.amount * cost.quantity), 0);
  };

  const getAverageDuration = () => {
    const tasksWithDuration = filteredTasks.filter(t => t.actualDurationMinutes);
    if (tasksWithDuration.length === 0) return 0;
    const total = tasksWithDuration.reduce((sum, t) => sum + t.actualDurationMinutes, 0);
    return Math.round(total / tasksWithDuration.length);
  };

  const getTotalMaintenanceCost = () => {
    return filteredTasks.reduce((sum, task) => {
      return sum + getTotalCost(task.costs);
    }, 0);
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      HIGH: 'bg-red-100 text-red-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      LOW: 'bg-green-100 text-green-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Equipment Maintenance History</h2>
          <p className="text-gray-600">View completed maintenance tasks and their details</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{filteredTasks.length}</div>
              <div className="text-sm text-gray-600">Completed Tasks</div>
            </div>
            <History className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-gray-900">{getAverageDuration()} min</div>
          <div className="text-sm text-gray-600">Average Duration</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">${getTotalMaintenanceCost().toFixed(2)}</div>
          <div className="text-sm text-gray-600">Total Cost</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-600" />
          <h3 className="font-semibold">Filters</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Equipment</label>
            <select
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">All Equipment</option>
              {equipment.map(eq => (
                <option key={eq.id} value={eq.id}>{eq.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed By</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTasks.map((task) => (
              <>
                <tr 
                  key={task.id}
                  onClick={() => handleTaskExpand(task.id)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{task.taskTitle}</div>
                    <div className="text-sm text-gray-500">{task.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{task.equipmentName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{task.assignedToName || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(task.completedAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(task.completedAt).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {task.actualDurationMinutes ? `${task.actualDurationMinutes} min` : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded ${getPriorityBadge(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {task.costs ? `$${getTotalCost(task.costs).toFixed(2)}` : '-'}
                    </div>
                  </td>
                </tr>
                {expandedTask === task.id && (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 bg-gray-50">
                      <div className="space-y-3">
                        {task.notes && (
                          <div>
                            <h4 className="font-semibold text-sm mb-1">Notes:</h4>
                            <p className="text-sm text-gray-700">{task.notes}</p>
                          </div>
                        )}
                        
                        {task.costs && task.costs.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm mb-2">Cost Breakdown:</h4>
                            <table className="min-w-full text-sm">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="px-3 py-2 text-left">Type</th>
                                  <th className="px-3 py-2 text-left">Description</th>
                                  <th className="px-3 py-2 text-right">Quantity</th>
                                  <th className="px-3 py-2 text-right">Unit Price</th>
                                  <th className="px-3 py-2 text-right">Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {task.costs.map((cost, idx) => (
                                  <tr key={idx} className="border-t">
                                    <td className="px-3 py-2">{cost.costType.replace('_', ' ')}</td>
                                    <td className="px-3 py-2">{cost.description}</td>
                                    <td className="px-3 py-2 text-right">{cost.quantity}</td>
                                    <td className="px-3 py-2 text-right">${cost.amount.toFixed(2)}</td>
                                    <td className="px-3 py-2 text-right font-medium">
                                      ${(cost.amount * cost.quantity).toFixed(2)}
                                    </td>
                                  </tr>
                                ))}
                                <tr className="border-t font-semibold bg-gray-100">
                                  <td colSpan="4" className="px-3 py-2 text-right">Total:</td>
                                  <td className="px-3 py-2 text-right">
                                    ${getTotalCost(task.costs).toFixed(2)}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-semibold">Scheduled Date:</span>{' '}
                            {new Date(task.scheduledDate).toLocaleDateString()}
                          </div>
                          {task.startedAt && (
                            <div>
                              <span className="font-semibold">Started:</span>{' '}
                              {new Date(task.startedAt).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>

        {filteredTasks.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No completed maintenance tasks found
          </div>
        )}
      </div>
    </div>
  );
}

export default MaintenanceHistory;
