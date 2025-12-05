import { useState, useEffect } from 'react';
import { Plus, Play, CheckCircle, Edit2, Filter } from 'lucide-react';
import api from '../../services/api';
import Modal from '../Modal';
import Toast from '../Toast';

function TaskChecklist() {
  const [tasks, setTasks] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [completingTask, setCompletingTask] = useState(null);
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [completeData, setCompleteData] = useState({
    actualDuration: '',
    notes: ''
  });
  const [formData, setFormData] = useState({
    equipmentId: '',
    taskTitle: '',
    description: '',
    assignedToId: '',
    priority: 'MEDIUM',
    scheduledDate: '',
    status: 'PENDING'
  });

  useEffect(() => {
    fetchTasks();
    fetchEquipment();
    fetchUsers();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/maintenance/tasks');
      setTasks(response.data);
    } catch (error) {
      setToast({ message: 'Error fetching tasks', type: 'error' });
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

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        equipment: { id: parseInt(formData.equipmentId) },
        assignedTo: formData.assignedToId ? { id: parseInt(formData.assignedToId) } : null
      };

      if (editingTask) {
        await api.put(`/maintenance/tasks/${editingTask.id}`, payload);
        setToast({ message: 'Task updated successfully', type: 'success' });
      } else {
        await api.post('/maintenance/tasks', payload);
        setToast({ message: 'Task created successfully', type: 'success' });
      }

      fetchTasks();
      handleCloseModal();
    } catch (error) {
      setToast({ message: 'Error saving task', type: 'error' });
    }
  };

  const handleStartTask = async (taskId) => {
    try {
      await api.put(`/maintenance/tasks/${taskId}/start`);
      setToast({ message: 'Task started', type: 'success' });
      fetchTasks();
    } catch (error) {
      setToast({ message: 'Error starting task', type: 'error' });
    }
  };

  const handleCompleteTask = async () => {
    try {
      await api.put(
        `/maintenance/tasks/${completingTask.id}/complete`,
        null,
        {
          params: {
            actualDuration: completeData.actualDuration || null,
            notes: completeData.notes || null
          }
        }
      );
      setToast({ message: 'Task completed', type: 'success' });
      fetchTasks();
      setShowCompleteModal(false);
      setCompletingTask(null);
      setCompleteData({ actualDuration: '', notes: '' });
    } catch (error) {
      setToast({ message: 'Error completing task', type: 'error' });
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      equipmentId: task.equipmentId,
      taskTitle: task.taskTitle,
      description: task.description || '',
      assignedToId: task.assignedToId || '',
      priority: task.priority,
      scheduledDate: task.scheduledDate?.split('T')[0] || '',
      status: task.status
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTask(null);
    setFormData({
      equipmentId: '',
      taskTitle: '',
      description: '',
      assignedToId: '',
      priority: 'MEDIUM',
      scheduledDate: '',
      status: 'PENDING'
    });
  };

  const getStatusBadge = (status) => {
    const colors = {
      PENDING: 'bg-gray-100 text-gray-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      HIGH: 'bg-red-100 text-red-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      LOW: 'bg-green-100 text-green-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'ALL') return true;
    return task.status === filter;
  });

  const taskStats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'PENDING').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    completed: tasks.filter(t => t.status === 'COMPLETED').length
  };

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Maintenance Task Checklist</h2>
          <p className="text-gray-600">Track and manage maintenance tasks</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-gray-900">{taskStats.total}</div>
          <div className="text-sm text-gray-600">Total Tasks</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-gray-600">{taskStats.pending}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">{taskStats.completed}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-4 flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-600" />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="ALL">All Tasks</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scheduled</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTasks.map((task) => (
              <tr key={task.id}>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{task.taskTitle}</div>
                  <div className="text-sm text-gray-500">{task.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{task.equipmentName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{task.assignedToName || 'Unassigned'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(task.scheduledDate).toLocaleDateString()}
                  </div>
                  {task.startedAt && (
                    <div className="text-xs text-gray-500">
                      Started: {new Date(task.startedAt).toLocaleString()}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded ${getPriorityBadge(task.priority)}`}>
                    {task.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded ${getStatusBadge(task.status)}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex gap-2">
                    {task.status === 'PENDING' && (
                      <button
                        onClick={() => handleStartTask(task.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Start Task"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )}
                    {task.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => {
                          setCompletingTask(task);
                          setShowCompleteModal(true);
                        }}
                        className="text-green-600 hover:text-green-900"
                        title="Complete Task"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    {task.status !== 'COMPLETED' && (
                      <button
                        onClick={() => handleEdit(task)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Edit Task"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingTask ? 'Edit Task' : 'Create Task'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Equipment</label>
            <select
              value={formData.equipmentId}
              onChange={(e) => setFormData({ ...formData, equipmentId: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="">Select Equipment</option>
              {equipment.map(eq => (
                <option key={eq.id} value={eq.id}>{eq.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
            <input
              type="text"
              value={formData.taskTitle}
              onChange={(e) => setFormData({ ...formData, taskTitle: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border rounded px-3 py-2"
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
            <select
              value={formData.assignedToId}
              onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Unassigned</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.fullName}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
              <input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

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
              {editingTask ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Complete Task Modal */}
      <Modal
        isOpen={showCompleteModal}
        onClose={() => {
          setShowCompleteModal(false);
          setCompletingTask(null);
          setCompleteData({ actualDuration: '', notes: '' });
        }}
        title="Complete Task"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Actual Duration (minutes)</label>
            <input
              type="number"
              value={completeData.actualDuration}
              onChange={(e) => setCompleteData({ ...completeData, actualDuration: e.target.value })}
              className="w-full border rounded px-3 py-2"
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Completion Notes</label>
            <textarea
              value={completeData.notes}
              onChange={(e) => setCompleteData({ ...completeData, notes: e.target.value })}
              className="w-full border rounded px-3 py-2"
              rows="4"
              placeholder="Optional notes about the completed task"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              onClick={() => {
                setShowCompleteModal(false);
                setCompletingTask(null);
                setCompleteData({ actualDuration: '', notes: '' });
              }}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCompleteTask}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Complete Task
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default TaskChecklist;
