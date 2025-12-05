import { useState, useEffect } from 'react';
import { Plus, DollarSign, TrendingUp } from 'lucide-react';
import api from '../../services/api';
import Modal from '../Modal';
import Toast from '../Toast';

function CostTracking() {
  const [tasks, setTasks] = useState([]);
  const [costs, setCosts] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    taskId: '',
    costType: 'LABOR',
    description: '',
    amount: '',
    quantity: 1
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/maintenance/tasks');
      setTasks(response.data.filter(t => t.status === 'COMPLETED' || t.status === 'IN_PROGRESS'));
    } catch (error) {
      setToast({ message: 'Error fetching tasks', type: 'error' });
    }
  };

  const fetchCostsForTask = async (taskId) => {
    try {
      const response = await api.get(`/maintenance/costs/task/${taskId}`);
      setCosts(response.data);
    } catch (error) {
      setToast({ message: 'Error fetching costs', type: 'error' });
    }
  };

  const handleTaskSelect = (taskId) => {
    setSelectedTask(taskId);
    if (taskId) {
      fetchCostsForTask(taskId);
    } else {
      setCosts([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        task: { id: parseInt(formData.taskId) },
        costType: formData.costType,
        description: formData.description,
        amount: parseFloat(formData.amount),
        quantity: parseInt(formData.quantity)
      };

      await api.post('/maintenance/costs', payload);
      setToast({ message: 'Cost added successfully', type: 'success' });
      
      if (selectedTask) {
        fetchCostsForTask(selectedTask);
      }
      handleCloseModal();
    } catch (error) {
      setToast({ message: 'Error adding cost', type: 'error' });
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      taskId: selectedTask || '',
      costType: 'LABOR',
      description: '',
      amount: '',
      quantity: 1
    });
  };

  const getTotalCost = () => {
    return costs.reduce((sum, cost) => sum + (cost.amount * cost.quantity), 0);
  };

  const getCostsByType = () => {
    const byType = {};
    costs.forEach(cost => {
      if (!byType[cost.costType]) {
        byType[cost.costType] = 0;
      }
      byType[cost.costType] += cost.amount * cost.quantity;
    });
    return byType;
  };

  const costsByType = getCostsByType();

  const getCostTypeBadge = (type) => {
    const colors = {
      LABOR: 'bg-blue-100 text-blue-800',
      PARTS: 'bg-green-100 text-green-800',
      MATERIALS: 'bg-yellow-100 text-yellow-800',
      EXTERNAL_SERVICE: 'bg-purple-100 text-purple-800',
      OTHER: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Maintenance Cost Tracking</h2>
          <p className="text-gray-600">Track costs associated with maintenance tasks</p>
        </div>
        <button
          onClick={() => {
            setFormData({ ...formData, taskId: selectedTask || '' });
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={!selectedTask}
        >
          <Plus className="w-4 h-4" />
          Add Cost
        </button>
      </div>

      {/* Task Selection */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Task</label>
        <select
          value={selectedTask || ''}
          onChange={(e) => handleTaskSelect(e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">Select a task to view costs</option>
          {tasks.map(task => (
            <option key={task.id} value={task.id}>
              {task.taskTitle} - {task.equipmentName} ({task.status})
            </option>
          ))}
        </select>
      </div>

      {selectedTask && (
        <>
          {/* Cost Summary Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">${getTotalCost().toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Total Cost</div>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </div>

            {Object.entries(costsByType).map(([type, amount]) => (
              <div key={type} className="bg-white p-4 rounded-lg shadow">
                <div className="text-lg font-bold text-gray-900">${amount.toFixed(2)}</div>
                <div className="text-sm text-gray-600">{type.replace('_', ' ')}</div>
              </div>
            ))}
          </div>

          {/* Cost Breakdown */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">Cost Breakdown</h3>
            </div>

            {costs.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {costs.map((cost) => (
                    <tr key={cost.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded ${getCostTypeBadge(cost.costType)}`}>
                          {cost.costType.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{cost.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{cost.quantity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${cost.amount.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${(cost.amount * cost.quantity).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(cost.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-right font-semibold">
                      Total Cost:
                    </td>
                    <td className="px-6 py-4 font-bold text-lg">
                      ${getTotalCost().toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            ) : (
              <div className="p-8 text-center text-gray-500">
                No costs recorded for this task yet
              </div>
            )}
          </div>
        </>
      )}

      {!selectedTask && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Task Selected</h3>
          <p className="text-gray-600">Select a task above to view and manage its costs</p>
        </div>
      )}

      {/* Add Cost Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title="Add Cost"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Task</label>
            <select
              value={formData.taskId}
              onChange={(e) => setFormData({ ...formData, taskId: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="">Select Task</option>
              {tasks.map(task => (
                <option key={task.id} value={task.id}>
                  {task.taskTitle} - {task.equipmentName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cost Type</label>
            <select
              value={formData.costType}
              onChange={(e) => setFormData({ ...formData, costType: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="LABOR">Labor</option>
              <option value="PARTS">Parts</option>
              <option value="MATERIALS">Materials</option>
              <option value="EXTERNAL_SERVICE">External Service</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border rounded px-3 py-2"
              rows="3"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full border rounded px-3 py-2"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit Amount ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
          </div>

          {formData.amount && formData.quantity && (
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-sm text-gray-600">Total Cost</div>
              <div className="text-2xl font-bold text-gray-900">
                ${(parseFloat(formData.amount) * parseInt(formData.quantity)).toFixed(2)}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Cost
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default CostTracking;
