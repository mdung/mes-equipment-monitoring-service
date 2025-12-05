import React, { useEffect, useState } from 'react';
import { Plus, ClipboardCheck } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';
import Toast from '../components/Toast';

const QualityChecks = () => {
    const [checks, setChecks] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toast, setToast] = useState(null);
    const [formData, setFormData] = useState({
        productionOrderId: '',
        passedCount: '',
        rejectedCount: ''
    });

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/orders');
            setOrders(response.data);
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchChecksByOrder = async (orderId) => {
        try {
            const response = await api.get(`/quality/order/${orderId}`);
            setChecks(response.data);
        } catch (error) {
            console.error('Failed to fetch quality checks', error);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                productionOrder: { id: parseInt(formData.productionOrderId) },
                passedCount: parseInt(formData.passedCount),
                rejectedCount: parseInt(formData.rejectedCount)
            };
            await api.post('/quality', payload);
            showToast('Quality check recorded');
            setIsModalOpen(false);
            if (formData.productionOrderId) {
                fetchChecksByOrder(formData.productionOrderId);
            }
        } catch (error) {
            console.error('Failed to record quality check', error);
            showToast('Failed to record quality check', 'error');
        }
    };

    return (
        <div className="space-y-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Quality Checks</h2>
                <button onClick={() => setIsModalOpen(true)} className="btn btn-primary flex items-center gap-2">
                    <Plus size={18} /> Record Check
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {orders.map(order => {
                    const orderChecks = checks.filter(c => c.productionOrder?.id === order.id);
                    const totalPassed = orderChecks.reduce((sum, c) => sum + (c.passedCount || 0), 0);
                    const totalRejected = orderChecks.reduce((sum, c) => sum + (c.rejectedCount || 0), 0);
                    const total = totalPassed + totalRejected;
                    const passRate = total > 0 ? ((totalPassed / total) * 100).toFixed(1) : 0;

                    return (
                        <div key={order.id} className="card">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="font-bold">{order.orderNumber}</h3>
                                    <p className="text-sm text-secondary">{order.productName}</p>
                                </div>
                                <ClipboardCheck className="text-accent" size={20} />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-secondary">Pass Rate:</span>
                                    <span className={`font-semibold ${passRate >= 95 ? 'text-green-600' : passRate >= 85 ? 'text-yellow-600' : 'text-red-600'}`}>
                                        {passRate}%
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-secondary">Passed:</span>
                                    <span className="font-medium text-green-600">{totalPassed}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-secondary">Rejected:</span>
                                    <span className="font-medium text-red-600">{totalRejected}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-secondary">Checks:</span>
                                    <span className="font-medium">{orderChecks.length}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Quality Check">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Production Order</label>
                        <select
                            required
                            value={formData.productionOrderId}
                            onChange={(e) => setFormData({ ...formData, productionOrderId: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                        >
                            <option value="">Select Order</option>
                            {orders.filter(o => o.status === 'IN_PROGRESS').map(order => (
                                <option key={order.id} value={order.id}>
                                    {order.orderNumber} - {order.productName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Passed Count</label>
                        <input
                            type="number"
                            required
                            min="0"
                            value={formData.passedCount}
                            onChange={(e) => setFormData({ ...formData, passedCount: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Rejected Count</label>
                        <input
                            type="number"
                            required
                            min="0"
                            value={formData.rejectedCount}
                            onChange={(e) => setFormData({ ...formData, rejectedCount: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                    </div>
                    <div className="flex gap-2 pt-4">
                        <button type="submit" className="btn btn-primary flex-1">Record</button>
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn bg-slate-200 hover:bg-slate-300 flex-1">Cancel</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default QualityChecks;
