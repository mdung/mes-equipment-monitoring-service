import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import api from '../../services/api';
import Modal from '../Modal';
import Toast from '../Toast';

function QualityControlPlans() {
  const [plans, setPlans] = useState([]);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    planName: '',
    productId: '',
    description: '',
    version: '1.0',
    isActive: true
  });

  useEffect(() => {
    fetchPlans();
    fetchProducts();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await api.get('/quality-management/plans');
      setPlans(response.data);
    } catch (error) {
      setToast({ message: 'Error fetching plans', type: 'error' });
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        product: formData.productId ? { id: parseInt(formData.productId) } : null
      };

      if (editingPlan) {
        await api.put(`/quality-management/plans/${editingPlan.id}`, payload);
        setToast({ message: 'Plan updated successfully', type: 'success' });
      } else {
        await api.post('/quality-management/plans', payload);
        setToast({ message: 'Plan created successfully', type: 'success' });
      }

      fetchPlans();
      handleCloseModal();
    } catch (error) {
      setToast({ message: 'Error saving plan', type: 'error' });
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      planName: plan.planName,
      productId: plan.product?.id || '',
      description: plan.description || '',
      version: plan.version || '1.0',
      isActive: plan.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    
    try {
      await api.delete(`/quality-management/plans/${id}`);
      setToast({ message: 'Plan deleted successfully', type: 'success' });
      fetchPlans();
    } catch (error) {
      setToast({ message: 'Error deleting plan', type: 'error' });
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPlan(null);
    setFormData({
      planName: '',
      productId: '',
      description: '',
      version: '1.0',
      isActive: true
    });
  };

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Quality Control Plans</h2>
          <p className="text-gray-600">Define quality standards and inspection procedures</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          New Plan
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white p-4 rounded-lg shadow border">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{plan.planName}</h3>
                <p className="text-sm text-gray-600">{plan.product?.name || 'General'}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded ${plan.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {plan.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <p className="text-sm text-gray-700 mb-3">{plan.description}</p>
            
            <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
              <span>Version: {plan.version}</span>
              <span>{new Date(plan.createdAt).toLocaleDateString()}</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(plan)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(plan.id)}
                className="flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {plans.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No quality control plans yet. Create your first plan to get started.</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingPlan ? 'Edit Quality Control Plan' : 'Create Quality Control Plan'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
            <input
              type="text"
              value={formData.planName}
              onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product (Optional)</label>
            <select
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">General / All Products</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
              <input
                type="text"
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
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
              {editingPlan ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default QualityControlPlans;
