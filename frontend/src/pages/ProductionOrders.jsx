import React, { useEffect, useState } from 'react';
import { Plus, Calendar, Package, Play, CheckCircle, XCircle, BarChart3, List, Grid, ArrowUp, ArrowDown, PlayCircle, Square } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import websocketService from '../services/websocket';
import GanttChart from '../components/production/GanttChart';
import MaterialRequirements from '../components/production/MaterialRequirements';
import WorkInstructions from '../components/production/WorkInstructions';
import ProgressAttachments from '../components/production/ProgressAttachments';
import OrderDependencies from '../components/production/OrderDependencies';
import BulkActions from '../components/BulkActions';
import { useTranslation } from 'react-i18next';

const ProductionOrders = () => {
    const { t } = useTranslation();
    const [orders, setOrders] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // grid, list, gantt
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedOrders, setSelectedOrders] = useState([]);
    const [sortBy, setSortBy] = useState('priority'); // priority, date, status
    const [toast, setToast] = useState(null);
    const [formData, setFormData] = useState({
        orderNumber: '',
        productName: '',
        targetQuantity: '',
        equipmentId: '',
        status: 'PLANNED',
        priority: 5,
        scheduledStart: '',
        scheduledEnd: ''
    });

    useEffect(() => {
        fetchData();
        
        const subscription = websocketService.subscribe('/topic/production-metrics', (update) => {
            setOrders(prevOrders => 
                prevOrders.map(order => 
                    order.id === update.orderId 
                        ? { ...order, producedQuantity: update.producedQuantity }
                        : order
                )
            );
        });

        return () => {
            if (subscription) subscription.unsubscribe();
        };
    }, []);

    const fetchData = async () => {
        try {
            const [ordersRes, equipmentRes] = await Promise.all([
                api.get('/orders'),
                api.get('/equipment')
            ]);
            setOrders(ordersRes.data);
            setEquipment(equipmentRes.data);
        } catch (error) {
            console.error('Failed to fetch data', error);
            showToast('Failed to fetch data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleOpenModal = () => {
        setFormData({
            orderNumber: '',
            productName: '',
            targetQuantity: '',
            equipmentId: '',
            status: 'PLANNED',
            priority: 5,
            scheduledStart: '',
            scheduledEnd: ''
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                targetQuantity: parseInt(formData.targetQuantity),
                priority: parseInt(formData.priority),
                equipment: formData.equipmentId ? { id: parseInt(formData.equipmentId) } : null,
                scheduledStart: formData.scheduledStart || null,
                scheduledEnd: formData.scheduledEnd || null
            };
            await api.post('/orders', payload);
            showToast('Order created successfully');
            fetchData();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Failed to create order', error);
            showToast('Failed to create order', 'error');
        }
    };

    const handleStartOrder = async (id) => {
        try {
            await api.put(`/orders/${id}/start`);
            showToast('Order started');
            fetchData();
        } catch (error) {
            console.error('Failed to start order', error);
            showToast('Failed to start order', 'error');
        }
    };

    const handleCompleteOrder = async (id) => {
        try {
            await api.put(`/orders/${id}/complete`);
            showToast('Order completed');
            fetchData();
        } catch (error) {
            console.error('Failed to complete order', error);
            showToast('Failed to complete order', 'error');
        }
    };

    const handleCancelOrder = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;
        try {
            await api.put(`/orders/${id}/cancel`);
            showToast('Order cancelled');
            fetchData();
        } catch (error) {
            console.error('Failed to cancel order', error);
            showToast('Failed to cancel order', 'error');
        }
    };

    const handleBulkStart = async () => {
        try {
            await Promise.all(selectedOrders.map(id => api.put(`/orders/${id}/start`)));
            showToast(`${selectedOrders.length} orders started`);
            setSelectedOrders([]);
            fetchData();
        } catch (error) {
            console.error('Failed to start orders', error);
            showToast('Failed to start some orders', 'error');
        }
    };

    const handleBulkStop = async () => {
        if (!window.confirm(`Cancel ${selectedOrders.length} orders?`)) return;
        try {
            await Promise.all(selectedOrders.map(id => api.put(`/orders/${id}/cancel`)));
            showToast(`${selectedOrders.length} orders cancelled`);
            setSelectedOrders([]);
            fetchData();
        } catch (error) {
            console.error('Failed to cancel orders', error);
            showToast('Failed to cancel some orders', 'error');
        }
    };

    const handlePriorityChange = async (id, newPriority) => {
        try {
            await api.put(`/orders/${id}`, { priority: newPriority });
            fetchData();
        } catch (error) {
            console.error('Failed to update priority', error);
        }
    };

    const toggleSelectOrder = (id) => {
        setSelectedOrders(prev => 
            prev.includes(id) 
                ? prev.filter(oid => oid !== id)
                : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedOrders.length === orders.length) {
            setSelectedOrders([]);
        } else {
            setSelectedOrders(orders.map(o => o.id));
        }
    };

    const sortedOrders = [...orders].sort((a, b) => {
        if (sortBy === 'priority') {
            return (b.priority || 0) - (a.priority || 0);
        }
        if (sortBy === 'date') {
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return a.status.localeCompare(b.status);
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'COMPLETED': return 'bg-success/10 text-success';
            case 'IN_PROGRESS': return 'bg-accent/10 text-accent';
            case 'CANCELLED': return 'bg-danger/10 text-danger';
            default: return 'bg-secondary/10 text-secondary';
        }
    };

    const getPriorityColor = (priority) => {
        if (priority >= 8) return 'text-red-600 dark:text-red-400';
        if (priority >= 5) return 'text-orange-600 dark:text-orange-400';
        return 'text-blue-600 dark:text-blue-400';
    };

    return (
        <div className="space-y-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <div className="flex justify-between items-center flex-wrap gap-4">
                <h2 className="text-2xl font-bold dark:text-slate-200">Production Orders</h2>
                <div className="flex gap-2">
                    <div className="flex border dark:border-slate-700 rounded-lg overflow-hidden">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-accent text-white' : 'bg-white dark:bg-slate-800 dark:text-slate-200'}`}
                        >
                            <Grid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-2 ${viewMode === 'list' ? 'bg-accent text-white' : 'bg-white dark:bg-slate-800 dark:text-slate-200'}`}
                        >
                            <List size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('gantt')}
                            className={`px-3 py-2 ${viewMode === 'gantt' ? 'bg-accent text-white' : 'bg-white dark:bg-slate-800 dark:text-slate-200'}`}
                        >
                            <BarChart3 size={18} />
                        </button>
                    </div>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-2 border dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg"
                    >
                        <option value="priority">Sort by Priority</option>
                        <option value="date">Sort by Date</option>
                        <option value="status">Sort by Status</option>
                    </select>
                    <button onClick={handleOpenModal} className="btn btn-primary flex items-center gap-2">
                        <Plus size={18} /> Create Order
                    </button>
                </div>
            </div>

            {selectedOrders.length > 0 && (
                <BulkActions
                    selectedItems={selectedOrders.map(id => orders.find(o => o.id === id)).filter(Boolean)}
                    onDelete={handleBulkStop}
                    onClear={() => setSelectedOrders([])}
                    customActions={[
                        {
                            label: 'Start Selected',
                            icon: PlayCircle,
                            onClick: handleBulkStart,
                            className: 'bg-success'
                        }
                    ]}
                />
            )}

            {viewMode === 'gantt' ? (
                <GanttChart orders={sortedOrders} onOrderUpdate={fetchData} />
            ) : viewMode === 'list' ? (
                <div className="card">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-700">
                                <tr>
                                    <th className="p-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedOrders.length === orders.length && orders.length > 0}
                                            onChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th className="p-4 font-semibold text-sm dark:text-slate-300">Order</th>
                                    <th className="p-4 font-semibold text-sm dark:text-slate-300">Product</th>
                                    <th className="p-4 font-semibold text-sm dark:text-slate-300">Priority</th>
                                    <th className="p-4 font-semibold text-sm dark:text-slate-300">Status</th>
                                    <th className="p-4 font-semibold text-sm dark:text-slate-300">Progress</th>
                                    <th className="p-4 font-semibold text-sm dark:text-slate-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {sortedOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                                        <td className="p-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedOrders.includes(order.id)}
                                                onChange={() => toggleSelectOrder(order.id)}
                                            />
                                        </td>
                                        <td className="p-4 font-medium dark:text-slate-200">{order.orderNumber}</td>
                                        <td className="p-4 dark:text-slate-200">{order.productName}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handlePriorityChange(order.id, (order.priority || 0) + 1)}
                                                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                                                >
                                                    <ArrowUp size={14} />
                                                </button>
                                                <span className={`font-semibold ${getPriorityColor(order.priority || 0)}`}>
                                                    {order.priority || 0}
                                                </span>
                                                <button
                                                    onClick={() => handlePriorityChange(order.id, Math.max(0, (order.priority || 0) - 1))}
                                                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                                                >
                                                    <ArrowDown size={14} />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="w-32 bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                                                <div
                                                    className="bg-accent h-2 rounded-full transition-all"
                                                    style={{ width: `${Math.min(((order.producedQuantity || 0) / order.targetQuantity) * 100, 100)}%` }}
                                                ></div>
                                            </div>
                                            <div className="text-xs text-secondary dark:text-slate-400 mt-1">
                                                {order.producedQuantity || 0} / {order.targetQuantity}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                {order.status === 'PLANNED' && (
                                                    <button onClick={() => handleStartOrder(order.id)} className="p-1 text-success hover:bg-success/10 rounded">
                                                        <Play size={18} />
                                                    </button>
                                                )}
                                                {order.status === 'IN_PROGRESS' && (
                                                    <button onClick={() => handleCompleteOrder(order.id)} className="p-1 text-accent hover:bg-accent/10 rounded">
                                                        <CheckCircle size={18} />
                                                    </button>
                                                )}
                                                <button onClick={() => setSelectedOrder(order)} className="p-1 text-accent hover:bg-accent/10 rounded">
                                                    <Package size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <p>Loading...</p>
                    ) : sortedOrders.map((order) => (
                        <div key={order.id} className="card hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg dark:text-slate-200">{order.orderNumber}</h3>
                                    <p className="text-secondary dark:text-slate-400 text-sm">{order.productName}</p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                    <span className={`text-sm font-semibold ${getPriorityColor(order.priority || 0)}`}>
                                        Priority: {order.priority || 0}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm text-secondary dark:text-slate-400">
                                    <Package size={16} />
                                    <span>{order.producedQuantity || 0} / {order.targetQuantity} units</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                                    <div
                                        className="bg-accent h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(((order.producedQuantity || 0) / order.targetQuantity) * 100, 100)}%` }}
                                    ></div>
                                </div>
                                
                                <div className="flex gap-2 pt-2">
                                    {order.status === 'PLANNED' && (
                                        <button onClick={() => handleStartOrder(order.id)} className="flex-1 px-3 py-1.5 bg-green-500 text-white rounded text-sm hover:bg-green-600 flex items-center justify-center gap-1">
                                            <Play size={14} /> Start
                                        </button>
                                    )}
                                    {order.status === 'IN_PROGRESS' && (
                                        <button onClick={() => handleCompleteOrder(order.id)} className="flex-1 px-3 py-1.5 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 flex items-center justify-center gap-1">
                                            <CheckCircle size={14} /> Complete
                                        </button>
                                    )}
                                    {(order.status === 'PLANNED' || order.status === 'IN_PROGRESS') && (
                                        <button onClick={() => handleCancelOrder(order.id)} className="flex-1 px-3 py-1.5 bg-red-500 text-white rounded text-sm hover:bg-red-600 flex items-center justify-center gap-1">
                                            <XCircle size={14} /> Cancel
                                        </button>
                                    )}
                                    <button onClick={() => setSelectedOrder(order)} className="px-3 py-1.5 bg-accent text-white rounded text-sm hover:bg-accent/90">
                                        Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {!loading && sortedOrders.length === 0 && (
                        <div className="col-span-full text-center py-10 text-secondary dark:text-slate-400">
                            No production orders found.
                        </div>
                    )}
                </div>
            )}

            {/* Order Details Modal */}
            {selectedOrder && (
                <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={`Order: ${selectedOrder.orderNumber}`}>
                    <div className="space-y-6 max-h-[80vh] overflow-y-auto">
                        <MaterialRequirements orderId={selectedOrder.id} />
                        <WorkInstructions orderId={selectedOrder.id} productName={selectedOrder.productName} />
                        <ProgressAttachments orderId={selectedOrder.id} />
                        <OrderDependencies orderId={selectedOrder.id} orders={orders} />
                    </div>
                </Modal>
            )}

            {/* Create Order Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Production Order">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-slate-200">Order Number</label>
                        <input
                            type="text"
                            required
                            value={formData.orderNumber}
                            onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                            className="w-full px-3 py-2 border dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-slate-200">Product Name</label>
                        <input
                            type="text"
                            required
                            value={formData.productName}
                            onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                            className="w-full px-3 py-2 border dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-slate-200">Target Quantity</label>
                        <input
                            type="number"
                            required
                            min="1"
                            value={formData.targetQuantity}
                            onChange={(e) => setFormData({ ...formData, targetQuantity: e.target.value })}
                            className="w-full px-3 py-2 border dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-slate-200">Priority (0-10)</label>
                        <input
                            type="number"
                            min="0"
                            max="10"
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            className="w-full px-3 py-2 border dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-slate-200">Equipment (Optional)</label>
                        <select
                            value={formData.equipmentId}
                            onChange={(e) => setFormData({ ...formData, equipmentId: e.target.value })}
                            className="w-full px-3 py-2 border dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                        >
                            <option value="">Select Equipment</option>
                            {equipment.map(eq => (
                                <option key={eq.id} value={eq.id}>{eq.name} ({eq.code})</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-slate-200">Scheduled Start</label>
                            <input
                                type="datetime-local"
                                value={formData.scheduledStart}
                                onChange={(e) => setFormData({ ...formData, scheduledStart: e.target.value })}
                                className="w-full px-3 py-2 border dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-slate-200">Scheduled End</label>
                            <input
                                type="datetime-local"
                                value={formData.scheduledEnd}
                                onChange={(e) => setFormData({ ...formData, scheduledEnd: e.target.value })}
                                className="w-full px-3 py-2 border dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 pt-4">
                        <button type="submit" className="btn btn-primary flex-1">Create</button>
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 dark:text-slate-200 flex-1">Cancel</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ProductionOrders;
