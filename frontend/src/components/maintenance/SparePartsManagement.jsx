import { useState, useEffect } from 'react';
import { Plus, Edit2, AlertTriangle, Package } from 'lucide-react';
import api from '../../services/api';
import Modal from '../Modal';
import Toast from '../Toast';

function SparePartsManagement() {
  const [parts, setParts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [toast, setToast] = useState(null);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [formData, setFormData] = useState({
    partNumber: '',
    partName: '',
    description: '',
    category: '',
    unitPrice: '',
    quantityInStock: '',
    minimumStockLevel: '',
    location: '',
    supplier: ''
  });

  useEffect(() => {
    fetchParts();
  }, []);

  const fetchParts = async () => {
    try {
      const response = await api.get('/maintenance/spare-parts');
      setParts(response.data);
    } catch (error) {
      setToast({ message: 'Error fetching spare parts', type: 'error' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        unitPrice: parseFloat(formData.unitPrice),
        quantityInStock: parseInt(formData.quantityInStock),
        minimumStockLevel: parseInt(formData.minimumStockLevel)
      };

      if (editingPart) {
        await api.put(`/maintenance/spare-parts/${editingPart.id}`, payload);
        setToast({ message: 'Spare part updated successfully', type: 'success' });
      } else {
        await api.post('/maintenance/spare-parts', payload);
        setToast({ message: 'Spare part created successfully', type: 'success' });
      }

      fetchParts();
      handleCloseModal();
    } catch (error) {
      setToast({ message: 'Error saving spare part', type: 'error' });
    }
  };

  const handleEdit = (part) => {
    setEditingPart(part);
    setFormData({
      partNumber: part.partNumber,
      partName: part.partName,
      description: part.description || '',
      category: part.category || '',
      unitPrice: part.unitPrice.toString(),
      quantityInStock: part.quantityInStock.toString(),
      minimumStockLevel: part.minimumStockLevel.toString(),
      location: part.location || '',
      supplier: part.supplier || ''
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPart(null);
    setFormData({
      partNumber: '',
      partName: '',
      description: '',
      category: '',
      unitPrice: '',
      quantityInStock: '',
      minimumStockLevel: '',
      location: '',
      supplier: ''
    });
  };

  const filteredParts = showLowStockOnly 
    ? parts.filter(part => part.isLowStock)
    : parts;

  const lowStockCount = parts.filter(part => part.isLowStock).length;
  const totalValue = parts.reduce((sum, part) => sum + (part.unitPrice * part.quantityInStock), 0);

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Spare Parts Management</h2>
          <p className="text-gray-600">Track and manage spare parts inventory</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Spare Part
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{parts.length}</div>
              <div className="text-sm text-gray-600">Total Parts</div>
            </div>
            <Package className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-red-600">{lowStockCount}</div>
              <div className="text-sm text-gray-600">Low Stock Items</div>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">${totalValue.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Total Inventory Value</div>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockCount > 0 && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800">Low Stock Alert</h3>
              <p className="text-sm text-red-700">
                {lowStockCount} part(s) are below minimum stock level
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showLowStockOnly}
            onChange={(e) => setShowLowStockOnly(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm text-gray-700">Show low stock items only</span>
        </label>
      </div>

      {/* Parts Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Part Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Part Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredParts.map((part) => (
              <tr key={part.id} className={part.isLowStock ? 'bg-red-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{part.partNumber}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{part.partName}</div>
                  <div className="text-sm text-gray-500">{part.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{part.category || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm">
                    <span className={part.isLowStock ? 'text-red-600 font-semibold' : 'text-gray-900'}>
                      {part.quantityInStock}
                    </span>
                    <span className="text-gray-500"> / {part.minimumStockLevel}</span>
                  </div>
                  {part.isLowStock && (
                    <div className="text-xs text-red-600 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Low Stock
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">${part.unitPrice.toFixed(2)}</div>
                  <div className="text-xs text-gray-500">
                    Total: ${(part.unitPrice * part.quantityInStock).toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{part.location || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{part.supplier || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleEdit(part)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit2 className="w-4 h-4" />
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
        title={editingPart ? 'Edit Spare Part' : 'Add Spare Part'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Part Number</label>
              <input
                type="text"
                value={formData.partNumber}
                onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Part Name</label>
              <input
                type="text"
                value={formData.partName}
                onChange={(e) => setFormData({ ...formData, partName: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border rounded px-3 py-2"
              rows="2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="e.g., Bearings, Filters"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
              <input
                type="number"
                step="0.01"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity in Stock</label>
              <input
                type="number"
                value={formData.quantityInStock}
                onChange={(e) => setFormData({ ...formData, quantityInStock: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Stock Level</label>
              <input
                type="number"
                value={formData.minimumStockLevel}
                onChange={(e) => setFormData({ ...formData, minimumStockLevel: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="e.g., Warehouse A, Shelf 3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
              <input
                type="text"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
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
              {editingPart ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default SparePartsManagement;
