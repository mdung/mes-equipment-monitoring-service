import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import api from '../../services/api';
import Modal from '../Modal';
import Toast from '../Toast';

function RootCauseAnalysis() {
  const [rcas, setRcas] = useState([]);
  const [defects, setDefects] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    defectRecordId: '',
    problemStatement: '',
    why1: '',
    why2: '',
    why3: '',
    why4: '',
    why5: '',
    rootCause: '',
    correctiveAction: '',
    preventiveAction: '',
    actionOwnerId: '',
    targetCompletionDate: '',
    status: 'OPEN'
  });

  useEffect(() => {
    fetchRcas();
    fetchDefects();
    fetchUsers();
  }, []);

  const fetchRcas = async () => {
    try {
      const response = await api.get('/quality-management/rca/status/OPEN');
      setRcas(response.data);
    } catch (error) {
      console.error('Error fetching RCAs:', error);
    }
  };

  const fetchDefects = async () => {
    try {
      const response = await api.get('/quality-management/defects/recent?days=30');
      setDefects(response.data.filter(d => d.status !== 'CLOSED'));
    } catch (error) {
      console.error('Error fetching defects:', error);
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
        defectRecord: { id: parseInt(formData.defectRecordId) },
        actionOwner: formData.actionOwnerId ? { id: parseInt(formData.actionOwnerId) } : null
      };

      await api.post('/quality-management/rca', payload);
      setToast({ message: 'RCA created successfully', type: 'success' });
      fetchRcas();
      handleCloseModal();
    } catch (error) {
      setToast({ message: 'Error creating RCA', type: 'error' });
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      defectRecordId: '',
      problemStatement: '',
      why1: '',
      why2: '',
      why3: '',
      why4: '',
      why5: '',
      rootCause: '',
      correctiveAction: '',
      preventiveAction: '',
      actionOwnerId: '',
      targetCompletionDate: '',
      status: 'OPEN'
    });
  };

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Root Cause Analysis (5 Whys)</h2>
          <p className="text-gray-600">Investigate defects and identify root causes</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          New RCA
        </button>
      </div>

      {/* RCA List */}
      <div className="space-y-4">
        {rcas.map((rca) => (
          <div key={rca.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg">Problem: {rca.problemStatement}</h3>
                <p className="text-sm text-gray-600">
                  Defect: {rca.defectRecord?.defectDescription}
                </p>
              </div>
              <span className="px-3 py-1 text-sm rounded bg-yellow-100 text-yellow-800">
                {rca.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              {rca.why1 && <div className="text-sm"><span className="font-medium">Why 1:</span> {rca.why1}</div>}
              {rca.why2 && <div className="text-sm"><span className="font-medium">Why 2:</span> {rca.why2}</div>}
              {rca.why3 && <div className="text-sm"><span className="font-medium">Why 3:</span> {rca.why3}</div>}
              {rca.why4 && <div className="text-sm"><span className="font-medium">Why 4:</span> {rca.why4}</div>}
              {rca.why5 && <div className="text-sm"><span className="font-medium">Why 5:</span> {rca.why5}</div>}
            </div>

            {rca.rootCause && (
              <div className="p-3 bg-red-50 rounded mb-4">
                <div className="font-medium text-red-900">Root Cause:</div>
                <div className="text-sm text-red-800">{rca.rootCause}</div>
              </div>
            )}

            {rca.correctiveAction && (
              <div className="p-3 bg-blue-50 rounded mb-2">
                <div className="font-medium text-blue-900">Corrective Action:</div>
                <div className="text-sm text-blue-800">{rca.correctiveAction}</div>
              </div>
            )}

            {rca.preventiveAction && (
              <div className="p-3 bg-green-50 rounded">
                <div className="font-medium text-green-900">Preventive Action:</div>
                <div className="text-sm text-green-800">{rca.preventiveAction}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create RCA Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title="Create Root Cause Analysis"
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Defect</label>
            <select
              value={formData.defectRecordId}
              onChange={(e) => setFormData({ ...formData, defectRecordId: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="">Select Defect</option>
              {defects.map(defect => (
                <option key={defect.id} value={defect.id}>
                  {defect.defectCategory?.categoryName} - {defect.defectDescription.substring(0, 50)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Problem Statement</label>
            <textarea
              value={formData.problemStatement}
              onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })}
              className="w-full border rounded px-3 py-2"
              rows="2"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">5 Whys Analysis</label>
            {[1, 2, 3, 4, 5].map(num => (
              <input
                key={num}
                type="text"
                placeholder={`Why ${num}?`}
                value={formData[`why${num}`]}
                onChange={(e) => setFormData({ ...formData, [`why${num}`]: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Root Cause</label>
            <textarea
              value={formData.rootCause}
              onChange={(e) => setFormData({ ...formData, rootCause: e.target.value })}
              className="w-full border rounded px-3 py-2"
              rows="2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Corrective Action</label>
            <textarea
              value={formData.correctiveAction}
              onChange={(e) => setFormData({ ...formData, correctiveAction: e.target.value })}
              className="w-full border rounded px-3 py-2"
              rows="2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preventive Action</label>
            <textarea
              value={formData.preventiveAction}
              onChange={(e) => setFormData({ ...formData, preventiveAction: e.target.value })}
              className="w-full border rounded px-3 py-2"
              rows="2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Action Owner</label>
              <select
                value={formData.actionOwnerId}
                onChange={(e) => setFormData({ ...formData, actionOwnerId: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select Owner</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.fullName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Date</label>
              <input
                type="date"
                value={formData.targetCompletionDate}
                onChange={(e) => setFormData({ ...formData, targetCompletionDate: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
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
              Create RCA
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default RootCauseAnalysis;
