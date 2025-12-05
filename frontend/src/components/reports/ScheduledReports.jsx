import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Clock, Mail } from 'lucide-react';
import api from '../../services/api';
import Modal from '../Modal';
import Toast from '../Toast';

function ScheduledReports() {
  const [scheduledReports, setScheduledReports] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    templateId: '',
    scheduleName: '',
    scheduleFrequency: 'DAILY',
    scheduleTime: '09:00',
    scheduleDayOfWeek: '',
    scheduleDayOfMonth: '',
    isActive: true
  });

  useEffect(() => {
    fetchScheduledReports();
    fetchTemplates();
  }, []);

  const fetchScheduledReports = async () => {
    try {
      const response = await api.get('/reports/scheduled');
      setScheduledReports(response.data);
    } catch (error) {
      setToast({ message: 'Error fetching scheduled reports', type: 'error' });
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/reports/templates/active');
      setTemplates(response.data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        template: { id: parseInt(formData.templateId) },
        scheduleDayOfWeek: formData.scheduleDayOfWeek ? parseInt(formData.scheduleDayOfWeek) : null,
        scheduleDayOfMonth: formData.scheduleDayOfMonth ? parseInt(formData.scheduleDayOfMonth) : null
      };

      await api.post('/reports/scheduled', payload);
      setToast({ message: 'Scheduled report created successfully', type: 'success' });
      fetchScheduledReports();
      handleCloseModal();
    } catch (error) {
      setToast({ message: 'Error creating scheduled report', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this scheduled report?')) return;
    
    try {
      await api.delete(`/reports/scheduled/${id}`);
      setToast({ message: 'Scheduled report deleted successfully', type: 'success' });
      fetchScheduledReports();
    } catch (error) {
      setToast({ message: 'Error deleting scheduled report', type: 'error' });
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      templateId: '',
      scheduleName: '',
      scheduleFrequency: 'DAILY',
      scheduleTime: '09:00',
      scheduleDayOfWeek: '',
      scheduleDayOfMonth: '',
      isActive: true
    });
  };

  const getFrequencyDisplay = (report) => {
    let display = report.scheduleFrequency;
    if (report.scheduleFrequency === 'WEEKLY' && report.scheduleDayOfWeek !== null) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      display += ` (${days[report.scheduleDayOfWeek]})`;
    }
    if (report.scheduleFrequency === 'MONTHLY' && report.scheduleDayOfMonth !== null) {
      display += ` (Day ${report.scheduleDayOfMonth})`;
    }
    return display;
  };

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Scheduled Reports</h2>
          <p className="text-gray-600">Automate report generation and delivery</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Schedule Report
        </button>
      </div>

      {/* Scheduled Reports List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Schedule Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Template</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frequency</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {scheduledReports.map((report) => (
              <tr key={report.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">{report.scheduleName}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {report.template?.templateName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {getFrequencyDisplay(report)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {report.scheduleTime}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded ${report.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {report.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleDelete(report.id)}
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

      {scheduledReports.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No scheduled reports yet. Create your first scheduled report to automate report generation.</p>
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title="Schedule Report"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Template</label>
            <select
              value={formData.templateId}
              onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="">Select Template</option>
              {templates.map(template => (
                <option key={template.id} value={template.id}>{template.templateName}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
              <select
                value={formData.scheduleFrequency}
                onChange={(e) => setFormData({ ...formData, scheduleFrequency: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input
                type="time"
                value={formData.scheduleTime}
                onChange={(e) => setFormData({ ...formData, scheduleTime: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
          </div>

          {formData.scheduleFrequency === 'WEEKLY' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Day of Week</label>
              <select
                value={formData.scheduleDayOfWeek}
                onChange={(e) => setFormData({ ...formData, scheduleDayOfWeek: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select Day</option>
                <option value="0">Sunday</option>
                <option value="1">Monday</option>
                <option value="2">Tuesday</option>
                <option value="3">Wednesday</option>
                <option value="4">Thursday</option>
                <option value="5">Friday</option>
                <option value="6">Saturday</option>
              </select>
            </div>
          )}

          {formData.scheduleFrequency === 'MONTHLY' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Day of Month</label>
              <input
                type="number"
                min="1"
                max="31"
                value={formData.scheduleDayOfMonth}
                onChange={(e) => setFormData({ ...formData, scheduleDayOfMonth: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="1-31"
              />
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
              Schedule
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ScheduledReports;
