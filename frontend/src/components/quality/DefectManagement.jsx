import { useState, useEffect } from 'react';
import { Plus, Edit2, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import Modal from '../Modal';
import Toast from '../Toast';

function DefectManagement() {
  const [defects, setDefects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    productionOrderId: '',
    equipmentId: '',
    defectCategoryId: '',
    defectDescription: '',
    quantity: '',
    location: '',
    status: 'OPEN'
  });

  useEffect(() => {
    fetchDefects();
    fetchCategories();
    fetchOrders();
    fetchEquipment();
  }, []);

  const fetchDefects = async () => {
    try {
      const response = await api.get('/quality-management/defects/recent?days=30');
      setDefects(response.data);
    } catch (error) {
      setToast({ message: 'Error fetching defects', type: 'error' });
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/quality-management/defect-categories/active');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
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
        productionOrder: formData.productionOrderId ? { id: parseInt(formData.productionOrderId) } : null,
        equipment: formData.equipmentId ? { id: parseInt(formData.equipmentId) } : null,
        defectCategory: { id: parseInt(formData.defectCategoryId) },
        quantity: parseInt(formData.quantity)
      };

      await api.post('/quality-management/defects', payload);
      setToast({ message: 'Defect recorded successfully', type: 'success' });
      fetchDefects();
      handleCloseModal();
    } catch (error) {
      setToast({ message: 'Error recording defect', type: 'error' });
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      productionOrderId: '',
      equipmentId: '',
      defectCategoryId: '',
      defectDescription: '',
      quantity: '',
      location: '',
      status: 'OPEN'
    });
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-300';
      case 'MAJOR': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'MINOR': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return 'bg-red-100 text-red-800';
      case 'INVESTIGATING': return 'bg-yellow-100 text-yellow-800';
      case 'RESOLVED': return 'bg-blue-100 text-blue-800';
      case 'CLOSED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalDefects = defects.reduce((sum, d) => sum + d.quantity, 0);
  const criticalDefects = defects.filter(d => d.defectCategory?.severity === 'CRITICAL').length;
  const openDefects = defects.filter(d => d.status === 'OPEN').length;

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Defect Management</h2>
          <p className="text-gray-600">Track and categorize product defects</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Record Defect
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-gray-900">{totalDefects}</div>
          <div className="text-sm text-gray-600">Total Defects (30 days)</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-red-600">{criticalDefects}</div>
          <div className="text-sm text-gray-600">Critical Defects</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-orange-600">{openDefects}</div>
          <div className="text-sm text-gray-600">Open Defects</div>
        </div>
      </div>

      {/* Defects Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {defects.map((defect) => (
              <tr key={defect.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {new Date(defect.detectedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium">{defect.defectCategory?.categoryName}</div>
                  <div className="text-xs text-gray-500">{defect.defectCategory?.categoryCode}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{defect.defectDescription}</div>
                  {defect.productionOrder && (
                    <div className="text-xs text-gray-500">Order: {defect.productionOrder.orderNumber}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {defect.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded border ${getSeverityColor(defect.defectCategory?.severity)}`}>
                    {defect.defectCategory?.severity}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded ${getStatusColor(defect.status)}`}>
                    {defect.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {defect.location || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Record Defect Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title="Record Defect"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Defect Category</label>
            <select
              value={formData.defectCategoryId}
              onChange={(e) => setFormData({ ...formData, defectCategoryId: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.categoryName} ({cat.severity})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.defectDescription}
              onChange={(e) => setFormData({ ...formData, defectDescription: e.target.value })}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Production Order (Optional)</label>
            <select
              value={formData.productionOrderId}
              onChange={(e) => setFormData({ ...formData, productionOrderId: e.target.value })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select Order</option>
              {orders.map(order => (
                <option key={order.id} value={order.id}>
                  {order.orderNumber} - {order.productName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Equipment (Optional)</label>
            <select
              value={formData.equipmentId}
              onChange={(e) => setFormData({ ...formData, equipmentId: e.target.value })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select Equipment</option>
              {equipment.map(eq => (
                <option key={eq.id} value={eq.id}>{eq.name}</option>
              ))}
            </select>
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
              Record Defect
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default DefectManagement;
