import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, Activity, Thermometer, Waves, Clock, Wrench, 
    ClipboardList, TrendingUp, AlertCircle, CheckCircle, Calendar
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import Toast from '../components/Toast';

const EquipmentDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [equipment, setEquipment] = useState(null);
    const [realtimeData, setRealtimeData] = useState([]);
    const [historicalLogs, setHistoricalLogs] = useState([]);
    const [downtimeHistory, setDowntimeHistory] = useState([]);
    const [maintenanceSchedule, setMaintenanceSchedule] = useState([]);
    const [productionOrders, setProductionOrders] = useState([]);
    const [oeeTrends, setOeeTrends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (id) {
            fetchEquipmentData();
        }
    }, [id, activeTab]);

    const fetchEquipmentData = async () => {
        setLoading(true);
        try {
            // Fetch equipment details
            const equipmentRes = await api.get(`/equipment/${id}`);
            setEquipment(equipmentRes.data);

            // Fetch data based on active tab
            switch (activeTab) {
                case 'realtime':
                    await fetchRealtimeMetrics();
                    break;
                case 'historical':
                    await fetchHistoricalLogs();
                    break;
                case 'downtime':
                    await fetchDowntimeHistory();
                    break;
                case 'maintenance':
                    await fetchMaintenanceSchedule();
                    break;
                case 'orders':
                    await fetchProductionOrders();
                    break;
                case 'oee':
                    await fetchOeeTrends();
                    break;
            }
        } catch (error) {
            console.error('Failed to fetch equipment data', error);
            showToast('Failed to fetch equipment data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchRealtimeMetrics = async () => {
        try {
            const response = await api.get(`/equipment/${id}/logs/recent`);
            // Generate mock real-time data
            const mockData = Array.from({ length: 20 }, (_, i) => ({
                time: `${i}:00`,
                temperature: 70 + Math.random() * 20,
                vibration: 3 + Math.random() * 5,
                output: Math.floor(Math.random() * 50) + 50
            }));
            setRealtimeData(mockData);
        } catch (error) {
            console.error('Failed to fetch realtime metrics', error);
        }
    };

    const fetchHistoricalLogs = async () => {
        try {
            const response = await api.get(`/equipment/${id}/logs`);
            setHistoricalLogs(response.data || []);
        } catch (error) {
            console.error('Failed to fetch historical logs', error);
        }
    };

    const fetchDowntimeHistory = async () => {
        try {
            const response = await api.get(`/downtime-events/equipment/${id}`);
            setDowntimeHistory(response.data || []);
        } catch (error) {
            console.error('Failed to fetch downtime history', error);
        }
    };

    const fetchMaintenanceSchedule = async () => {
        try {
            const response = await api.get(`/maintenance/equipment/${id}`);
            setMaintenanceSchedule(response.data || []);
        } catch (error) {
            console.error('Failed to fetch maintenance schedule', error);
        }
    };

    const fetchProductionOrders = async () => {
        try {
            const response = await api.get(`/production-orders/equipment/${id}`);
            setProductionOrders(response.data || []);
        } catch (error) {
            console.error('Failed to fetch production orders', error);
        }
    };

    const fetchOeeTrends = async () => {
        try {
            const endDate = new Date().toISOString();
            const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
            const response = await api.get(`/oee/trends/${id}?period=DAILY&start=${startDate}&end=${endDate}`);
            setOeeTrends(response.data || []);
        } catch (error) {
            console.error('Failed to fetch OEE trends', error);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'RUNNING': return 'bg-green-100 text-green-700';
            case 'IDLE': return 'bg-yellow-100 text-yellow-700';
            case 'DOWN': return 'bg-red-100 text-red-700';
            case 'MAINTENANCE': return 'bg-blue-100 text-blue-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Activity },
        { id: 'realtime', label: 'Real-time Metrics', icon: Thermometer },
        { id: 'historical', label: 'Historical Logs', icon: Clock },
        { id: 'downtime', label: 'Downtime History', icon: AlertCircle },
        { id: 'maintenance', label: 'Maintenance', icon: Wrench },
        { id: 'orders', label: 'Production Orders', icon: ClipboardList },
        { id: 'oee', label: 'OEE Trends', icon: TrendingUp }
    ];

    if (loading && !equipment) {
        return <div className="flex items-center justify-center h-64">Loading equipment details...</div>;
    }

    if (!equipment) {
        return <div className="text-center py-10">Equipment not found</div>;
    }

    return (
        <div className="space-y-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/equipment')} 
                        className="p-2 hover:bg-slate-100 rounded-lg">
                    <ArrowLeft size={20} />
                </button>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold">{equipment.name}</h2>
                    <p className="text-secondary text-sm">Code: {equipment.code}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(equipment.status)}`}>
                    {equipment.status}
                </span>
            </div>

            {/* Tabs */}
            <div className="card">
                <div className="flex gap-2 border-b pb-4 mb-4 overflow-x-auto">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                                    activeTab === tab.id
                                        ? 'bg-accent text-white'
                                        : 'bg-slate-100 hover:bg-slate-200'
                                }`}
                            >
                                <Icon size={18} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                <div className="min-h-[400px]">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Current Status</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between py-2 border-b">
                                            <span className="text-secondary">Status</span>
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(equipment.status)}`}>
                                                {equipment.status}
                                            </span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b">
                                            <span className="text-secondary">Location</span>
                                            <span className="font-medium">{equipment.location || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b">
                                            <span className="text-secondary">Equipment Code</span>
                                            <span className="font-medium">{equipment.code}</span>
                                        </div>
                                        <div className="flex justify-between py-2">
                                            <span className="text-secondary">Last Updated</span>
                                            <span className="font-medium">
                                                {equipment.updatedAt ? new Date(equipment.updatedAt).toLocaleString() : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Specifications</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between py-2 border-b">
                                            <span className="text-secondary">Ideal Cycle Time</span>
                                            <span className="font-medium">
                                                {equipment.idealCycleTime ? `${equipment.idealCycleTime}s` : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b">
                                            <span className="text-secondary">Created</span>
                                            <span className="font-medium">
                                                {equipment.createdAt ? new Date(equipment.createdAt).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="card bg-blue-50 border-blue-200">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Activity className="text-blue-600" size={24} />
                                        <span className="text-sm text-secondary">Uptime Today</span>
                                    </div>
                                    <p className="text-2xl font-bold text-blue-600">94.5%</p>
                                </div>
                                <div className="card bg-green-50 border-green-200">
                                    <div className="flex items-center gap-3 mb-2">
                                        <CheckCircle className="text-green-600" size={24} />
                                        <span className="text-sm text-secondary">Current OEE</span>
                                    </div>
                                    <p className="text-2xl font-bold text-green-600">78.3%</p>
                                </div>
                                <div className="card bg-purple-50 border-purple-200">
                                    <div className="flex items-center gap-3 mb-2">
                                        <TrendingUp className="text-purple-600" size={24} />
                                        <span className="text-sm text-secondary">Output Today</span>
                                    </div>
                                    <p className="text-2xl font-bold text-purple-600">1,245</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Real-time Metrics Tab */}
                    {activeTab === 'realtime' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <Thermometer size={20} />
                                        Temperature (°C)
                                    </h3>
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={realtimeData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="time" />
                                                <YAxis />
                                                <Tooltip />
                                                <Area type="monotone" dataKey="temperature" stroke="#ef4444" fill="#fecaca" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <Waves size={20} />
                                        Vibration (mm/s)
                                    </h3>
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={realtimeData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="time" />
                                                <YAxis />
                                                <Tooltip />
                                                <Area type="monotone" dataKey="vibration" stroke="#3b82f6" fill="#bfdbfe" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="lg:col-span-2">
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <Activity size={20} />
                                        Output Rate (units/hour)
                                    </h3>
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={realtimeData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="time" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Line type="monotone" dataKey="output" stroke="#10b981" strokeWidth={2} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Historical Logs Tab */}
                    {activeTab === 'historical' && (
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Equipment Logs</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 border-b">
                                        <tr>
                                            <th className="p-3 text-left">Timestamp</th>
                                            <th className="p-3 text-left">Event Type</th>
                                            <th className="p-3 text-left">Description</th>
                                            <th className="p-3 text-left">User</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {historicalLogs.length > 0 ? historicalLogs.map((log, index) => (
                                            <tr key={index} className="hover:bg-slate-50">
                                                <td className="p-3">{new Date(log.timestamp).toLocaleString()}</td>
                                                <td className="p-3">{log.eventType}</td>
                                                <td className="p-3">{log.description}</td>
                                                <td className="p-3">{log.performedBy || 'System'}</td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="4" className="p-8 text-center text-secondary">
                                                    No historical logs available
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Downtime History Tab */}
                    {activeTab === 'downtime' && (
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Downtime Events</h3>
                            <div className="space-y-3">
                                {downtimeHistory.length > 0 ? downtimeHistory.map((event, index) => (
                                    <div key={index} className="border rounded-lg p-4 hover:bg-slate-50">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <AlertCircle className="text-red-500" size={20} />
                                                <span className="font-semibold">{event.reason}</span>
                                            </div>
                                            <span className="text-sm text-secondary">
                                                {event.duration ? `${event.duration} min` : 'Ongoing'}
                                            </span>
                                        </div>
                                        <div className="text-sm text-secondary space-y-1">
                                            <p>Start: {new Date(event.startTime).toLocaleString()}</p>
                                            {event.endTime && (
                                                <p>End: {new Date(event.endTime).toLocaleString()}</p>
                                            )}
                                            {event.notes && <p>Notes: {event.notes}</p>}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-10 text-secondary">
                                        <CheckCircle className="mx-auto mb-2 text-green-500" size={48} />
                                        No downtime events recorded
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Maintenance Schedule Tab */}
                    {activeTab === 'maintenance' && (
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Maintenance Schedule</h3>
                            <div className="space-y-3">
                                {maintenanceSchedule.length > 0 ? maintenanceSchedule.map((schedule, index) => (
                                    <div key={index} className="border rounded-lg p-4 hover:bg-slate-50">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <Wrench className="text-blue-500" size={20} />
                                                <span className="font-semibold">{schedule.maintenanceType}</span>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                schedule.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                schedule.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {schedule.status}
                                            </span>
                                        </div>
                                        <div className="text-sm text-secondary space-y-1">
                                            <p className="flex items-center gap-2">
                                                <Calendar size={14} />
                                                Scheduled: {new Date(schedule.scheduledDate).toLocaleDateString()}
                                            </p>
                                            {schedule.description && <p>{schedule.description}</p>}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-10 text-secondary">
                                        No maintenance scheduled
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Production Orders Tab */}
                    {activeTab === 'orders' && (
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Associated Production Orders</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 border-b">
                                        <tr>
                                            <th className="p-3 text-left">Order Number</th>
                                            <th className="p-3 text-left">Product</th>
                                            <th className="p-3 text-left">Target Qty</th>
                                            <th className="p-3 text-left">Produced</th>
                                            <th className="p-3 text-left">Status</th>
                                            <th className="p-3 text-left">Due Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {productionOrders.length > 0 ? productionOrders.map((order, index) => (
                                            <tr key={index} className="hover:bg-slate-50">
                                                <td className="p-3 font-medium">{order.orderNumber}</td>
                                                <td className="p-3">{order.product?.name || 'N/A'}</td>
                                                <td className="p-3">{order.targetQuantity}</td>
                                                <td className="p-3">{order.producedQuantity || 0}</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                        order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                        order.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-gray-100 text-gray-700'
                                                    }`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="p-3">{new Date(order.endDate).toLocaleDateString()}</td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="6" className="p-8 text-center text-secondary">
                                                    No production orders found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* OEE Trends Tab */}
                    {activeTab === 'oee' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-4">OEE Trend (Last 30 Days)</h3>
                                <div className="h-80">
                                    {oeeTrends.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={oeeTrends}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis 
                                                    dataKey="periodStart" 
                                                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                                                />
                                                <YAxis />
                                                <Tooltip 
                                                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                                                />
                                                <Legend />
                                                <Line type="monotone" dataKey="avgOee" stroke="#8b5cf6" strokeWidth={2} name="OEE %" />
                                                <Line type="monotone" dataKey="avgAvailability" stroke="#3b82f6" name="Availability %" />
                                                <Line type="monotone" dataKey="avgPerformance" stroke="#10b981" name="Performance %" />
                                                <Line type="monotone" dataKey="avgQuality" stroke="#f59e0b" name="Quality %" />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-secondary">
                                            No OEE trend data available
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EquipmentDetails;
