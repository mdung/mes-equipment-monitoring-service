import React, { useState, useEffect } from 'react';
import { Link2, Plus, X, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';

const OrderDependencies = ({ orderId, orders }) => {
  const { t } = useTranslation();
  const [dependencies, setDependencies] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDependency, setSelectedDependency] = useState('');

  useEffect(() => {
    if (orderId) {
      fetchDependencies();
    }
  }, [orderId]);

  const fetchDependencies = async () => {
    try {
      const res = await api.get(`/orders/${orderId}/dependencies`).catch(() => ({ data: [] }));
      setDependencies(res.data || []);
    } catch (error) {
      console.error('Error fetching dependencies:', error);
    }
  };

  const handleAddDependency = async () => {
    if (!selectedDependency) return;

    try {
      await api.post(`/orders/${orderId}/dependencies`, {
        dependsOnOrderId: parseInt(selectedDependency),
        dependencyType: 'PRECEDES' // or 'BLOCKS'
      });
      setShowAddModal(false);
      setSelectedDependency('');
      fetchDependencies();
    } catch (error) {
      console.error('Error adding dependency:', error);
    }
  };

  const handleRemoveDependency = async (dependencyId) => {
    if (!window.confirm('Remove this dependency?')) return;

    try {
      await api.delete(`/orders/${orderId}/dependencies/${dependencyId}`);
      fetchDependencies();
    } catch (error) {
      console.error('Error removing dependency:', error);
    }
  };

  const getDependencyStatus = (dependency) => {
    const dependentOrder = orders.find(o => o.id === dependency.dependsOnOrderId);
    if (!dependentOrder) return 'unknown';
    
    if (dependentOrder.status === 'COMPLETED') return 'ready';
    if (dependentOrder.status === 'IN_PROGRESS') return 'in-progress';
    if (dependentOrder.status === 'CANCELLED') return 'blocked';
    return 'waiting';
  };

  const availableOrders = orders.filter(o => o.id !== orderId && !dependencies.some(d => d.dependsOnOrderId === o.id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg dark:text-slate-200 flex items-center gap-2">
          <Link2 size={20} />
          Order Dependencies
        </h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-3 py-2 bg-accent text-white rounded hover:bg-accent/90 flex items-center gap-2 text-sm"
        >
          <Plus size={16} />
          Add Dependency
        </button>
      </div>

      {dependencies.length === 0 ? (
        <div className="text-center py-8 text-secondary dark:text-slate-400 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
          <Link2 size={48} className="mx-auto mb-2 text-slate-400" />
          <p>No dependencies defined</p>
          <p className="text-sm mt-1">This order can start independently</p>
        </div>
      ) : (
        <div className="space-y-2">
          {dependencies.map((dependency) => {
            const dependentOrder = orders.find(o => o.id === dependency.dependsOnOrderId);
            const status = getDependencyStatus(dependency);
            
            return (
              <div
                key={dependency.id}
                className="p-3 bg-slate-50 dark:bg-slate-900 rounded border dark:border-slate-700 flex items-center justify-between"
              >
                <div className="flex items-center gap-3 flex-1">
                  <ArrowRight size={20} className="text-secondary dark:text-slate-400" />
                  <div className="flex-1">
                    <div className="font-medium dark:text-slate-200">
                      {dependentOrder?.orderNumber || `Order #${dependency.dependsOnOrderId}`}
                    </div>
                    <div className="text-sm text-secondary dark:text-slate-400">
                      {dependentOrder?.productName || 'Unknown product'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      status === 'ready' ? 'bg-success/10 text-success' :
                      status === 'in-progress' ? 'bg-accent/10 text-accent' :
                      status === 'blocked' ? 'bg-danger/10 text-danger' :
                      'bg-warning/10 text-warning'
                    }`}>
                      {status === 'ready' ? 'Ready' :
                       status === 'in-progress' ? 'In Progress' :
                       status === 'blocked' ? 'Blocked' :
                       'Waiting'}
                    </span>
                    {dependentOrder && (
                      <span className={`px-2 py-1 rounded text-xs ${
                        dependentOrder.status === 'COMPLETED' ? 'bg-success/10 text-success' :
                        dependentOrder.status === 'IN_PROGRESS' ? 'bg-accent/10 text-accent' :
                        'bg-slate-200 dark:bg-slate-700 text-secondary dark:text-slate-400'
                      }`}>
                        {dependentOrder.status}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveDependency(dependency.id)}
                  className="p-1 text-danger hover:bg-danger/10 rounded ml-2"
                >
                  <X size={18} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4 dark:text-slate-200">Add Dependency</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-200">
                  This order depends on:
                </label>
                <select
                  value={selectedDependency}
                  onChange={(e) => setSelectedDependency(e.target.value)}
                  className="w-full px-3 py-2 border dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg"
                >
                  <option value="">Select an order</option>
                  {availableOrders.map(order => (
                    <option key={order.id} value={order.id}>
                      {order.orderNumber} - {order.productName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleAddDependency}
                  className="flex-1 px-4 py-2 bg-accent text-white rounded hover:bg-accent/90"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedDependency('');
                  }}
                  className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded hover:bg-slate-300 dark:hover:bg-slate-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDependencies;

