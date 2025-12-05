import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import Modal from '../Modal';
import Toast from '../Toast';

function PreventiveScheduler() {
  const [schedules, setSchedules] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    equipmentId: '',
    scheduleName: '',
    description: '',
    frequency: 'DAILY',
    frequencyValue: 1,
    nextMaintenanceDate: '',
    estimatedDurationMinutes: 60,
    priority: 'MEDIUM',
    isActive: true
  });

  useEffect(() => {
    fetchSchedules();
    fetchEquipment();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await api.get('/maintenance/schedules');
      setSchedules(response.data);
    } catch (error) {
      setToast({ message: 'Error fetching schedules', type: 'error' });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        equipment: { id: parseInt(formData.equipmentId) }
      };

      if (editingSchedule) {
        await api.put(`/maintenance/schedules/${editingSchedule.id}`, payload);
        setToast({ message: 'Schedule updated successfully', type: 'success' });
      } else {
        await api.post('/maintenance/schedules', payload);
        setToast({ message: 'Schedule created successfully', type: 'success' });
      }

      fetchSchedules();
      handleCloseModal();
    } catch (error) {
      setToast({ message: 'Error saving schedule', type: 'error' });
    }
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      equipmentId: schedule.equipmentId,
      scheduleName: schedule.scheduleName,
      description: schedule.description || '',
      frequency: schedule.frequency,
      frequencyValue: schedule.frequencyValue,
      nextMaintenanceDate: schedule.nextMaintenanceDate?.split('T')[0] || '',
      estimatedDurationMinutes: schedule.estimatedDurationMinutes,
      priority: schedule.priority,
      isActive: schedule.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;
    
    try {
      await api.delete(`/maintenance/schedules/${id}`);
      setToast({ message: 'Schedule deleted successfully', type: 'success' });
      fetchSchedules();
    } catch (error) {
      setToast({ message: 'Error deleting schedule', type: 'error' });
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSchedule(null);
    setFormData({
      equipmentId: '',
      scheduleName: '',
      description: '',
      frequency: 'DAILY',
      frequencyValue: 1,
      nextMaintenanceDate: '',
      estimatedDurationMinutes: 60,
      priority: 'MEDIUM',
      isActive: true
    });
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      HIGH: 'bg-red-100 text-red-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      LOW: 'bg-green-100 text-green-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const isUpcoming = (date) => {
    const nextDate = new Date(date);
    const today = new Date();
    const diffDays = Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  };

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Preventive Maintenance Schedules</h2>
          <p className="text-gray-600">Manage recurring maintenance schedules</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          New Schedule
        </button>
      </div>

      {/* Upcoming Alerts */}
      {schedules.filter(s => isUpcoming(s.nextMaintenanceDate)).length > 0 && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-800">Upcoming Maintenance</h3>
              <p className="text-sm text-yellow-700">
                {schedules.filter(s => isUpcoming(s.nextMaintenanceDate)).length} maintenance schedule(s) due within 7 days
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Schedules List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Schedule Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frequency</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Maintenance</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {schedules.map((schedule) => (
              <tr key={schedule.id} className={isUpcoming(schedule.nextMaintenanceDate) ? 'bg-yellow-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{schedule.equipmentName}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{schedule.scheduleName}</div>
                  <div className="text-sm text-gray-500">{schedule.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    Every {schedule.frequencyValue} {schedule.frequency.toLowerCase()}
                  </div>
                  <div className="text-sm text-gray-500">{schedule.estimatedDurationMinutes} min</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(schedule.nextMaintenanceDate).toLocaleDateString()}
                  </div>
                  {schedule.lastMaintenanceDate && (
                    <div className="text-sm text-gray-500">
                      Last: {new Date(schedule.lastMaintenanceDate).toLocaleDateString()}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded ${getPriorityBadge(schedule.priority)}`}>
                    {schedule.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded ${schedule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {schedule.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleEdit(schedule)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(schedule.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
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
        title={editingSchedule ? 'Edit Schedule' : 'Create Schedule'}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Name</label>
            <input
              type="text"
              value={formData.scheduleName}
              onChange={(e) => setFormData({ ...formData, scheduleName: e.target.value })}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Every</label>
              <input
                type="number"
                value={formData.frequencyValue}
                onChange={(e) => setFormData({ ...formData, frequencyValue: parseInt(e.target.value) })}
                className="w-full border rounded px-3 py-2"
                min="1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Next Maintenance Date</label>
              <input
                type="date"
                value={formData.nextMaintenanceDate}
                onChange={(e) => setFormData({ ...formData, nextMaintenanceDate: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
              <input
                type="number"
                value={formData.estimatedDurationMinutes}
                onChange={(e) => setFormData({ ...formData, estimatedDurationMinutes: parseInt(e.target.value) })}
                className="w-full border rounded px-3 py-2"
                min="1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
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
              {editingSchedule ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default PreventiveScheduler;
