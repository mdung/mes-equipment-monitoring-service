import React, { useState, useEffect } from 'react';
import { Link2, Webhook, Key, Database, Server, Activity, Plus, TestTube, Trash2 } from 'lucide-react';
import api from '../services/api';
import Toast from '../components/Toast';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

const IntegrationAPIs = () => {
    const [activeTab, setActiveTab] = useState('systems');
    const [externalSystems, setExternalSystems] = useState([]);
    const [webhooks, setWebhooks] = useState([]);
    const [apiKeys, setApiKeys] = useState([]);
    const [integrationLogs, setIntegrationLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('');
    const { user } = useAuth();

    const [systemForm, setSystemForm] = useState({
        systemName: '',
        systemType: 'ERP',
        description: '',
        baseUrl: '',
        apiKey: '',
        authenticationType: 'API_KEY',
        syncIntervalMinutes: 5
    });

    const [webhookForm, setWebhookForm] = useState({
        webhookName: '',
        webhookUrl: '',
        eventType: 'EQUIPMENT_STATUS_CHANGE',
        httpMethod: 'POST',
        isActive: true
    });

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            switch (activeTab) {
                case 'systems':
                    const systemsResponse = await api.get('/integration/systems');
                    setExternalSystems(systemsResponse.data);
                    break;
                case 'webhooks':
                    const webhooksResponse = await api.get('/webhooks');
                    setWebhooks(webhooksResponse.data);
                    break;
                case 'api-keys':
                    const keysResponse = await api.get('/api-keys');
                    setApiKeys(keysResponse.data);
                    break;
                case 'logs':
                    const logsResponse = await api.get('/integration/logs/date-range?start=' + 
                        new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() + '&end=' + new Date().toISOString());
                    setIntegrationLogs(logsResponse.data);
                    break;
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

    const handleCreateSystem = async (e) => {
        e.preventDefault();
        try {
            await api.post('/integration/systems', systemForm);
            showToast('External system created successfully');
            fetchData();
            setIsModalOpen(false);
            resetSystemForm();
        } catch (error) {
            showToast('Failed to create system', 'error');
        }
    };

    const handleCreateWebhook = async (e) => {
        e.preventDefault();
        try {
            await api.post('/webhooks', webhookForm);
            showToast('Webhook created successfully');
            fetchData();
            setIsModalOpen(false);
            resetWebhookForm();
        } catch (error) {
            showToast('Failed to create webhook', 'error');
        }
    };

    const testConnection = async (id) => {
        try {
            const response = await api.post(`/integration/systems/${id}/test-connection`);
            showToast(response.data.connected ? 'Connection successful' : 'Connection failed', 
                     response.data.connected ? 'success' : 'error');
            fetchData();
        } catch (error) {
            showToast('Connection test failed', 'error');
        }
    };

    const testWebhook = async (id) => {
        try {
            const response = await api.post(`/webhooks/${id}/test`);
            showToast(response.data.success ? 'Webhook test successful' : 'Webhook test failed',
                     response.data.success ? 'success' : 'error');
        } catch (error) {
            showToast('Webhook test failed', 'error');
        }
    };

    const deleteSystem = async (id) => {
        if (window.confirm('Are you sure you want to delete this system?')) {
            try {
                await api.delete(`/integration/systems/${id}`);
                showToast('System deleted successfully');
                fetchData();
            } catch (error) {
                showToast('Failed to delete system', 'error');
            }
        }
    };

    const resetSystemForm = () => {
        setSystemForm({
            systemName: '',
            systemType: 'ERP',
            description: '',
            baseUrl: '',
            apiKey: '',
            authenticationType: 'API_KEY',
            syncIntervalMinutes: 5
        });
    };

    const resetWebhookForm = () => {
        setWebhookForm({
            webhookName: '',
            webhookUrl: '',
            eventType: 'EQUIPMENT_STATUS_CHANGE',
            httpMethod: 'POST',
            isActive: true
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'CONNECTED': return 'bg-green-100 text-green-700';
            case 'DISCONNECTED': return 'bg-gray-100 text-gray-700';
            case 'ERROR': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const tabs = [
        { id: 'systems', label: 'External Systems', icon: Server },
        { id: 'webhooks', label: 'Webhooks', icon: Webhook },
        { id: 'api-keys', label: 'API Keys', icon: Key },
        { id: 'logs', label: 'Integration Logs', icon: Activity }
    ];

    return (
        <div className="space-y-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Integration APIs</h2>
                {(activeTab === 'systems' || activeTab === 'webhooks') && (
                    <button onClick={() => { setModalType(activeTab); setIsModalOpen(true); }} 
                            className="btn btn-primary flex items-center gap-2">
                        <Plus size={18} /> Add {activeTab === 'systems' ? 'System' : 'Webhook'}
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
                                    activeTab === tab.id ? 'bg-accent text-white' : 'bg-slate-100 hover:bg-slate-200'
                                }`}>
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
                        {activeTab === 'systems' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 border-b">
                                        <tr>
                                            <th className="p-3">System Name</th>
                                            <th className="p-3">Type</th>
                                            <th className="p-3">Base URL</th>
                                            <th className="p-3">Status</th>
                                            <th className="p-3">Last Sync</th>
                                            <th className="p-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {externalSystems.map(system => (
                                            <tr key={system.id} className="hover:bg-slate-50">
                                                <td className="p-3 font-medium">{system.systemName}</td>
                                                <td className="p-3">{system.systemType}</td>
                                                <td className="p-3 text-xs text-secondary">{system.baseUrl || 'N/A'}</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(system.connectionStatus)}`}>
                                                        {system.connectionStatus}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-xs">{system.lastSync ? new Date(system.lastSync).toLocaleString() : 'Never'}</td>
                                                <td className="p-3">
                                                    <div className="flex gap-2">
                                                        <button onClick={() => testConnection(system.id)} 
                                                                className="p-1 hover:bg-slate-200 rounded" title="Test Connection">
                                                            <TestTube size={16} />
                                                        </button>
                                                        <button onClick={() => deleteSystem(system.id)} 
                                                                className="p-1 hover:bg-red-100 rounded text-red-600" title="Delete">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {externalSystems.length === 0 && (
                                    <div className="text-center py-10 text-secondary">No external systems configured</div>
                                )}
                            </div>
                        )}

                        {activeTab === 'webhooks' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 border-b">
                                        <tr>
                                            <th className="p-3">Webhook Name</th>
                                            <th className="p-3">URL</th>
                                            <th className="p-3">Event Type</th>
                                            <th className="p-3">Method</th>
                                            <th className="p-3">Status</th>
                                            <th className="p-3">Success/Fail</th>
                                            <th className="p-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {webhooks.map(webhook => (
                                            <tr key={webhook.id} className="hover:bg-slate-50">
                                                <td className="p-3 font-medium">{webhook.webhookName}</td>
                                                <td className="p-3 text-xs text-secondary">{webhook.webhookUrl}</td>
                                                <td className="p-3">{webhook.eventType}</td>
                                                <td className="p-3">{webhook.httpMethod}</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                        webhook.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                        {webhook.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-xs">{webhook.successCount || 0} / {webhook.failureCount || 0}</td>
                                                <td className="p-3">
                                                    <button onClick={() => testWebhook(webhook.id)} 
                                                            className="p-1 hover:bg-slate-200 rounded" title="Test Webhook">
                                                        <TestTube size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {webhooks.length === 0 && (
                                    <div className="text-center py-10 text-secondary">No webhooks configured</div>
                                )}
                            </div>
                        )}

                        {activeTab === 'api-keys' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 border-b">
                                        <tr>
                                            <th className="p-3">Key Name</th>
                                            <th className="p-3">API Key</th>
                                            <th className="p-3">Status</th>
                                            <th className="p-3">Usage Count</th>
                                            <th className="p-3">Last Used</th>
                                            <th className="p-3">Expires</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {apiKeys.map(key => (
                                            <tr key={key.id} className="hover:bg-slate-50">
                                                <td className="p-3 font-medium">{key.keyName}</td>
                                                <td className="p-3 font-mono text-xs">{key.apiKey.substring(0, 20)}...</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                        key.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                        {key.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="p-3">{key.usageCount || 0}</td>
                                                <td className="p-3 text-xs">{key.lastUsed ? new Date(key.lastUsed).toLocaleString() : 'Never'}</td>
                                                <td className="p-3 text-xs">{key.expiresAt ? new Date(key.expiresAt).toLocaleDateString() : 'Never'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {apiKeys.length === 0 && (
                                    <div className="text-center py-10 text-secondary">No API keys created</div>
                                )}
                            </div>
                        )}

                        {activeTab === 'logs' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 border-b">
                                        <tr>
                                            <th className="p-3">Timestamp</th>
                                            <th className="p-3">Type</th>
                                            <th className="p-3">Operation</th>
                                            <th className="p-3">Direction</th>
                                            <th className="p-3">Status</th>
                                            <th className="p-3">Duration</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {integrationLogs.map(log => (
                                            <tr key={log.id} className="hover:bg-slate-50">
                                                <td className="p-3 text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                                                <td className="p-3">{log.integrationType}</td>
                                                <td className="p-3">{log.operation}</td>
                                                <td className="p-3">{log.direction}</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                        log.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                        {log.status}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-xs">{log.durationMs}ms</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {integrationLogs.length === 0 && (
                                    <div className="text-center py-10 text-secondary">No integration logs found</div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Create System Modal */}
            <Modal isOpen={isModalOpen && modalType === 'systems'} onClose={() => setIsModalOpen(false)} title="Add External System">
                <form onSubmit={handleCreateSystem} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">System Name</label>
                        <input type="text" required value={systemForm.systemName}
                               onChange={(e) => setSystemForm({ ...systemForm, systemName: e.target.value })}
                               className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">System Type</label>
                        <select value={systemForm.systemType}
                                onChange={(e) => setSystemForm({ ...systemForm, systemType: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent">
                            <option value="ERP">ERP</option>
                            <option value="SCADA">SCADA</option>
                            <option value="PLC">PLC</option>
                            <option value="SENSOR">Sensor</option>
                            <option value="CUSTOM">Custom</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Base URL</label>
                        <input type="url" value={systemForm.baseUrl}
                               onChange={(e) => setSystemForm({ ...systemForm, baseUrl: e.target.value })}
                               className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea value={systemForm.description}
                                  onChange={(e) => setSystemForm({ ...systemForm, description: e.target.value })}
                                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent" rows="3" />
                    </div>
                    <div className="flex gap-2 pt-4">
                        <button type="submit" className="btn btn-primary flex-1">Create System</button>
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn bg-slate-200 hover:bg-slate-300 flex-1">Cancel</button>
                    </div>
                </form>
            </Modal>

            {/* Create Webhook Modal */}
            <Modal isOpen={isModalOpen && modalType === 'webhooks'} onClose={() => setIsModalOpen(false)} title="Add Webhook">
                <form onSubmit={handleCreateWebhook} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Webhook Name</label>
                        <input type="text" required value={webhookForm.webhookName}
                               onChange={(e) => setWebhookForm({ ...webhookForm, webhookName: e.target.value })}
                               className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Webhook URL</label>
                        <input type="url" required value={webhookForm.webhookUrl}
                               onChange={(e) => setWebhookForm({ ...webhookForm, webhookUrl: e.target.value })}
                               className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Event Type</label>
                        <select value={webhookForm.eventType}
                                onChange={(e) => setWebhookForm({ ...webhookForm, eventType: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent">
                            <option value="EQUIPMENT_STATUS_CHANGE">Equipment Status Change</option>
                            <option value="PRODUCTION_ORDER_COMPLETE">Production Order Complete</option>
                            <option value="QUALITY_CHECK_FAIL">Quality Check Fail</option>
                            <option value="ALERT_TRIGGERED">Alert Triggered</option>
                        </select>
                    </div>
                    <div className="flex gap-2 pt-4">
                        <button type="submit" className="btn btn-primary flex-1">Create Webhook</button>
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn bg-slate-200 hover:bg-slate-300 flex-1">Cancel</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default IntegrationAPIs;
