import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, AlertTriangle, Clock, Settings, Plus, X } from 'lucide-react';
import api from '../services/api';
import Toast from '../components/Toast';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

const AlertManagement = () => {
    const [activeTab, setActiveTab] = useState('alerts');
    const [alerts, setAlerts] = useState([]);
    const [alertRules, setAlertRules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { user } = useAuth();

    const [ruleForm, setRuleForm] = useState({
        ruleName: '',
        ruleType: 'HIGH_TEMPERATURE',
        severity: 'MEDIUM',
        conditionField: 'temperature',
        conditionOperator: 'GT',
        conditionValue: '',
        notificationEmail: true,
        notificationSms: false,
        notificationWebsocket: true
    });

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'alerts') {
                const response = await api.get('/alerts');
                setAlerts(response.data);
            } else if (activeTab === 'rules') {
                const response = await api.get('/alerts/rules');
                setAlertRules(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch data', error);
            showToast('Failed to fetch data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const acknowledgeAlert = async (id) => {
        try {
            await api.put(`/alerts/${id}/acknowledge`, {
                acknowledgedBy: user.username,
                notes: 'Acknowledged via web interface'
            });
            showToast('Alert acknowledged');
            fetchData();
        } catch (error) {
            showToast('Failed to acknowledge alert', 'error');
        }
    };

    const resolveAlert = async (id) => {
        try {
            await api.put(`/alerts/${id}/resolve`, {
                resolvedBy: user.username,
                notes: 'Resolved via web interface'
            });
            showToast('Alert resolved');
            fetchData();
        } catch (error) {
            showToast('Failed to resolve alert', 'error');
        }
    };

    const handleCreateRule = async (e) => {
        e.preventDefault();
        try {
            await api.post('/alerts/rules', {
                ...ruleForm,
                conditionValue: parseFloat(ruleForm.conditionValue)
            });
            showToast('Alert rule created successfully');
            fetchData();
            setIsModalOpen(false);
            setRuleForm({
                ruleName: '',
                ruleType: 'HIGH_TEMPERATURE',
                severity: 'MEDIUM',
                conditionField: 'temperature',
                conditionOperator: 'GT',
                conditionValue: '',
                notificationEmail: true,
                notificationSms: false,
                notificationWebsocket: true
            });
        } catch (error) {
            showToast('Failed to create alert rule', 'error');
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'CRITICAL': return 'bg-red-100 text-red-700';
            case 'ERROR': return 'bg-red-100 text-red-700';
            case 'WARNING': return 'bg-yellow-100 text-yellow-700';
            case 'HIGH': return 'bg-orange-100 text-orange-700';
            case 'MEDIUM': return 'bg-blue-100 text-blue-700';
            case 'LOW': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusIcon = (alert) => {
        if (alert.resolved) {
            return <CheckCircle className="text-green-500" size={20} />;
        } else if (alert.acknowledged) {
            return <Clock className="text-blue-500" size={20} />;
        } else {
            return <AlertTriangle className="text-red-500" size={20} />;
        }
    };

    const tabs = [
        { id: 'alerts', label: 'Alert History', icon: Bell },
        { id: 'rules', label: 'Alert Rules', icon: Settings }
    ];

    return (
        <div className="space-y-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Alert Management</h2>
                {activeTab === 'rules' && (
                    <button onClick={() => setIsModalOpen(true)} className="btn btn-primary flex items-center gap-2">
                        <Plus size={18} /> Add Rule
                    </button>
                )}
            </div>

            <div className="card">
                <div className="flex gap-2 border-b pb-4 mb-4">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
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

                {loading ? (
                    <div className="text-center py-10">Loading...</div>
                ) : (
                    <>
                        {activeTab === 'alerts' && (
                            <div className="space-y-4">
                                {alerts.length === 0 ? (
                                    <div className="text-center py-10 text-secondary">
                                        No alerts found
                                    </div>
                                ) : (
                                    alerts.map(alert => (
                                        <div key={alert.id} className="border rounded-lg p-4 hover:bg-slate-50">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-3 flex-1">
                                                    {getStatusIcon(alert)}
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <h3 className="font-semibold">{alert.title}</h3>
                                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${getSeverityColor(alert.severity)}`}>
                                                                {alert.severity}
                                                            </span>
                                                        </div>
                                                        <p className="text-secondary text-sm mb-2">{alert.message}</p>
                                                        <div className="flex items-center gap-4 text-xs text-secondary">
                                                            <span>Equipment: {alert.equipmentName || 'N/A'}</span>
                                                            <span>Time: {new Date(alert.triggeredAt).toLocaleString()}</span>
                                                            {alert.acknowledgedBy && (
                                                                <span>Acknowledged by: {alert.acknowledgedBy}</span>
                                                            )}
                                                            {alert.resolvedBy && (
                                                                <span>Resolved by: {alert.resolvedBy}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    {!alert.acknowledged && (
                                                        <button
                                                            onClick={() => acknowledgeAlert(alert.id)}
                                                            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                                                        >
                                                            Acknowledge
                                                        </button>
                                                    )}
                                                    {alert.acknowledged && !alert.resolved && (
                                                        <button
                                                            onClick={() => resolveAlert(alert.id)}
                                                            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                                                        >
                                                            Resolve
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'rules' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 border-b">
                                        <tr>
                                            <th className="p-3">Rule Name</th>
                                            <th className="p-3">Type</th>
                                            <th className="p-3">Severity</th>
                                            <th className="p-3">Condition</th>
                                            <th className="p-3">Notifications</th>
                                            <th className="p-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {alertRules.map(rule => (
                                            <tr key={rule.id} className="hover:bg-slate-50">
                                                <td className="p-3 font-medium">{rule.ruleName}</td>
                                                <td className="p-3">{rule.ruleType}</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getSeverityColor(rule.severity)}`}>
                                                        {rule.severity}
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    {rule.conditionField} {rule.conditionOperator} {rule.conditionValue}
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex gap-1">
                                                        {rule.notificationEmail && <span className="px-1 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">Email</span>}
                                                        {rule.notificationSms && <span className="px-1 py-0.5 bg-green-100 text-green-700 rounded text-xs">SMS</span>}
                                                        {rule.notificationWebsocket && <span className="px-1 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">Web</span>}
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                        rule.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                        {rule.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Alert Rule">
                <form onSubmit={handleCreateRule} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Rule Name</label>
                        <input
                            type="text"
                            required
                            value={ruleForm.ruleName}
                            onChange={(e) => setRuleForm({ ...ruleForm, ruleName: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Rule Type</label>
                            <select
                                value={ruleForm.ruleType}
                                onChange={(e) => setRuleForm({ ...ruleForm, ruleType: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                            >
                                <option value="HIGH_TEMPERATURE">High Temperature</option>
                                <option value="HIGH_VIBRATION">High Vibration</option>
                                <option value="EQUIPMENT_DOWN">Equipment Down</option>
                                <option value="LOW_STOCK">Low Stock</option>
                                <option value="QUALITY_FAILURE">Quality Failure</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Severity</label>
                            <select
                                value={ruleForm.severity}
                                onChange={(e) => setRuleForm({ ...ruleForm, severity: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                            >
                                <option value="CRITICAL">Critical</option>
                                <option value="HIGH">High</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="LOW">Low</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <div>
                            <label className="block text-sm font-medium mb-1">Field</label>
                            <select
                                value={ruleForm.conditionField}
                                onChange={(e) => setRuleForm({ ...ruleForm, conditionField: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                            >
                                <option value="temperature">Temperature</option>
                                <option value="vibration">Vibration</option>
                                <option value="output">Output</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Operator</label>
                            <select
                                value={ruleForm.conditionOperator}
                                onChange={(e) => setRuleForm({ ...ruleForm, conditionOperator: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                            >
                                <option value="GT">Greater Than</option>
                                <option value="LT">Less Than</option>
                                <option value="EQ">Equal To</option>
                                <option value="GTE">Greater Than or Equal</option>
                                <option value="LTE">Less Than or Equal</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Value</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={ruleForm.conditionValue}
                                onChange={(e) => setRuleForm({ ...ruleForm, conditionValue: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Notification Methods</label>
                        <div className="space-y-2">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={ruleForm.notificationEmail}
                                    onChange={(e) => setRuleForm({ ...ruleForm, notificationEmail: e.target.checked })}
                                    className="mr-2"
                                />
                                Email Notification
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={ruleForm.notificationSms}
                                    onChange={(e) => setRuleForm({ ...ruleForm, notificationSms: e.target.checked })}
                                    className="mr-2"
                                />
                                SMS Notification
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={ruleForm.notificationWebsocket}
                                    onChange={(e) => setRuleForm({ ...ruleForm, notificationWebsocket: e.target.checked })}
                                    className="mr-2"
                                />
                                Web Notification
                            </label>
                        </div>
                    </div>
                    <div className="flex gap-2 pt-4">
                        <button type="submit" className="btn btn-primary flex-1">Create Rule</button>
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn bg-slate-200 hover:bg-slate-300 flex-1">Cancel</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AlertManagement;
